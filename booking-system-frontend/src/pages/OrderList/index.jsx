// 订单列表页面
import { Card, Table, Tag, Button, Space, message, Modal, Descriptions, Tabs, Statistic } from 'antd'
import { useEffect, useCallback, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, SyncOutlined, QrcodeOutlined } from '@ant-design/icons'
import { getOrderList, cancelOrder } from '../../store/slices/orderSlice'
import { formatDateTime, formatPrice, getOrderStatus, formatIdCard } from '../../utils/format'
import { ORDER_STATUS, PAGINATION, ORDER_TIMEOUT } from '../../utils/constants'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'
import Loading from '../../components/Loading'
import ETicketDetail from '../../components/ETicketDetail'
import dayjs from 'dayjs'
import './style.css'

const { Countdown } = Statistic


function OrderList() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { orderList, loading, pagination } = useSelector((state) => state.order)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [eTicketModalVisible, setETicketModalVisible] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)

  const loadOrders = useCallback((page = PAGINATION.DEFAULT_PAGE, pageSize = PAGINATION.DEFAULT_PAGE_SIZE) => {
    dispatch(getOrderList({ page, pageSize }))
  }, [dispatch])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const handleCancelOrder = useCallback(async (orderId, isTimeout = false) => {
    try {
      await dispatch(cancelOrder(orderId)).unwrap()
      if (isTimeout) {
        message.warning('订单已超时自动取消')
      } else {
        message.success('订单已取消')
      }
      loadOrders(pagination.current, pagination.pageSize)
    } catch (error) {
      if (!isTimeout) {
        message.error('取消订单失败')
      }
    }
  }, [dispatch, loadOrders, pagination.current, pagination.pageSize])
  
  // 计算订单的倒计时截止时间
  const getOrderDeadline = useCallback((order) => {
    if ((order.orderStatus ?? order.status) !== ORDER_STATUS.PENDING) {
      return null
    }
    const createTime = dayjs(order.createTime).valueOf()
    return createTime + ORDER_TIMEOUT
  }, [])

  // 判断订单是否为超时取消
  const isOrderTimeout = useCallback((order) => {
    const status = order.orderStatus ?? order.status
    if (status !== ORDER_STATUS.CANCELLED) {
      return false
    }
    // 如果订单状态为已取消，且创建时间 + 15分钟 < 更新时间，则认为是超时取消
    const createTime = dayjs(order.createTime)
    const updateTime = dayjs(order.updateTime || order.createTime)
    const deadline = createTime.add(ORDER_TIMEOUT, 'millisecond')
    // 如果没有支付时间且更新时间在截止时间附近，则为超时
    if (!order.payTime && updateTime.isAfter(deadline.subtract(1, 'minute'))) {
      return true
    }
    return false
  }, [])

  const handleTableChange = useCallback((newPagination) => {
    loadOrders(newPagination.current, newPagination.pageSize)
  }, [loadOrders])

  const handleViewDetail = useCallback((orderId) => {
    const fullOrder = orderList.find((order) => (order.orderId ?? order.id) === orderId)
    if (fullOrder) {
      setSelectedOrder(fullOrder)
      setDetailModalVisible(true)
    }
  }, [orderList])

  const handleViewETicket = useCallback((ticket, order) => {
    setSelectedTicket({ ticket, order })
    setETicketModalVisible(true)
  }, [])

  // 根据标签页筛选订单
  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return orderList
    if (activeTab === 'pending') {
      return orderList.filter(order => 
        (order.orderStatus ?? order.status) === ORDER_STATUS.PENDING
      )
    }
    if (activeTab === 'paid') {
      return orderList.filter(order => {
        const status = order.orderStatus ?? order.status
        // 已支付但发车时间未过的订单
        if (status === ORDER_STATUS.PAID) {
          const departureTime = order.departureTime
          if (departureTime && dayjs(departureTime).isBefore(dayjs())) {
            return false // 发车时间已过，不显示在已支付中
          }
          return true
        }
        return false
      })
    }
    if (activeTab === 'completed') {
      return orderList.filter(order => {
        const status = order.orderStatus ?? order.status
        // 已支付且发车时间已过的订单显示为已完成
        if (status === ORDER_STATUS.PAID) {
          const departureTime = order.departureTime
          return departureTime && dayjs(departureTime).isBefore(dayjs())
        }
        return false
      })
    }
    if (activeTab === 'cancelled') {
      // 已取消包含：支付取消(2)和退票(4)
      return orderList.filter(order => {
        const status = order.orderStatus ?? order.status
        return status === ORDER_STATUS.CANCELLED || status === ORDER_STATUS.REFUNDED
      })
    }
    return orderList
  }, [orderList, activeTab])

  const displayOrderList = useMemo(
    () => filteredOrders.map((order) => ({
      id: order.orderId ?? order.id,
      orderNo: order.orderNumber ?? order.orderNo,
      tripNo: order.tripNumber ?? order.tripNo,
      fromStation: order.departureStation ?? order.fromStation,
      toStation: order.arrivalStation ?? order.toStation,
      departureTime: order.departureTime ?? order.createTime,
      totalPrice: order.totalAmount ?? order.totalPrice,
      status: order.orderStatus ?? order.status,
    })),
    [filteredOrders]
  )

  // 计算各状态订单数量
  const orderCounts = useMemo(() => {
    const counts = {
      all: orderList.length,
      pending: 0,
      paid: 0,
      completed: 0,
      cancelled: 0,
    }
    orderList.forEach(order => {
      const status = order.orderStatus ?? order.status
      const departureTime = order.departureTime
      const isDeparted = departureTime && dayjs(departureTime).isBefore(dayjs())
      
      if (status === ORDER_STATUS.PENDING) counts.pending++
      if (status === ORDER_STATUS.PAID && !isDeparted) counts.paid++
      if (status === ORDER_STATUS.PAID && isDeparted) counts.completed++
      if (status === ORDER_STATUS.CANCELLED || status === ORDER_STATUS.REFUNDED) counts.cancelled++
    })
    return counts
  }, [orderList])

  const columns = useMemo(() => [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      width: '18%',
      align: 'center',
    },
    {
      title: '车次',
      dataIndex: 'tripNo',
      width: '10%',
      align: 'center',
    },
    {
      title: '出发站',
      dataIndex: 'fromStation',
      width: '10%',
      align: 'center',
    },
    {
      title: '到达站',
      dataIndex: 'toStation',
      width: '10%',
      align: 'center',
    },
    {
      title: '出发时间',
      dataIndex: 'departureTime',
      width: '15%',
      align: 'center',
      render: (time) => formatDateTime(time),
    },
    {
      title: '订单金额',
      dataIndex: 'totalPrice',
      width: '10%',
      align: 'center',
      render: (price) => formatPrice(price),
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      width: '12%',
      align: 'center',
      render: (status, record) => {
        const originalOrder = orderList.find(o => (o.orderId ?? o.id) === record.id)
        const deadline = originalOrder ? getOrderDeadline(originalOrder) : null
        
        // 检查是否已发车（已完成）
        if (status === ORDER_STATUS.PAID && record.departureTime) {
          const isDeparted = dayjs(record.departureTime).isBefore(dayjs())
          if (isDeparted) {
            return <Tag color="blue">已完成</Tag>
          }
        }
        
        // 检查是否为超时取消
        if (status === ORDER_STATUS.CANCELLED && originalOrder && isOrderTimeout(originalOrder)) {
          return <Tag color="volcano">已超时</Tag>
        }
        
        const statusInfo = getOrderStatus(status)
        
        if (status === ORDER_STATUS.PENDING && deadline) {
          const now = Date.now()
          if (now >= deadline) {
            // 已超时，触发自动取消
            setTimeout(() => handleCancelOrder(record.id, true), 100)
            return <Tag color="volcano">已超时</Tag>
          }
          return (
            <Space direction="vertical" size={0} style={{ textAlign: 'center' }}>
              <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
              <Countdown
                value={deadline}
                format="mm:ss"
                valueStyle={{ fontSize: '12px', color: '#ff4d4f', lineHeight: '16px' }}
                onFinish={() => handleCancelOrder(record.id, true)}
              />
            </Space>
          )
        }
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      width: '15%',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          {record.status === ORDER_STATUS.PENDING && (
            <Button 
              type="link" 
              size="small"
              onClick={() => navigate(`/payment?orderId=${record.id}`)}
            >
              去支付
            </Button>
          )}
          {record.status === ORDER_STATUS.PENDING && (
            <Button
              type="link"
              danger
              size="small"
              onClick={() => handleCancelOrder(record.id, false)}
            >
              取消
            </Button>
          )}
          <Button
            type="link"
            size="small"
            onClick={() => handleViewDetail(record.id)}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ], [handleCancelOrder, handleViewDetail, navigate, getOrderDeadline, isOrderTimeout, orderList])

  if (loading && orderList.length === 0) {
    return (
      <div className="page-order-list page-container">
        <Card className="page-card" variant="borderless">
          <Loading tip="加载订单中..." />
        </Card>
      </div>
    )
  }

  // 标签页文本映射
  const tabTextMap = {
    all: '全部',
    pending: '待支付',
    paid: '已支付',
    completed: '已完成',
    cancelled: '已取消',
  }

  const tabItems = [
    {
      key: 'all',
      label: (
        <span>
          <SyncOutlined /> 全部订单 {orderCounts.all > 0 && <Tag>{orderCounts.all}</Tag>}
        </span>
      ),
    },
    {
      key: 'pending',
      label: (
        <span>
          <ClockCircleOutlined /> 待支付 {orderCounts.pending > 0 && <Tag color="orange">{orderCounts.pending}</Tag>}
        </span>
      ),
    },
    {
      key: 'paid',
      label: (
        <span>
          <CheckCircleOutlined /> 已支付 {orderCounts.paid > 0 && <Tag color="blue">{orderCounts.paid}</Tag>}
        </span>
      ),
    },
    {
      key: 'completed',
      label: (
        <span>
          <CheckCircleOutlined /> 已完成 {orderCounts.completed > 0 && <Tag color="green">{orderCounts.completed}</Tag>}
        </span>
      ),
    },
    {
      key: 'cancelled',
      label: (
        <span>
          <CloseCircleOutlined /> 已取消 {orderCounts.cancelled > 0 && <Tag color="red">{orderCounts.cancelled}</Tag>}
        </span>
      ),
    },
  ]

  return (
    <div className="page-order-list page-container">
      <Card className="page-card" variant="borderless">
        <PageHeader
          title="我的订单"
          subtitle="查看历史订单和当前订单状态，支持退票、改签等操作"
        />
        
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={tabItems}
          className="order-tabs"
        />
        
        {displayOrderList.length === 0 ? (
          <EmptyState
            description={activeTab === 'all' ? "您还没有订单" : `没有${tabTextMap[activeTab]}订单`}
            actionText="去订票"
            actionPath="/tickets"
          />
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={displayOrderList}
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
            onChange={handleTableChange}
            size="middle"
          />
        )}
        <Modal
          title="订单详情"
          open={detailModalVisible}
          onCancel={() => {
            setDetailModalVisible(false)
            setSelectedOrder(null)
          }}
          footer={null}
          width={720}
        >
          {selectedOrder && (
            <>
              <Descriptions
                column={2}
                size="small"
                bordered
                styles={{ label: { fontWeight: '600', width: '120px' } }}
              >
                <Descriptions.Item label="订单号">
                  {selectedOrder.orderNumber || selectedOrder.orderNo}
                </Descriptions.Item>
                <Descriptions.Item label="订单状态">
                  {selectedOrder.orderStatusText || getOrderStatus(selectedOrder.orderStatus)?.text}
                </Descriptions.Item>
                <Descriptions.Item label="车次">
                  {selectedOrder.tripNumber || selectedOrder.tripNo}
                </Descriptions.Item>
                <Descriptions.Item label="订单金额">
                  {formatPrice(selectedOrder.totalAmount || selectedOrder.totalPrice)}
                </Descriptions.Item>
                <Descriptions.Item label="出发站">
                  {selectedOrder.departureStation || selectedOrder.fromStation}
                </Descriptions.Item>
                <Descriptions.Item label="到达站">
                  {selectedOrder.arrivalStation || selectedOrder.toStation}
                </Descriptions.Item>
                <Descriptions.Item label="出发时间" span={2}>
                  {formatDateTime(selectedOrder.departureTime)}
                </Descriptions.Item>
                {selectedOrder.payTime && (
                  <Descriptions.Item label="支付时间" span={2}>
                    {formatDateTime(selectedOrder.payTime)}
                  </Descriptions.Item>
                )}
              </Descriptions>
              {Array.isArray(selectedOrder.tickets) && selectedOrder.tickets.length > 0 && (
                <Table
                  style={{ marginTop: 16 }}
                  size="small"
                  rowKey="ticketId"
                  pagination={false}
                  columns={[
                    {
                      title: '乘客姓名',
                      dataIndex: 'passengerName',
                      key: 'passengerName',
                    },
                    {
                      title: '身份证号',
                      dataIndex: 'passengerIdCard',
                      key: 'passengerIdCard',
                      render: (value) => formatIdCard(value),
                    },
                    {
                      title: '座位号',
                      dataIndex: 'seatNumber',
                      key: 'seatNumber',
                    },
                    {
                      title: '票价',
                      dataIndex: 'price',
                      key: 'price',
                      render: (price) => formatPrice(price),
                    },
                    {
                      title: '票状态',
                      dataIndex: 'ticketStatusText',
                      key: 'ticketStatusText',
                    },
                    {
                      title: '操作',
                      key: 'action',
                      render: (_, ticket) => (
                        selectedOrder.orderStatus >= ORDER_STATUS.PAID && (
                          <Button
                            type="link"
                            size="small"
                            icon={<QrcodeOutlined />}
                            onClick={() => handleViewETicket(ticket, selectedOrder)}
                          >
                            电子车票
                          </Button>
                        )
                      ),
                    },
                  ]}
                  dataSource={selectedOrder.tickets}
                />
              )}
            </>
          )}
        </Modal>

        {/* 电子车票Modal */}
        <Modal
          title="电子车票"
          open={eTicketModalVisible}
          onCancel={() => {
            setETicketModalVisible(false)
            setSelectedTicket(null)
          }}
          footer={null}
          width={650}
        >
          {selectedTicket && (
            <ETicketDetail
              ticket={selectedTicket.ticket}
              order={selectedTicket.order}
              trip={selectedTicket.order}
            />
          )}
        </Modal>
      </Card>
    </div>
  )
}

export default OrderList
