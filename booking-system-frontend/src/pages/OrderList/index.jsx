// 订单列表页面
import { Card, Table, Tag, Button, Space, message, Modal, Descriptions, Tabs } from 'antd'
import { useEffect, useCallback, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons'
import { getOrderList, cancelOrder } from '../../store/slices/orderSlice'
import { formatDateTime, formatPrice, getOrderStatus, formatIdCard } from '../../utils/format'
import { ORDER_STATUS, PAGINATION } from '../../utils/constants'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'
import Loading from '../../components/Loading'
import './style.css'


function OrderList() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { orderList, loading, pagination } = useSelector((state) => state.order)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [activeTab, setActiveTab] = useState('all')

  const loadOrders = useCallback((page = PAGINATION.DEFAULT_PAGE, pageSize = PAGINATION.DEFAULT_PAGE_SIZE) => {
    dispatch(getOrderList({ page, pageSize }))
  }, [dispatch])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const handleCancelOrder = useCallback(async (orderId) => {
    try {
      await dispatch(cancelOrder(orderId)).unwrap()
      message.success('订单已取消')
      loadOrders(pagination.current, pagination.pageSize)
    } catch (error) {
      message.error('取消订单失败')
    }
  }, [dispatch, loadOrders, pagination.current, pagination.pageSize])

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

  // 根据标签页筛选订单
  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return orderList
    if (activeTab === 'pending') {
      return orderList.filter(order => 
        (order.orderStatus ?? order.status) === ORDER_STATUS.PENDING
      )
    }
    if (activeTab === 'paid') {
      return orderList.filter(order => 
        (order.orderStatus ?? order.status) === ORDER_STATUS.PAID
      )
    }
    if (activeTab === 'completed') {
      return orderList.filter(order => 
        (order.orderStatus ?? order.status) === ORDER_STATUS.COMPLETED
      )
    }
    if (activeTab === 'cancelled') {
      return orderList.filter(order => 
        (order.orderStatus ?? order.status) === ORDER_STATUS.CANCELLED
      )
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
      if (status === ORDER_STATUS.PENDING) counts.pending++
      if (status === ORDER_STATUS.PAID) counts.paid++
      if (status === ORDER_STATUS.COMPLETED) counts.completed++
      if (status === ORDER_STATUS.CANCELLED) counts.cancelled++
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
      width: '10%',
      align: 'center',
      render: (status) => {
        const statusInfo = getOrderStatus(status)
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      width: '17%',
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
          {(record.status === ORDER_STATUS.PENDING || record.status === ORDER_STATUS.PAID) && (
            <Button
              type="link"
              danger
              size="small"
              onClick={() => handleCancelOrder(record.id)}
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
  ], [handleCancelOrder, handleViewDetail])

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
                  ]}
                  dataSource={selectedOrder.tickets}
                />
              )}
            </>
          )}
        </Modal>
      </Card>
    </div>
  )
}

export default OrderList
