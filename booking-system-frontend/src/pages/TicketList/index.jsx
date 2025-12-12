// 票务列表页面
import { Card, Table, Tag, Button, Space, message, Modal, Form, Input, Radio } from 'antd'
import { useEffect, useCallback, useState } from 'react'
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
  const { userInfo } = useSelector((state) => state.user)
  const [bookingModalVisible, setBookingModalVisible] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [purchaseType, setPurchaseType] = useState('self')
  const [form] = Form.useForm()

  useEffect(() => {
    // 从 URL查询参数或状态中获取搜索条件
    const params = location.state?.searchParams || searchParams
    if (params) {
      dispatch(searchTrips(params))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleBookTicket = (trip) => {
    // 这里先实现一个最小可用的下单流程：为当前用户购买 1 张票
    setSelectedTrip(trip)
    const defaultName = userInfo?.realName || userInfo?.username || ''
    const defaultIdCard = userInfo?.idCardNo || ''
    setPurchaseType('self')
    form.setFieldsValue({
      purchaseType: 'self',
      passengerName: defaultName,
      passengerIdCard: defaultIdCard,
    })
    setBookingModalVisible(true)
  }

  const handlePurchaseTypeChange = (e) => {
    const value = e.target.value
    setPurchaseType(value)
    if (value === 'self') {
      const defaultName = userInfo?.realName || userInfo?.username || ''
      const defaultIdCard = userInfo?.idCardNo || ''
      form.setFieldsValue({
        passengerName: defaultName,
        passengerIdCard: defaultIdCard,
      })
    } else {
      form.setFieldsValue({
        passengerName: '',
        passengerIdCard: '',
      })
    }
  }

  const handleSubmitBooking = async () => {
    if (!selectedTrip) {
      return
    }
    try {
      const values = await form.validateFields()
      const passengers = [
        {
          name: values.passengerName,
          idCard: values.passengerIdCard,
        },
      ]

      const orderData = {
        tripId: selectedTrip.id,
        passengers,
      }

      const resultAction = await dispatch(createOrder(orderData))

      if (createOrder.fulfilled.match(resultAction)) {
        message.success('订单创建成功')
        setBookingModalVisible(false)
        setSelectedTrip(null)
        navigate('/orders')
      } else {
        const errorMsg = resultAction.payload || '创建订单失败'
        message.error(errorMsg)
        if (errorMsg.includes('余票不足') && searchParams) {
          dispatch(searchTrips(searchParams))
        }
      }
    } catch (error) {
      if (error && error.errorFields) {
        return
      }
      message.error(error.message || '创建订单失败')
    }
  }

  const handleCloseBookingModal = () => {
    setBookingModalVisible(false)
    setSelectedTrip(null)
    form.resetFields()
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
          disabled={!record.seats || (record.seats.available || 0) <= 0}
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
        <Modal
          title="填写购票信息"
          open={bookingModalVisible}
          onCancel={handleCloseBookingModal}
          onOk={handleSubmitBooking}
          okText="提交订单"
          destroyOnClose
        >
          {selectedTrip && (
            <div style={{ marginBottom: 16 }}>
              <p>
                车次：{selectedTrip.tripNo} | {selectedTrip.fromStation} → {selectedTrip.toStation}
              </p>
              <p>出发时间：{formatTime(selectedTrip.departureTime, 'YYYY-MM-DD HH:mm')}</p>
              <p>
                余票：{selectedTrip.seats?.available || 0} 张，票价：{formatPrice(selectedTrip.seats?.price)}
              </p>
            </div>
          )}
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item label="购票类型" name="purchaseType">
              <Radio.Group value={purchaseType} onChange={handlePurchaseTypeChange}>
                <Radio value="self">为自己购票</Radio>
                <Radio value="other">为他人购票</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label="乘客姓名"
              name="passengerName"
              rules={[{ required: true, message: '请输入乘客姓名' }]}
            >
              <Input placeholder="请输入乘客姓名" />
            </Form.Item>
            <Form.Item
              label="身份证号"
              name="passengerIdCard"
              rules={[{ required: true, message: '请输入身份证号' }]}
            >
              <Input placeholder="请输入身份证号" />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  )
}

export default TicketList
