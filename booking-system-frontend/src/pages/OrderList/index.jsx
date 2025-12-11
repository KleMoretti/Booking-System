// 订单列表页面
import { Card, Table, Tag, Button, Space, message } from 'antd'
import { useEffect, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getOrderList, cancelOrder } from '../../store/slices/orderSlice'
import { formatDateTime, formatPrice, getOrderStatus } from '../../utils/format'
import { ORDER_STATUS, PAGINATION } from '../../utils/constants'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'
import Loading from '../../components/Loading'
import './style.css'


function OrderList() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { orderList, loading, pagination } = useSelector((state) => state.order)

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

  const displayOrderList = useMemo(
    () => orderList.map((order) => ({
      id: order.orderId ?? order.id,
      orderNo: order.orderNumber ?? order.orderNo,
      tripNo: order.tripNumber ?? order.tripNo,
      fromStation: order.departureStation ?? order.fromStation,
      toStation: order.arrivalStation ?? order.toStation,
      departureTime: order.departureTime ?? order.createTime,
      totalPrice: order.totalAmount ?? order.totalPrice,
      status: order.orderStatus ?? order.status,
    })),
    [orderList]
  )

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
        </Space>
      ),
    },
  ], [handleCancelOrder])

  if (loading && orderList.length === 0) {
    return (
      <div className="page-order-list page-container">
        <Card className="page-card" variant="borderless">
          <Loading tip="加载订单中..." />
        </Card>
      </div>
    )
  }

  return (
    <div className="page-order-list page-container">
      <Card className="page-card" variant="borderless">
        <PageHeader
          title="我的订单"
          subtitle="查看历史订单和当前订单状态，支持退票、改签等操作"
        />
        {orderList.length === 0 ? (
          <EmptyState
            description="您还没有订单"
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
      </Card>
    </div>
  )
}

export default OrderList
