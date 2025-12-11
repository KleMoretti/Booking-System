// 支付页面
import { Card, Radio, Button, Space, message, Descriptions, Divider, Alert, Spin } from 'antd'
import { AlipayOutlined, WechatOutlined, WalletOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getOrderDetail, payOrder } from '../../api/order'
import { formatDateTime, formatPrice } from '../../utils/format'
import { API_CODE, PAYMENT_METHOD } from '../../utils/constants'
import PageHeader from '../../components/PageHeader'
import './style.css'

function Payment() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const { userInfo } = useSelector((state) => state.user)
  
  const [loading, setLoading] = useState(false)
  const [orderLoading, setOrderLoading] = useState(true)
  const [orderDetail, setOrderDetail] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHOD.BALANCE)
  const [paying, setPaying] = useState(false)
  const [paymentResult, setPaymentResult] = useState(null)

  useEffect(() => {
    if (!orderId) {
      message.error('订单ID不存在')
      navigate('/orders')
      return
    }
    loadOrderDetail()
  }, [orderId])

  const loadOrderDetail = async () => {
    setOrderLoading(true)
    try {
      const response = await getOrderDetail(orderId)
      if (response.code === API_CODE.SUCCESS) {
        setOrderDetail(response.data)
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
    if (!paymentMethod) {
      message.warning('请选择支付方式')
      return
    }

    // 检查余额支付
    if (paymentMethod === PAYMENT_METHOD.BALANCE) {
      const userBalance = userInfo?.balance || 0
      const orderAmount = orderDetail?.totalAmount || orderDetail?.totalPrice || 0
      if (userBalance < orderAmount) {
        message.error('余额不足，请充值或选择其他支付方式')
        return
      }
    }

    setPaying(true)
    try {
      const response = await payOrder(orderId, paymentMethod)
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

  return (
    <div className="page-payment page-container">
      <Card className="page-card" variant="borderless">
        <PageHeader
          title="订单支付"
          subtitle="请选择支付方式完成支付"
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
            <div className="order-amount">
              <span>订单金额：</span>
              <span className="amount">{formatPrice(orderAmount)}</span>
            </div>
          </Card>

          {/* 支付方式选择 */}
          <Card className="payment-method-card" title="支付方式">
            <Radio.Group 
              value={paymentMethod} 
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="payment-methods"
            >
              <Radio.Button value={PAYMENT_METHOD.BALANCE} className="payment-option">
                <WalletOutlined className="payment-icon" />
                <span className="payment-name">余额支付</span>
                <span className="payment-balance">
                  （余额：{formatPrice(userBalance)}）
                </span>
              </Radio.Button>
              <Radio.Button value={PAYMENT_METHOD.ALIPAY} className="payment-option">
                <AlipayOutlined className="payment-icon alipay" />
                <span className="payment-name">支付宝</span>
              </Radio.Button>
              <Radio.Button value={PAYMENT_METHOD.WECHAT} className="payment-option">
                <WechatOutlined className="payment-icon wechat" />
                <span className="payment-name">微信支付</span>
              </Radio.Button>
            </Radio.Group>

            {paymentMethod === PAYMENT_METHOD.BALANCE && userBalance < orderAmount && (
              <Alert
                message="余额不足"
                description={`当前余额：${formatPrice(userBalance)}，订单金额：${formatPrice(orderAmount)}，差额：${formatPrice(orderAmount - userBalance)}`}
                type="warning"
                showIcon
                style={{ marginTop: '16px' }}
                action={
                  <Button size="small" onClick={() => navigate('/profile')}>
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
                disabled={paymentMethod === PAYMENT_METHOD.BALANCE && userBalance < orderAmount}
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
