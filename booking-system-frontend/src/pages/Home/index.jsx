// 首页
import { Card, Button, Form, DatePicker, Select, Row, Col, Typography, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { SwapOutlined } from '@ant-design/icons'
import { setSearchParams } from '../../store/slices/ticketSlice'
import { getStationList } from '../../api/ticket'
import { API_CODE } from '../../utils/constants'
import dayjs from 'dayjs'
import './style.css'

const { Title, Paragraph } = Typography

function Home() {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(false)

  const loadStations = useCallback(async () => {
    try {
      const response = await getStationList()
      if (response.code === API_CODE.SUCCESS) {
        setStations(response.data)
      } else {
        message.error(response.message || '加载车站列表失败')
      }
    } catch (error) {
      console.error('加载车站失败：', error)
      message.error('网络错误，请稍后重试')
    }
  }, [])

  // 使用 useMemo 优化 stations 选项计算
  const stationOptions = useMemo(() => 
    stations.map(station => ({
      label: station.name,
      value: station.id,
    })),
  [stations])

  useEffect(() => {
    loadStations()
  }, [loadStations])

  const handleSwapStations = useCallback(() => {
    const fromStation = form.getFieldValue('fromStationId')
    const toStation = form.getFieldValue('toStationId')
    form.setFieldsValue({
      fromStationId: toStation,
      toStationId: fromStation,
    })
  }, [form])

  const handleSearch = async (values) => {
    if (values.fromStationId === values.toStationId) {
      message.warning('出发站和到达站不能相同')
      return
    }

    const searchParams = {
      ...values,
      departureDate: values.departureDate.format('YYYY-MM-DD'),
    }

    // 保存搜索条件到Redux
    dispatch(setSearchParams(searchParams))

    // 跳转到车票列表页
    navigate('/tickets', { state: { searchParams } })
  }

  return (
    <div className="page-home page-container">
      <Card className="page-card" variant="borderless">
        <div className="home-header">
          <div>
            <Title level={3} className="page-title">
              一站式火车票预订
            </Title>
            <Paragraph className="page-subtitle">
              选择出发地、目的地和日期，快速查询车次与余票信息。
            </Paragraph>
          </div>
        </div>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSearch}
          className="home-search-form"
          initialValues={{
            departureDate: dayjs(),
          }}
        >
          <Row gutter={16} align="bottom">
            <Col xs={24} sm={11} md={8}>
              <Form.Item
                label="出发站"
                name="fromStationId"
                rules={[{ required: true, message: '请选择出发站' }]}
              >
                <Select
                  showSearch
                  placeholder="请选择出发站"
                  options={stationOptions}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={2} md={1} className="swap-button-col">
              <Button
                icon={<SwapOutlined />}
                onClick={handleSwapStations}
                className="swap-stations-btn"
              />
            </Col>
            <Col xs={24} sm={11} md={7}>
              <Form.Item
                label="到达站"
                name="toStationId"
                rules={[{ required: true, message: '请选择到达站' }]}
              >
                <Select
                  showSearch
                  placeholder="请选择到达站"
                  options={stationOptions}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={6}>
              <Form.Item
                label="出发日期"
                name="departureDate"
                rules={[{ required: true, message: '请选择日期' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={2}>
              <Form.Item>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={loading}
                  block
                >
                  查询
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  )
}

export default Home
