// 首页
import { Card, Button, Form, DatePicker, Select, Row, Col, Typography } from 'antd'
import './style.css'

const { Title, Paragraph } = Typography

function Home() {
  const [form] = Form.useForm()

  const handleSearch = values => {
    // 暂不调用后端，仅保留接口位置
    console.log('搜索条件：', values)
  }

  return (
    <div className="page-home page-container">
      <Card className="page-card" bordered={false}>
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
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="出发站"
                name="fromStationId"
                rules={[{ required: true, message: '请选择出发站' }]}
              >
                <Select
                  placeholder="请选择出发站（后续接入站点接口）"
                  options={[]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="到达站"
                name="toStationId"
                rules={[{ required: true, message: '请选择到达站' }]}
              >
                <Select
                  placeholder="请选择到达站（后续接入站点接口）"
                  options={[]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <Form.Item
                label="出发日期"
                name="departureDate"
                rules={[{ required: true, message: '请选择日期' }]}
              >
                <DatePicker className="w-100" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row justify="end">
            <Col>
              <Button type="primary" size="large" htmlType="submit">
                查询车次
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  )
}

export default Home
