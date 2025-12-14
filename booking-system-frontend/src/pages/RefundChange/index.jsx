// 退票改签页面
import { Card, Table, Tag, Button, Space, message, Modal, Select, Form, Descriptions, Divider, Alert } from 'antd'
import { SwapOutlined, RollbackOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getOrderList } from '../../store/slices/orderSlice'
import { refundOrder, changeOrder } from '../../api/order'
import { searchTrips, getStationList } from '../../api/ticket'
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
  const [availableTrips, setAvailableTrips] = useState([])
  const [loadingTrips, setLoadingTrips] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [stations, setStations] = useState([])

  const loadOrders = useCallback((page = PAGINATION.DEFAULT_PAGE, pageSize = PAGINATION.DEFAULT_PAGE_SIZE) => {
    dispatch(getOrderList({ page, pageSize }))
  }, [dispatch])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  // 加载站点列表
  useEffect(() => {
    const loadStations = async () => {
      try {
        const response = await getStationList()
        if (response.code === API_CODE.SUCCESS) {
          setStations(response.data)
        }
      } catch (error) {
        console.error('加载站点列表失败：', error)
      }
    }
    loadStations()
  }, [])

  // 提取城市名称（去除站点后缀）
  const extractCityName = useCallback((stationName) => {
    if (!stationName) return ''
    
    // 去除常见的站点后缀
    let cityName = stationName
      .replace(/站$/, '')                           // 去掉"站"
      .replace(/(虹桥|浦东|火车|高铁|客运)站?$/, '') // 去掉特殊站点名
      .replace(/(南|北|东|西)站?$/, '')              // 去掉方位后缀
    
    return cityName.trim()
  }, [])

  // 检查两个站点是否属于同一城市
  const isSameCity = useCallback((station1, station2) => {
    if (!station1 || !station2) return false
    
    // 1. 完全匹配（如 "北京南站" === "北京南站"）
    if (station1 === station2) return true
    
    const city1 = extractCityName(station1)
    const city2 = extractCityName(station2)
    
    // 2. 城市名完全匹配（如 "北京" === "北京"）
    if (city1 === city2 && city1.length > 0) return true
    
    // 3. 其中一个站点名包含另一个的城市名
    // 例如："北京南站" 包含 "北京"，"北京" 匹配 "北京南站"
    if (station1.startsWith(city2) || station2.startsWith(city1)) return true
    
    return false
  }, [extractCityName])

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
      passengerCount: order.tickets ? order.tickets.length : (order.passengerCount ?? order.ticketCount ?? 1),
    })),
    [eligibleOrders]
  )

  const changePricePreview = useMemo(() => {
    if (!selectedOrder || !selectedTrip) return null
    const passengerCount = selectedOrder.passengerCount ?? 1
    const oldAmount = Number(selectedOrder.totalPrice || 0)
    const unitPrice = Number(
      (selectedTrip && selectedTrip.seats && selectedTrip.seats.price != null)
        ? selectedTrip.seats.price
        : (selectedTrip && (selectedTrip.basePrice || selectedTrip.price || selectedTrip.ticketPrice)) || 0
    )
    const newAmount = unitPrice * passengerCount
    const diff = newAmount - oldAmount
    return { passengerCount, oldAmount, unitPrice, newAmount, diff }
  }, [selectedOrder, selectedTrip])

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

  // 搜索可用车次（同一路线，未来的所有车次）
  const loadAvailableTrips = useCallback(async (fromStationName, toStationName, currentTripNo, currentDepartureTime) => {
    setLoadingTrips(true)
    try {
      const allTrips = []
      
      console.log('开始搜索改签车次：', {
        原出发站: fromStationName,
        原到达站: toStationName,
        当前车次: currentTripNo,
        站点列表数量: stations.length,
        前5个站点: stations.slice(0, 5).map(s => ({id: s.id, name: s.name}))
      })
      
      // 查找匹配的站点
      const fromCityStations = stations.filter(s => 
        isSameCity(s.name, fromStationName)
      )
      const toCityStations = stations.filter(s => 
        isSameCity(s.name, toStationName)
      )
      
      console.log('站点匹配结果：', {
        匹配的出发站: fromCityStations.map(s => ({id: s.id, name: s.name})),
        匹配的到达站: toCityStations.map(s => ({id: s.id, name: s.name}))
      })
      
      if (fromCityStations.length === 0 || toCityStations.length === 0) {
        console.error('站点匹配失败，请检查站点名称是否正确')
        message.error(`未找到匹配的站点：${fromCityStations.length === 0 ? fromStationName : ''}${toCityStations.length === 0 ? (fromCityStations.length === 0 ? '、' : '') + toStationName : ''}`)
        setAvailableTrips([])
        setLoadingTrips(false)
        return
      }
      
      // 搜索未来一段时间内的车次（以今天为基准）
      const baseDate = dayjs()
      for (let i = 0; i < 15; i++) {
        const searchDate = baseDate.add(i, 'day').format('YYYY-MM-DD 00:00:00')
        
        // 对每个站点组合进行搜索
        for (const fromStation of fromCityStations) {
          for (const toStation of toCityStations) {
            try {
              const response = await searchTrips({
                fromStationId: fromStation.id,
                toStationId: toStation.id,
                departureDate: searchDate,
              })
              
              if (response.code === API_CODE.SUCCESS && response.data) {
                allTrips.push(...response.data)
              }
            } catch (err) {
              console.error('搜索车次失败：', err)
            }
          }
        }
      }
      
      console.log('搜索到的所有车次：', allTrips.length)
      
      // 去重、过滤和排序
      const filteredTrips = allTrips.filter(trip => {
        const tripNo = trip.tripNumber || trip.tripNo
        const departureTime = dayjs(trip.departureTime)

        // 过滤掉当前订单本身（同一车次号且出发时间相同）
        if (currentDepartureTime && tripNo === currentTripNo) {
          const currentDep = dayjs(currentDepartureTime)
          if (departureTime.isSame(currentDep)) {
            console.log('过滤掉当前车次：', tripNo, departureTime.format('YYYY-MM-DD HH:mm'))
            return false
          }
        }
        
        // 只保留未来的车次
        if (!departureTime.isAfter(dayjs())) {
          console.log('过滤掉过去的车次：', tripNo, departureTime.format('YYYY-MM-DD HH:mm'))
          return false
        }
        
        return true
      })
      
      console.log('过滤后的车次：', filteredTrips.length)
      
      // 使用车次ID和出发时间的组合作为唯一键
      const uniqueTrips = Array.from(
        new Map(
          filteredTrips.map(trip => {
            const key = `${trip.tripNumber || trip.tripNo}_${trip.departureTime}`
            return [key, trip]
          })
        ).values()
      )
      
      console.log('去重后的车次：', uniqueTrips.length)
      
      // 按出发时间排序
      uniqueTrips.sort((a, b) => 
        dayjs(a.departureTime).valueOf() - dayjs(b.departureTime).valueOf()
      )
      
      if (uniqueTrips.length === 0) {
        message.warning('未找到可用的改签车次，请检查是否有符合条件的车次')
      } else {
        message.success(`找到 ${uniqueTrips.length} 个可改签车次`)
      }
      
      setAvailableTrips(uniqueTrips)
    } catch (error) {
      console.error('加载可用车次失败：', error)
      
      // 根据错误类型显示具体的错误信息
      let errorMessage = '加载车次失败，请稍后重试'
      
      if (error.response) {
        const { status, data } = error.response
        
        if (status === 404) {
          errorMessage = '未找到相关车次信息'
        } else if (status === 400) {
          errorMessage = data?.message || '查询参数无效'
        } else if (status === 500) {
          errorMessage = '服务器处理异常，请稍后重试'
        } else if (data?.message) {
          errorMessage = data.message
        }
      } else if (error.request) {
        errorMessage = '服务器无响应，请检查网络连接'
      }
      
      message.error(errorMessage)
      setAvailableTrips([])
    } finally {
      setLoadingTrips(false)
    }
  }, [stations, isSameCity])

  // 打开改签弹窗
  const handleOpenChange = useCallback((record) => {
    setSelectedOrder(record)
    setSelectedTrip(null)
    setAvailableTrips([])
    form.resetFields()
    setChangeModalVisible(true)
    
    // 自动搜索可用车次
    if (stations.length > 0) {
      // 延迟一下确保弹窗已打开
      setTimeout(() => {
        loadAvailableTrips(
          record.fromStation, 
          record.toStation,
          record.tripNo,
          record.departureTime
        )
      }, 100)
    } else {
      message.warning('站点信息加载中，请稍候再试')
    }
  }, [form, stations, loadAvailableTrips])

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
          
          // 根据错误类型显示具体的错误信息
          let errorMessage = '退票失败，请稍后重试'
          
          if (error.response) {
            // 服务器返回了错误响应
            const { status, data } = error.response
            
            if (status === 404) {
              errorMessage = '订单不存在或已被处理'
            } else if (status === 400) {
              errorMessage = data?.message || '退票请求无效，请检查订单状态'
            } else if (status === 403) {
              errorMessage = '您没有权限执行此操作'
            } else if (status === 500) {
              errorMessage = '服务器处理异常，请稍后重试'
            } else if (data?.message) {
              errorMessage = data.message
            }
          } else if (error.request) {
            // 请求已发出但没有收到响应
            errorMessage = '服务器无响应，请检查网络连接'
          }
          
          message.error(errorMessage)
        } finally {
          setProcessingRefund(false)
        }
      }
    })
  }, [selectedOrder, loadOrders, pagination])

  // 处理车次选择
  const handleTripSelect = useCallback((value) => {
    const trip = availableTrips.find(t => t.id === value || t.tripId === value)
    setSelectedTrip(trip)
    if (trip) {
      form.setFieldsValue({
        newTripId: trip.id || trip.tripId,
      })
    }
  }, [availableTrips, form])

  // 处理改签
  const handleChange = useCallback(async () => {
    if (!selectedTrip) {
      message.warning('请选择要改签的车次')
      return
    }
    
    try {
      const values = await form.validateFields()
      const tripLabel = selectedTrip.tripNumber || selectedTrip.tripNo
      
      confirm({
        title: '确认改签',
        icon: <ExclamationCircleOutlined />,
        content: changePricePreview ? (
          <div>
            <p>确定要改签到车次 {tripLabel} 吗？改签后原订单将失效。</p>
            <p>
              原订单金额：{formatPrice(changePricePreview.oldAmount)}，
              新订单金额：{formatPrice(changePricePreview.newAmount)}，
              {changePricePreview.diff > 0 && (
                <span>
                  需补差价
                  <span style={{ marginLeft: 4, color: '#ff4d4f', fontWeight: 600 }}>
                    {formatPrice(changePricePreview.diff)}
                  </span>
                </span>
              )}
              {changePricePreview.diff < 0 && (
                <span>
                  预计退回差价
                  <span style={{ marginLeft: 4, color: '#52c41a', fontWeight: 600 }}>
                    {formatPrice(-changePricePreview.diff)}
                  </span>
                </span>
              )}
              {changePricePreview.diff === 0 && '本次改签票价相同，无需补差价或退款。'}
            </p>
          </div>
        ) : `确定要改签到车次 ${tripLabel} 吗？改签后原订单将失效。`,
        okText: '确认改签',
        cancelText: '取消',
        onOk: async () => {
          setProcessingChange(true)
          try {
            const response = await changeOrder(selectedOrder.id, {
              newTripId: values.newTripId,
              newTripNo: selectedTrip.tripNumber || selectedTrip.tripNo,
              newDepartureDate: dayjs(selectedTrip.departureTime).format('YYYY-MM-DD'),
              newDepartureTime: dayjs(selectedTrip.departureTime).format('HH:mm:ss'),
              reason: '用户主动改签'
            })
            if (response.code === API_CODE.SUCCESS) {
              message.success('改签成功！')
              setChangeModalVisible(false)
              setSelectedOrder(null)
              setSelectedTrip(null)
              form.resetFields()
              loadOrders(pagination.current, pagination.pageSize)
            } else {
              message.error(response.message || '改签失败')
            }
          } catch (error) {
            console.error('改签失败：', error)
            
            // 根据错误类型显示具体的错误信息
            let errorMessage = '改签失败，请稍后重试'
            
            if (error.response) {
              // 服务器返回了错误响应
              const { status, data } = error.response
              
              if (status === 404) {
                errorMessage = '订单或车次不存在'
              } else if (status === 400) {
                errorMessage = data?.message || '改签请求无效，请检查订单和车次信息'
              } else if (status === 403) {
                errorMessage = '您没有权限执行此操作'
              } else if (status === 409) {
                errorMessage = '该车次座位已满，请选择其他车次'
              } else if (status === 500) {
                errorMessage = '服务器处理异常，请稍后重试'
              } else if (data?.message) {
                errorMessage = data.message
              }
            } else if (error.request) {
              // 请求已发出但没有收到响应
              errorMessage = '服务器无响应，请检查网络连接'
            }
            
            message.error(errorMessage)
          } finally {
            setProcessingChange(false)
          }
        }
      })
    } catch (error) {
      console.error('表单验证失败：', error)
    }
  }, [selectedOrder, selectedTrip, form, loadOrders, pagination, changePricePreview])

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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h4 style={{ margin: 0 }}>选择改签车次</h4>
                <Button 
                  type="primary"
                  loading={loadingTrips}
                  onClick={() => {
                    if (stations.length === 0) {
                      message.error('站点信息加载中，请稍后重试')
                      return
                    }
                    
                    // 使用站点名称和当前车次号进行搜索
                    loadAvailableTrips(
                      selectedOrder.fromStation, 
                      selectedOrder.toStation,
                      selectedOrder.tripNo,
                      selectedOrder.departureTime
                    )
                  }}
                  disabled={loadingTrips || stations.length === 0}
                >
                  搜索可用车次
                </Button>
              </div>
              <Alert
                message="说明"
                description='改签仅限同一路线的车次，点击"搜索可用车次"按钮查看可改签的车次列表'
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              
              <Form
                form={form}
                layout="vertical"
              >
                <Form.Item
                  label="选择新车次"
                  name="newTripId"
                  rules={[{ required: true, message: '请选择要改签的车次' }]}
                >
                  <Select
                    placeholder="请选择车次"
                    loading={loadingTrips}
                    onChange={handleTripSelect}
                    notFoundContent={loadingTrips ? "加载中..." : "暂无可用车次"}
                    disabled={availableTrips.length === 0}
                  >
                    {availableTrips.map((trip) => {
                      const tripId = trip.tripId || trip.id
                      const tripNumber = trip.tripNumber || trip.tripNo
                      const price = (trip.seats && trip.seats.price != null)
                        ? trip.seats.price
                        : (trip.basePrice || trip.price || trip.ticketPrice || 0)
                      const departureTime = dayjs(trip.departureTime)
                      const arrivalTime = dayjs(trip.arrivalTime)
                      
                      return (
                        <Select.Option 
                          key={tripId} 
                          value={tripId}
                        >
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            gap: '12px'
                          }}>
                            <span style={{ minWidth: '80px' }}>
                              <strong>{tripNumber}</strong>
                              {trip.vehicleInfo && <span style={{ fontSize: '12px', color: '#999', marginLeft: '4px' }}>
                                {trip.vehicleInfo}
                              </span>}
                            </span>
                            <span style={{ fontSize: '13px', color: '#666', flex: 1 }}>
                              {departureTime.format('MM-DD HH:mm')} 
                              {' → '} 
                              {arrivalTime.format('HH:mm')}
                            </span>
                            <span style={{ color: '#ff4d4f', fontWeight: 600, minWidth: '70px', textAlign: 'right' }}>
                              ¥{price.toFixed(2)}
                            </span>
                          </div>
                        </Select.Option>
                      )
                    })}
                  </Select>
                </Form.Item>
              </Form>

              {/* 显示选中车次的详细信息 */}
              {selectedTrip && (
                <div style={{ marginTop: 16 }}>
                  <Descriptions column={2} size="small" bordered>
                    <Descriptions.Item label="车次号">
                      {selectedTrip.tripNumber || selectedTrip.tripNo}
                    </Descriptions.Item>
                    <Descriptions.Item label="车型">
                      {selectedTrip.vehicleInfo || selectedTrip.trainType || '高铁'}
                    </Descriptions.Item>
                    <Descriptions.Item label="出发站">
                      {selectedTrip.departureStationName || selectedTrip.departureStation || selectedOrder.fromStation}
                    </Descriptions.Item>
                    <Descriptions.Item label="到达站">
                      {selectedTrip.arrivalStationName || selectedTrip.arrivalStation || selectedOrder.toStation}
                    </Descriptions.Item>
                    <Descriptions.Item label="出发时间" span={2}>
                      {formatDateTime(selectedTrip.departureTime)}
                    </Descriptions.Item>
                    <Descriptions.Item label="到达时间" span={2}>
                      {formatDateTime(selectedTrip.arrivalTime)}
                    </Descriptions.Item>
                    <Descriptions.Item label="票价" span={2}>
                      <span style={{ color: '#ff4d4f', fontSize: '16px', fontWeight: 600 }}>
                        ¥{(
                          (selectedTrip.seats && selectedTrip.seats.price != null)
                            ? selectedTrip.seats.price
                            : (selectedTrip.basePrice || selectedTrip.price || selectedTrip.ticketPrice || 0)
                        ).toFixed(2)}
                      </span>
                    </Descriptions.Item>
                  </Descriptions>

                  {changePricePreview && (
                    <div style={{ marginTop: 16 }}>
                      <Alert
                        message="改签价格预览"
                        type="info"
                        showIcon
                        description={
                          <div style={{ marginTop: 8 }}>
                            <Space direction="vertical" style={{ width: '100%' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>乘车人数：</span>
                                <span style={{ fontWeight: 600 }}>{changePricePreview.passengerCount} 人</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>原订单金额：</span>
                                <span style={{ fontWeight: 600 }}>{formatPrice(changePricePreview.oldAmount)}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>新订单金额：</span>
                                <span style={{ fontWeight: 600 }}>{formatPrice(changePricePreview.newAmount)}</span>
                              </div>
                              <Divider style={{ margin: '8px 0' }} />
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 14, fontWeight: 600 }}>本次改签差额：</span>
                                {changePricePreview.diff > 0 && (
                                  <span style={{ fontSize: 16, fontWeight: 600, color: '#ff4d4f' }}>
                                    需补 {formatPrice(changePricePreview.diff)}
                                  </span>
                                )}
                                {changePricePreview.diff < 0 && (
                                  <span style={{ fontSize: 16, fontWeight: 600, color: '#52c41a' }}>
                                    预计退回 {formatPrice(-changePricePreview.diff)}
                                  </span>
                                )}
                                {changePricePreview.diff === 0 && (
                                  <span style={{ fontSize: 16, fontWeight: 600 }}>
                                    票价相同，无需补差价或退款
                                  </span>
                                )}
                              </div>
                            </Space>
                          </div>
                        }
                      />
                    </div>
                  )}
                </div>
              )}
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
