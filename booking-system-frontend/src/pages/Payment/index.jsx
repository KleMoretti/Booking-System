// 支付页面
import { Card, Button, Space, message, Descriptions, Divider, Alert, Spin, Statistic, List } from 'antd'
import { WalletOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getOrderDetail, payOrder, cancelOrder } from '../../api/order'
import { formatDateTime, formatPrice } from '../../utils/format'
import { API_CODE, PAYMENT_METHOD, ORDER_TIMEOUT } from '../../utils/constants'
import PageHeader from '../../components/PageHeader'
import dayjs from 'dayjs'
import './style.css'

const { Countdown } = Statistic

function Payment() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const { userInfo } = useSelector((state) => state.user)
  
  const [loading, setLoading] = useState(false)
  const [orderLoading, setOrderLoading] = useState(true)
  const [orderDetail, setOrderDetail] = useState(null)
  const [paying, setPaying] = useState(false)
  const [paymentResult, setPaymentResult] = useState(null)
  const [deadline, setDeadline] = useState(Date.now() + ORDER_TIMEOUT)
  const cancelingRef = useRef(false)

  useEffect(() => {
    if (!orderId) {
      message.error('订单ID不存在')
      navigate('/orders')
      return
    }
    loadOrderDetail()
  }, [orderId])

  // 倒计时结束处理 - 自动取消订单
  const handleCountdownFinish = useCallback(async () => {
    if (cancelingRef.current) return
    cancelingRef.current = true
    
    try {
      await cancelOrder(orderId)
      message.warning('支付超时，订单已自动取消')
    } catch (error) {
      console.error('自动取消订单失败：', error)
      message.warning('支付超时')
    } finally {
      setTimeout(() => {
        navigate('/orders')
      }, 2000)
    }
  }, [orderId, navigate])

  const loadOrderDetail = async () => {
    setOrderLoading(true)
    try {
      const response = await getOrderDetail(orderId)
      if (response.code === API_CODE.SUCCESS) {
        setOrderDetail(response.data)
        
        // 根据订单创建时间计算倒计时截止时间
        if (response.data.createTime) {
          const createTime = dayjs(response.data.createTime).valueOf()
          const deadlineTime = createTime + ORDER_TIMEOUT
          const now = Date.now()
          
          // 如果已经超时，直接取消订单
          if (now >= deadlineTime) {
            handleCountdownFinish()
          } else {
            setDeadline(deadlineTime)
          }
        }
      } else {
        message.error(response.message || '获取订单信息失败')
        setTimeout(() => navigate('/orders'), 2000)
      }
    } catch (error) {
      console.error('获取订单详情失败：', error)
      message.error('网络错误，请稍后重试')
    } finally {
      setOrderLoading(false)
    }
  }

  const handlePayment = async () => {
    // 检查余额
    const userBalance = userInfo?.balance || 0
    const orderAmount = orderDetail?.totalAmount || orderDetail?.totalPrice || 0
    if (userBalance < orderAmount) {
      message.error('余额不足，请先充值')
      return
    }

    setPaying(true)
    try {
      const response = await payOrder(orderId, PAYMENT_METHOD.BALANCE)
      if (response.code === API_CODE.SUCCESS) {
        setPaymentResult({
          success: true,
          message: '支付成功！',
          orderNo: orderDetail?.orderNumber || orderDetail?.orderNo,
        })
        message.success('支付成功！')
        // 3秒后跳转到订单列表
        setTimeout(() => {
          navigate('/orders')
        }, 3000)
      } else {
        setPaymentResult({
          success: false,
          message: response.message || '支付失败',
        })
        message.error(response.message || '支付失败')
      }
    } catch (error) {
      console.error('支付失败：', error)
      setPaymentResult({
        success: false,
        message: '网络错误，请稍后重试',
      })
      message.error('网络错误，请稍后重试')
    } finally {
      setPaying(false)
    }
  }

  if (orderLoading) {
    return (
      <div className="page-payment page-container">
        <Card className="page-card" variant="borderless">
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" tip="加载订单信息中...">
              <div style={{ minHeight: '100px' }} />
            </Spin>
          </div>
        </Card>
      </div>
    )
  }

  if (!orderDetail) {
    return (
      <div className="page-payment page-container">
        <Card className="page-card" variant="borderless">
          <Alert message="订单不存在" type="error" />
        </Card>
      </div>
    )
  }

  // 如果支付成功，显示支付结果页面
  if (paymentResult?.success) {
    return (
      <div className="page-payment page-container">
        <Card className="page-card" variant="borderless">
          <div className="payment-result success">
            <CheckCircleOutlined className="result-icon" />
            <h2>支付成功！</h2>
            <p>订单号：{paymentResult.orderNo}</p>
            <p className="redirect-tip">3秒后自动跳转到订单列表...</p>
            <Space size="large" style={{ marginTop: '24px' }}>
              <Button type="primary" onClick={() => navigate('/orders')}>
                查看订单
              </Button>
              <Button onClick={() => navigate('/tickets')}>
                继续购票
              </Button>
            </Space>
          </div>
        </Card>
      </div>
    )
  }

  // 如果支付失败，显示失败页面
  if (paymentResult?.success === false) {
    return (
      <div className="page-payment page-container">
        <Card className="page-card" variant="borderless">
          <div className="payment-result failure">
            <CloseCircleOutlined className="result-icon" />
            <h2>支付失败</h2>
            <p>{paymentResult.message}</p>
            <Space size="large" style={{ marginTop: '24px' }}>
              <Button type="primary" onClick={() => setPaymentResult(null)}>
                重新支付
              </Button>
              <Button onClick={() => navigate('/orders')}>
                返回订单列表
              </Button>
            </Space>
          </div>
        </Card>
      </div>
    )
  }

  const orderAmount = orderDetail?.totalAmount || orderDetail?.totalPrice || 0
  const userBalance = userInfo?.balance || 0
  const ticketCount = orderDetail?.tickets?.length || 1
  const ticketPrice = ticketCount > 0 ? orderAmount / ticketCount : orderAmount

  return (
    <div className="page-payment page-container">
      <Card className="page-card" variant="borderless">
        <PageHeader
          title="订单支付"
          subtitle="请选择支付方式完成支付"
        />
        
        {/* 支付倒计时 */}
        <Alert
          message={
            <Space>
              <ClockCircleOutlined />
              <span>请在</span>
              <Countdown 
                value={deadline} 
                format="mm:ss" 
                onFinish={handleCountdownFinish}
                valueStyle={{ fontSize: '16px', color: '#ff4d4f' }}
              />
              <span>内完成支付</span>
            </Space>
          }
          type="warning"
          showIcon={false}
          style={{ marginBottom: 20, textAlign: 'center' }}
        />

        <div className="payment-content">
          {/* 订单信息 */}
          <Card className="order-info-card" title="订单信息">
            <Descriptions column={2} size="small">
              <Descriptions.Item label="订单号">
                {orderDetail?.orderNumber || orderDetail?.orderNo}
              </Descriptions.Item>
              <Descriptions.Item label="车次">
                {orderDetail?.tripNumber || orderDetail?.tripNo}
              </Descriptions.Item>
              <Descriptions.Item label="出发站">
                {orderDetail?.departureStation || orderDetail?.fromStation}
              </Descriptions.Item>
              <Descriptions.Item label="到达站">
                {orderDetail?.arrivalStation || orderDetail?.toStation}
              </Descriptions.Item>
              <Descriptions.Item label="出发时间" span={2}>
                {formatDateTime(orderDetail?.departureTime)}
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            
            {/* 价格明细 */}
            <div className="price-detail">
              <h4 style={{ marginBottom: 12, fontWeight: 600 }}>
                <InfoCircleOutlined /> 价格明细
              </h4>
              <List
                size="small"
                dataSource={[
                  { label: '票价', value: formatPrice(ticketPrice) },
                  { label: '数量', value: `${ticketCount} 张` },
                  { label: '服务费', value: '¥0.00' },
                ]}
                renderItem={(item) => (
                  <List.Item style={{ padding: '8px 0', border: 'none' }}>
                    <span>{item.label}</span>
                    <span style={{ fontWeight: 500 }}>{item.value}</span>
                  </List.Item>
                )}
              />
              <Divider style={{ margin: '12px 0' }} />
              <div className="order-amount">
                <span>订单总额：</span>
                <span className="amount">{formatPrice(orderAmount)}</span>
              </div>
            </div>
          </Card>

          {/* 余额支付信息 */}
          <Card className="payment-method-card" title="支付方式">
            <div className="balance-payment-info">
              <div className="payment-method-item">
                <WalletOutlined className="payment-icon" />
                <span className="payment-label">余额支付</span>
              </div>
              <Divider style={{ margin: '16px 0' }} />
              <Descriptions column={1} size="small">
                <Descriptions.Item label="当前余额">
                  <span className={userBalance >= orderAmount ? 'balance-sufficient' : 'balance-insufficient'}>
                    {formatPrice(userBalance)}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="订单金额">
                  <span style={{ fontWeight: 600, color: '#ff4d4f' }}>
                    {formatPrice(orderAmount)}
                  </span>
                </Descriptions.Item>
                {userBalance < orderAmount && (
                  <Descriptions.Item label="差额">
                    <span style={{ color: '#ff4d4f', fontWeight: 500 }}>
                      {formatPrice(orderAmount - userBalance)}
                    </span>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>

            {userBalance < orderAmount && (
              <Alert
                message="余额不足"
                description="请先充值后再完成支付"
                type="warning"
                showIcon
                style={{ marginTop: '16px' }}
                action={
                  <Button size="small" type="primary" onClick={() => navigate('/profile')}>
                    去充值
                  </Button>
                }
              />
            )}
          </Card>

          {/* 支付按钮 */}
          <div className="payment-actions">
            <Space size="large">
              <Button size="large" onClick={() => navigate('/orders')}>
                取消支付
              </Button>
              <Button
                type="primary"
                size="large"
                loading={paying}
                onClick={handlePayment}
                disabled={userBalance < orderAmount}
              >
                确认支付 {formatPrice(orderAmount)}
              </Button>
            </Space>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Payment
