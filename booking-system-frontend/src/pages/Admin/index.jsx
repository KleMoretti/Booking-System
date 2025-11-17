// 管理后台页面
import { Card, Typography, Row, Col, Statistic } from 'antd'
import './style.css'

const { Title, Paragraph } = Typography

function Admin() {
  return (
    <div className="page-admin page-container">
      <Card className="page-card" bordered={false}>
        <Title level={3} className="page-title">
          管理后台总览
        </Title>
        <Paragraph className="page-subtitle">
          后续可在此管理车次、车站、票务策略等后台数据。
        </Paragraph>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Card bordered hoverable className="admin-stat-card">
              <Statistic title="今日订单数" value={0} suffix="单" />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered hoverable className="admin-stat-card">
              <Statistic title="今日售票量" value={0} suffix="张" />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered hoverable className="admin-stat-card">
              <Statistic title="车次数量" value={0} suffix="趟" />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered hoverable className="admin-stat-card">
              <Statistic title="用户数量" value={0} suffix="人" />
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default Admin
