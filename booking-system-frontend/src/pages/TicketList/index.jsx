// 票务列表页面
import { Card, Table, Tag, Button, Space, message } from 'antd'
import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { searchTrips } from '../../store/slices/ticketSlice'
import { createOrder } from '../../store/slices/orderSlice'
import { formatTime, formatPrice, getSeatTypeName } from '../../utils/format'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'
import Loading from '../../components/Loading'
import './style.css'


function TicketList() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { tripList, loading, searchParams } = useSelector((state) => state.ticket)

  useEffect(() => {
    // 从 URL查询参数或状态中获取搜索条件
    const params = location.state?.searchParams || searchParams
    if (params) {
      dispatch(searchTrips(params))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleBookTicket = async (trip) => {
    try {
      // 这里先实现一个最小可用的下单流程：为当前用户购买 1 张票
      const orderData = {
        tripId: trip.id, // 后端 TripVO 中通过 @JsonProperty("id") 暴露的字段
        passengers: [
          {
            name: '测试乘客',
            idCard: '110101199001011234',
          },
        ],
      }

      const resultAction = await dispatch(createOrder(orderData))

      if (createOrder.fulfilled.match(resultAction)) {
        message.success('订单创建成功')
        // 下单成功后跳转到订单列表
        navigate('/orders')
      } else {
        const errorMsg = resultAction.payload || '创建订单失败'
        message.error(errorMsg)
      }
    } catch (error) {
      message.error(error.message || '创建订单失败')
    }
  }

  const columns = [
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
      width: '12%',
      align: 'center',
      render: (time) => formatTime(time),
    },
    {
      title: '到达时间',
      dataIndex: 'arrivalTime',
      width: '12%',
      align: 'center',
      render: (time) => formatTime(time),
    },
    {
      title: '历时',
      dataIndex: 'duration',
      width: '10%',
      align: 'center',
      render: (duration) => duration || '-',
    },
    {
      title: '余票',
      dataIndex: 'seats',
      width: '10%',
      align: 'center',
      render: (seats) => (
        <div style={{ fontWeight: 600, color: seats?.available > 0 ? '#52c41a' : '#ff4d4f' }}>
          {seats?.available || 0}张
        </div>
      ),
    },
    {
      title: '票价',
      dataIndex: 'seats',
      width: '12%',
      align: 'center',
      render: (seats) => (
        <div style={{ fontWeight: 600, color: '#1890ff' }}>
          {formatPrice(seats?.price)}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: '14%',
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleBookTicket(record)}
        >
          订票
        </Button>
      ),
    },
  ]

  if (loading && tripList.length === 0) {
    return (
      <div className="page-ticket-list page-container">
        <Card className="page-card" variant="borderless">
          <Loading tip="搜索车次中..." />
        </Card>
      </div>
    )
  }

  return (
    <div className="page-ticket-list page-container">
      <Card className="page-card" variant="borderless">
        <PageHeader
          title="车票列表"
          subtitle="查询到的车次与余票信息，选择合适的车次开始订票"
        />
        {tripList.length === 0 ? (
          <EmptyState
            description="没有找到相关车次，请调整搜索条件"
            actionText="返回首页"
            actionPath="/home"
          />
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={tripList}
            loading={loading}
            pagination={false}
            size="middle"
          />
        )}
      </Card>
    </div>
  )
}

export default TicketList
