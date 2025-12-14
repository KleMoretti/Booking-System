// 票务列表页面
import { Card, Table, Tag, Button, Space, message, Modal, Form, Input, Radio, Select, Slider, Checkbox, Row, Col, Divider, Badge, Collapse } from 'antd'
import { useEffect, useCallback, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { LeftOutlined, RightOutlined, FilterOutlined, SortAscendingOutlined } from '@ant-design/icons'
import { searchTrips, setSearchParams } from '../../store/slices/ticketSlice'
import { createOrder } from '../../store/slices/orderSlice'
import { formatTime, formatPrice, getSeatTypeName } from '../../utils/format'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'
import Loading from '../../components/Loading'
import { usePassengers } from '../../hooks/usePassengers'
import dayjs from 'dayjs'
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
  const { passengers, addPassenger } = usePassengers()
  
  // 筛选和排序状态
  const [filterExpanded, setFilterExpanded] = useState(false)
  const [filters, setFilters] = useState({
    timeRange: [], // 出发时间段
    trainTypes: [], // 车次类型
    priceRange: [0, 2000], // 价格区间
    onlyAvailable: false, // 仅显示有票
  })
  const [sortBy, setSortBy] = useState('departureTime') // 排序方式: departureTime, arrivalTime, duration, price

  // 统计激活的筛选条件数量
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.timeRange.length > 0) count++
    if (filters.trainTypes.length > 0) count++
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 2000) count++
    if (filters.onlyAvailable) count++
    return count
  }, [filters])

  useEffect(() => {
    // 从 URL查询参数或状态中获取搜索条件
    const params = location.state?.searchParams || searchParams
    if (params) {
      dispatch(searchTrips(params))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 日期切换
  const handleDateChange = useCallback((days) => {
    if (!searchParams) return
    const currentDate = dayjs(searchParams.departureDate)
    const newDate = currentDate.add(days, 'day')
    const newParams = {
      ...searchParams,
      departureDate: newDate.format('YYYY-MM-DD 00:00:00'),
    }
    dispatch(setSearchParams(newParams))
    dispatch(searchTrips(newParams))
  }, [searchParams, dispatch])

  // 筛选和排序后的车次列表
  const filteredAndSortedTrips = useMemo(() => {
    let result = [...tripList]

    // 应用筛选条件
    // 1. 时间段筛选
    if (filters.timeRange.length > 0) {
      result = result.filter(trip => {
        const hour = dayjs(trip.departureTime).hour()
        return filters.timeRange.some(range => {
          if (range === 'morning') return hour >= 6 && hour < 12
          if (range === 'afternoon') return hour >= 12 && hour < 18
          if (range === 'evening') return hour >= 18 && hour < 24
          if (range === 'night') return hour >= 0 && hour < 6
          return false
        })
      })
    }

    // 2. 车次类型筛选
    if (filters.trainTypes.length > 0) {
      result = result.filter(trip => {
        const firstChar = trip.tripNo.charAt(0).toUpperCase()
        return filters.trainTypes.includes(firstChar)
      })
    }

    // 3. 价格区间筛选
    result = result.filter(trip => {
      const price = trip.seats?.price || 0
      return price >= filters.priceRange[0] && price <= filters.priceRange[1]
    })

    // 4. 仅显示有票
    if (filters.onlyAvailable) {
      result = result.filter(trip => (trip.seats?.available || 0) > 0)
    }

    // 应用排序
    result.sort((a, b) => {
      if (sortBy === 'departureTime') {
        return new Date(a.departureTime) - new Date(b.departureTime)
      }
      if (sortBy === 'arrivalTime') {
        return new Date(a.arrivalTime) - new Date(b.arrivalTime)
      }
      if (sortBy === 'duration') {
        const getDuration = (d) => {
          if (!d) return 0
          const parts = d.match(/(\d+)/g)
          return parts ? parseInt(parts[0]) * 60 + (parseInt(parts[1]) || 0) : 0
        }
        return getDuration(a.duration) - getDuration(b.duration)
      }
      if (sortBy === 'price') {
        return (a.seats?.price || 0) - (b.seats?.price || 0)
      }
      return 0
    })

    return result
  }, [tripList, filters, sortBy])

  // 重置筛选条件
  const handleResetFilters = useCallback(() => {
    setFilters({
      timeRange: [],
      trainTypes: [],
      priceRange: [0, 2000],
      onlyAvailable: false,
    })
    setSortBy('departureTime')
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
      const passengerData = [
        {
          name: values.passengerName,
          idCard: values.passengerIdCard,
        },
      ]

      // 保存为常用乘客（如果勾选了保存）
      if (values.saveAsFrequent) {
        addPassenger({
          name: values.passengerName,
          idCard: values.passengerIdCard,
        })
      }

      const orderData = {
        tripId: selectedTrip.id,
        passengers: passengerData,
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

  // 选择常用乘客
  const handleSelectPassenger = useCallback((passenger) => {
    form.setFieldsValue({
      passengerName: passenger.name,
      passengerIdCard: passenger.idCard,
    })
    setPurchaseType('other')
  }, [form])

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

  const currentDate = searchParams?.departureDate ? dayjs(searchParams.departureDate) : dayjs()

  return (
    <div className="page-ticket-list page-container">
      <Card className="page-card" variant="borderless">
        <PageHeader
          title="车票列表"
          subtitle="查询到的车次与余票信息，选择合适的车次开始订票"
        />
        
        {/* 日期切换栏 */}
        {searchParams && (
          <div className="date-switch-bar">
            <Button 
              icon={<LeftOutlined />} 
              onClick={() => handleDateChange(-1)}
              disabled={currentDate.isSame(dayjs(), 'day') || currentDate.isBefore(dayjs(), 'day')}
            >
              前一天
            </Button>
            <span className="current-date">
              {currentDate.format('YYYY年MM月DD日')} ({currentDate.format('dddd')})
            </span>
            <Button 
              icon={<RightOutlined />} 
              iconPosition="end"
              onClick={() => handleDateChange(1)}
            >
              后一天
            </Button>
          </div>
        )}

        {/* 筛选和排序工具栏 */}
        <div className="filter-toolbar">
          <Space size="middle">
            <Badge count={activeFilterCount} offset={[-5, 5]}>
              <Button 
                icon={<FilterOutlined />} 
                onClick={() => setFilterExpanded(!filterExpanded)}
                type={filterExpanded ? 'primary' : 'default'}
              >
                {filterExpanded ? '收起筛选' : '展开筛选'}
              </Button>
            </Badge>
            
            <div className="sort-selector">
              <SortAscendingOutlined style={{ marginRight: 8, color: '#666' }} />
              <Select 
                value={sortBy}
                onChange={setSortBy}
                style={{ width: 140 }}
                bordered={false}
                options={[
                  { label: '出发时间', value: 'departureTime' },
                  { label: '到达时间', value: 'arrivalTime' },
                  { label: '历时最短', value: 'duration' },
                  { label: '价格最低', value: 'price' },
                ]}
              />
            </div>
            
            <Tag color="default">{filteredAndSortedTrips.length}/{tripList.length} 车次</Tag>
          </Space>
          
          {activeFilterCount > 0 && (
            <Button size="small" type="link" onClick={handleResetFilters}>
              清除筛选
            </Button>
          )}
        </div>
        
        {/* 筛选面板 */}
        {filterExpanded && (
          <Card className="filter-panel" size="small">
            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12} md={6}>
                <div className="filter-group">
                  <div className="filter-group-title">出发时间</div>
                  <Checkbox.Group 
                    value={filters.timeRange}
                    onChange={(values) => setFilters({...filters, timeRange: values})}
                  >
                    <Space direction="vertical" size={8}>
                      <Checkbox value="morning">早上 06:00-12:00</Checkbox>
                      <Checkbox value="afternoon">下午 12:00-18:00</Checkbox>
                      <Checkbox value="evening">晚上 18:00-24:00</Checkbox>
                      <Checkbox value="night">夜间 00:00-06:00</Checkbox>
                    </Space>
                  </Checkbox.Group>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <div className="filter-group">
                  <div className="filter-group-title">车次类型</div>
                  <Checkbox.Group 
                    value={filters.trainTypes}
                    onChange={(values) => setFilters({...filters, trainTypes: values})}
                  >
                    <Space direction="vertical" size={8}>
                      <Checkbox value="G">高铁 (G)</Checkbox>
                      <Checkbox value="D">动车 (D)</Checkbox>
                      <Checkbox value="K">快速 (K)</Checkbox>
                      <Checkbox value="T">特快 (T)</Checkbox>
                      <Checkbox value="Z">直达 (Z)</Checkbox>
                    </Space>
                  </Checkbox.Group>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <div className="filter-group">
                  <div className="filter-group-title">
                    价格区间：¥{filters.priceRange[0]} - ¥{filters.priceRange[1]}
                  </div>
                  <Slider 
                    range
                    min={0}
                    max={2000}
                    step={50}
                    value={filters.priceRange}
                    onChange={(values) => setFilters({...filters, priceRange: values})}
                    style={{ marginTop: 8 }}
                  />
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={4}>
                <div className="filter-group">
                  <div className="filter-group-title">其他</div>
                  <Checkbox 
                    checked={filters.onlyAvailable}
                    onChange={(e) => setFilters({...filters, onlyAvailable: e.target.checked})}
                  >
                    仅显示有票车次
                  </Checkbox>
                </div>
              </Col>
            </Row>
          </Card>
        )}
        {filteredAndSortedTrips.length === 0 ? (
          <EmptyState
            description={tripList.length === 0 ? "没有找到相关车次，请调整搜索条件" : "没有符合筛选条件的车次"}
            actionText="返回首页"
            actionPath="/home"
          />
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredAndSortedTrips}
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
            
            {/* 常用乘客选择 */}
            {passengers.length > 0 && purchaseType === 'other' && (
              <Form.Item label="常用乘客">
                <Space wrap>
                  {passengers.map((passenger) => (
                    <Tag
                      key={passenger.id}
                      color="blue"
                      style={{ cursor: 'pointer', padding: '4px 12px' }}
                      onClick={() => handleSelectPassenger(passenger)}
                    >
                      {passenger.name} ({passenger.idCard.slice(-4)})
                    </Tag>
                  ))}
                </Space>
              </Form.Item>
            )}
            
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
              rules={[
                { required: true, message: '请输入身份证号' },
                { pattern: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9Xx]$/, message: '身份证号格式不正确' }
              ]}
            >
              <Input placeholder="请输入身份证号" maxLength={18} />
            </Form.Item>
            
            {purchaseType === 'other' && (
              <Form.Item name="saveAsFrequent" valuePropName="checked">
                <Checkbox>保存为常用乘客</Checkbox>
              </Form.Item>
            )}
          </Form>
        </Modal>
      </Card>
    </div>
  )
}

export default TicketList
