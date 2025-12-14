// 退票改签页面
import { Card, Table, Tag, Button, Space, message, Modal, Select, DatePicker, TimePicker, InputNumber, Form, Descriptions, Divider, Alert, Statistic } from 'antd'
import { SwapOutlined, RollbackOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getOrderList } from '../../store/slices/orderSlice'
import { refundOrder, changeOrder } from '../../api/order'
import { formatDateTime, formatPrice, getOrderStatus } from '../../utils/format'
import { ORDER_STATUS, API_CODE, PAGINATION } from '../../utils/constants'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'
import Loading from '../../components/Loading'
import dayjs from 'dayjs'
import './style.css'

const { confirm } = Modal

function RefundChange() {
  const dispatch = useDispatch()
  const { orderList, loading, pagination } = useSelector((state) => state.order)
  const [refundModalVisible, setRefundModalVisible] = useState(false)
  const [changeModalVisible, setChangeModalVisible] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [processingRefund, setProcessingRefund] = useState(false)
  const [processingChange, setProcessingChange] = useState(false)
  const [form] = Form.useForm()
  const [refundFee, setRefundFee] = useState(0)
  const [refundAmount, setRefundAmount] = useState(0)

  const loadOrders = useCallback((page = PAGINATION.DEFAULT_PAGE, pageSize = PAGINATION.DEFAULT_PAGE_SIZE) => {
    dispatch(getOrderList({ page, pageSize }))
  }, [dispatch])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  // 只显示可以退票或改签的订单
  const eligibleOrders = useMemo(
    () => orderList.filter(order => 
      order.orderStatus === ORDER_STATUS.PAID || 
      order.orderStatus === ORDER_STATUS.COMPLETED
    ),
    [orderList]
  )

  const displayOrderList = useMemo(
    () => eligibleOrders.map((order) => ({
      id: order.orderId ?? order.id,
      orderNo: order.orderNumber ?? order.orderNo,
      tripNo: order.tripNumber ?? order.tripNo,
      fromStation: order.departureStation ?? order.fromStation,
      toStation: order.arrivalStation ?? order.toStation,
      departureTime: order.departureTime ?? order.createTime,
      totalPrice: order.totalAmount ?? order.totalPrice,
      status: order.orderStatus ?? order.status,
    })),
    [eligibleOrders]
  )

  // 计算退票费用
  const calculateRefundFee = useCallback((order) => {
    const totalPrice = order.totalPrice || 0
    const departureTime = dayjs(order.departureTime)
    const now = dayjs()
    const hoursLeft = departureTime.diff(now, 'hour')

    let feeRate = 0
    if (hoursLeft >= 48) {
      feeRate = 0.05 // 5%
    } else if (hoursLeft >= 24) {
      feeRate = 0.10 // 10%
    } else if (hoursLeft >= 2) {
      feeRate = 0.20 // 20%
    } else {
      feeRate = 1 // 不予退票
    }

    const fee = totalPrice * feeRate
    const refund = totalPrice - fee

    return { fee, refund, feeRate, hoursLeft }
  }, [])

  // 打开退票弹窗
  const handleOpenRefund = useCallback((record) => {
    setSelectedOrder(record)
    const { fee, refund } = calculateRefundFee(record)
    setRefundFee(fee)
    setRefundAmount(refund)
    setRefundModalVisible(true)
  }, [calculateRefundFee])

  // 打开改签弹窗
  const handleOpenChange = useCallback((record) => {
    setSelectedOrder(record)
    form.resetFields()
    setChangeModalVisible(true)
  }, [form])

  // 处理退票
  const handleRefund = useCallback(() => {
    confirm({
      title: '确认退票',
      icon: <ExclamationCircleOutlined />,
      content: `确定要退订单 ${selectedOrder.orderNo} 吗？退票后将按照退票规则退还费用。`,
      okText: '确认退票',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        setProcessingRefund(true)
        try {
          const response = await refundOrder(selectedOrder.id, {
            reason: '用户主动退票'
          })
          if (response.code === API_CODE.SUCCESS) {
            message.success('退票成功！退款将在3-5个工作日内到账')
            setRefundModalVisible(false)
            setSelectedOrder(null)
            loadOrders(pagination.current, pagination.pageSize)
          } else {
            message.error(response.message || '退票失败')
          }
        } catch (error) {
          console.error('退票失败：', error)
          message.error('网络错误，请稍后重试')
        } finally {
          setProcessingRefund(false)
        }
      }
    })
  }, [selectedOrder, loadOrders, pagination])

  // 处理改签
  const handleChange = useCallback(async () => {
    try {
      const values = await form.validateFields()
      
      confirm({
        title: '确认改签',
        icon: <ExclamationCircleOutlined />,
        content: `确定要改签订单 ${selectedOrder.orderNo} 吗？改签后原订单将失效。`,
        okText: '确认改签',
        cancelText: '取消',
        onOk: async () => {
          setProcessingChange(true)
          try {
            const response = await changeOrder(selectedOrder.id, {
              newTripNo: values.newTripNo,
              newDepartureDate: values.newDepartureDate.format('YYYY-MM-DD'),
              newDepartureTime: values.newDepartureTime.format('HH:mm:ss'),
              reason: '用户主动改签'
            })
            if (response.code === API_CODE.SUCCESS) {
              message.success('改签成功！')
              setChangeModalVisible(false)
              setSelectedOrder(null)
              form.resetFields()
              loadOrders(pagination.current, pagination.pageSize)
            } else {
              message.error(response.message || '改签失败')
            }
          } catch (error) {
            console.error('改签失败：', error)
            message.error('网络错误，请稍后重试')
          } finally {
            setProcessingChange(false)
          }
        }
      })
    } catch (error) {
      console.error('表单验证失败：', error)
    }
  }, [selectedOrder, form, loadOrders, pagination])

  const handleTableChange = useCallback((newPagination) => {
    loadOrders(newPagination.current, newPagination.pageSize)
  }, [loadOrders])

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
          <Button 
            type="link" 
            icon={<SwapOutlined />}
            onClick={() => handleOpenChange(record)}
          >
            改签
          </Button>
          <Button 
            type="link" 
            danger
            icon={<RollbackOutlined />}
            onClick={() => handleOpenRefund(record)}
          >
            退票
          </Button>
        </Space>
      ),
    },
  ], [handleOpenChange, handleOpenRefund])

  if (loading && orderList.length === 0) {
    return (
      <div className="page-refund-change page-container">
        <Card className="page-card" variant="borderless">
          <Loading tip="加载订单中..." />
        </Card>
      </div>
    )
  }

  return (
    <div className="page-refund-change page-container">
      <Card className="page-card" variant="borderless">
        <PageHeader
          title="退票改签"
          subtitle="支持已支付订单的退票和改签操作"
        />
        {displayOrderList.length === 0 ? (
          <EmptyState
            description="没有可以退票或改签的订单"
            actionText="查看所有订单"
            actionPath="/orders"
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

      {/* 退票弹窗 */}
      <Modal
        title={<span><RollbackOutlined /> 退票信息</span>}
        open={refundModalVisible}
        onCancel={() => {
          setRefundModalVisible(false)
          setSelectedOrder(null)
        }}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => {
              setRefundModalVisible(false)
              setSelectedOrder(null)
            }}
          >
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            loading={processingRefund}
            onClick={handleRefund}
          >
            确认退票
          </Button>,
        ]}
        width={600}
      >
        {selectedOrder && (
          <div className="refund-modal-content">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="订单号">{selectedOrder.orderNo}</Descriptions.Item>
              <Descriptions.Item label="车次">{selectedOrder.tripNo}</Descriptions.Item>
              <Descriptions.Item label="出发站">{selectedOrder.fromStation}</Descriptions.Item>
              <Descriptions.Item label="到达站">{selectedOrder.toStation}</Descriptions.Item>
              <Descriptions.Item label="出发时间">
                {formatDateTime(selectedOrder.departureTime)}
              </Descriptions.Item>
              <Descriptions.Item label="订单金额">
                {formatPrice(selectedOrder.totalPrice)}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            {/* 退票费用预览 */}
            <Alert
              message="退票费用预览"
              description={
                <div style={{ marginTop: 12 }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>订单金额：</span>
                      <span style={{ fontWeight: 600 }}>{formatPrice(selectedOrder.totalPrice)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>退票手续费：</span>
                      <span style={{ fontWeight: 600, color: '#ff4d4f' }}>-{formatPrice(refundFee)}</span>
                    </div>
                    <Divider style={{ margin: '8px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 16, fontWeight: 600 }}>预计退款：</span>
                      <span style={{ fontSize: 18, fontWeight: 600, color: '#52c41a' }}>{formatPrice(refundAmount)}</span>
                    </div>
                  </Space>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <div className="refund-rules">
              <h4><InfoCircleOutlined /> 退票规则</h4>
              <ul>
                <li>开车前48小时以上：退票费5%</li>
                <li>开车前24-48小时：退票费10%</li>
                <li>开车前2-24小时：退票费20%</li>
                <li>开车前2小时以内：不予退票</li>
              </ul>
              <Alert
                message="退款将在3-5个工作日内退回原支付账户"
                type="warning"
                showIcon
                style={{ marginTop: 12 }}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* 改签弹窗 */}
      <Modal
        title={<span><SwapOutlined /> 改签信息</span>}
        open={changeModalVisible}
        onCancel={() => {
          setChangeModalVisible(false)
          setSelectedOrder(null)
          form.resetFields()
        }}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => {
              setChangeModalVisible(false)
              setSelectedOrder(null)
              form.resetFields()
            }}
          >
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={processingChange}
            onClick={handleChange}
          >
            确认改签
          </Button>,
        ]}
        width={700}
      >
        {selectedOrder && (
          <div className="change-modal-content">
            <div className="original-order-info">
              <h4>原订单信息</h4>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="订单号">{selectedOrder.orderNo}</Descriptions.Item>
                <Descriptions.Item label="车次">{selectedOrder.tripNo}</Descriptions.Item>
                <Descriptions.Item label="出发站">{selectedOrder.fromStation}</Descriptions.Item>
                <Descriptions.Item label="到达站">{selectedOrder.toStation}</Descriptions.Item>
                <Descriptions.Item label="出发时间" span={2}>
                  {formatDateTime(selectedOrder.departureTime)}
                </Descriptions.Item>
              </Descriptions>
            </div>

            <Divider />

            <div className="new-order-info">
              <h4>改签后信息</h4>
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  newDepartureDate: dayjs(selectedOrder.departureTime),
                }}
              >
                <Form.Item
                  label="新车次"
                  name="newTripNo"
                  rules={[{ required: true, message: '请输入新车次号' }]}
                >
                  <Select
                    placeholder="选择新车次"
                    options={[
                      { value: 'G1001', label: 'G1001 - 高铁' },
                      { value: 'D2001', label: 'D2001 - 动车' },
                      { value: 'K3001', label: 'K3001 - 快车' },
                      { value: 'T4001', label: 'T4001 - 特快' },
                    ]}
                  />
                </Form.Item>
                <Form.Item
                  label="新出发日期"
                  name="newDepartureDate"
                  rules={[{ required: true, message: '请选择新出发日期' }]}
                >
                  <DatePicker 
                    style={{ width: '100%' }}
                    inputReadOnly
                    allowClear={false}
                    disabledDate={(current) => {
                      return current && current < dayjs().startOf('day')
                    }}
                  />
                </Form.Item>
                <Form.Item
                  label="新出发时间"
                  name="newDepartureTime"
                  rules={[{ required: true, message: '请选择新出发时间' }]}
                >
                  <TimePicker 
                    style={{ width: '100%' }}
                    format="HH:mm"
                    inputReadOnly
                    allowClear={false}
                  />
                </Form.Item>
              </Form>
            </div>

            <Divider />

            <div className="change-rules">
              <h4><InfoCircleOutlined /> 改签规则</h4>
              <ul>
                <li>开车前48小时以上：免费改签</li>
                <li>开车前24-48小时：改签费5%</li>
                <li>开车前2-24小时：改签费10%</li>
                <li>开车前2小时以内：不予改签</li>
              </ul>
              <Alert
                message="如有差价，将按照实际票价进行补收或退还"
                type="info"
                showIcon
                style={{ marginTop: 12 }}
              />
              <Alert
                message="改签后的车次仅限同一路线，不支持跨线路改签"
                type="warning"
                showIcon
                style={{ marginTop: 8 }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default RefundChange
