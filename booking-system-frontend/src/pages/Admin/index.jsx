// 管理后台页面
import { useState, useEffect } from 'react'
import { Layout, Menu, Card, Row, Col, Statistic, Typography } from 'antd'
import {
  DashboardOutlined,
  EnvironmentOutlined,
  CarOutlined,
  DollarOutlined,
  UserOutlined,
  CloudUploadOutlined,
  BarChartOutlined,
} from '@ant-design/icons'
import StationManagement from './StationManagement'
import TripManagement from './TripManagement'
import PriceManagement from './PriceManagement'
import UserManagement from './UserManagement'
import BatchTripManagement from './BatchTripManagement'
import FinancialReport from './FinancialReport'
import { getStatistics } from '../../api/admin'
import './style.css'

const { Sider, Content } = Layout
const { Title } = Typography

function Admin() {
  const [selectedKey, setSelectedKey] = useState('dashboard')
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayTickets: 0,
    totalTrips: 0,
    totalUsers: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await getStatistics()
      if (response.data) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('获取统计数据失败', error)
    }
  }

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '数据总览',
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: '用户管理',
    },
    {
      key: 'stations',
      icon: <EnvironmentOutlined />,
      label: '站点管理',
    },
    {
      key: 'trips',
      icon: <CarOutlined />,
      label: '车次管理',
    },
    {
      key: 'batch-trips',
      icon: <CloudUploadOutlined />,
      label: '批量车次管理',
    },
    {
      key: 'prices',
      icon: <DollarOutlined />,
      label: '票价管理',
    },
    {
      key: 'financial',
      icon: <BarChartOutlined />,
      label: '财务报表',
    },
  ]

  const renderContent = () => {
    switch (selectedKey) {
      case 'dashboard':
        return (
          <div>
            <Title level={3} style={{ marginBottom: 24 }}>数据概览</Title>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card 
                  variant="borderless"
                  style={{ 
                    background: '#fff',
                    borderLeft: '4px solid #1890ff'
                  }}
                  styles={{ body: { padding: '20px' } }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#8c8c8c', marginBottom: '8px' }}>今日订单数</div>
                      <div style={{ fontSize: '28px', fontWeight: '600', color: '#262626' }}>
                        {stats.todayOrders}
                      </div>
                    </div>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '10px',
                      background: '#e6f7ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px'
                    }}>
                      📋
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card 
                  variant="borderless"
                  style={{ 
                    background: '#fff',
                    borderLeft: '4px solid #52c41a'
                  }}
                  styles={{ body: { padding: '20px' } }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#8c8c8c', marginBottom: '8px' }}>今日售票量</div>
                      <div style={{ fontSize: '28px', fontWeight: '600', color: '#262626' }}>
                        {stats.todayTickets}
                      </div>
                    </div>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '10px',
                      background: '#f6ffed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px'
                    }}>
                      🎫
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card 
                  variant="borderless"
                  style={{ 
                    background: '#fff',
                    borderLeft: '4px solid #faad14'
                  }}
                  styles={{ body: { padding: '20px' } }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#8c8c8c', marginBottom: '8px' }}>车次数量</div>
                      <div style={{ fontSize: '28px', fontWeight: '600', color: '#262626' }}>
                        {stats.totalTrips}
                      </div>
                    </div>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '10px',
                      background: '#fffbe6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px'
                    }}>
                      🚄
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card 
                  variant="borderless"
                  style={{ 
                    background: '#fff',
                    borderLeft: '4px solid #722ed1'
                  }}
                  styles={{ body: { padding: '20px' } }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#8c8c8c', marginBottom: '8px' }}>用户数量</div>
                      <div style={{ fontSize: '28px', fontWeight: '600', color: '#262626' }}>
                        {stats.totalUsers}
                      </div>
                    </div>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '10px',
                      background: '#f9f0ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px'
                    }}>
                      👥
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        )
      case 'users':
        return <UserManagement />
      case 'stations':
        return <StationManagement />
      case 'trips':
        return <TripManagement />
      case 'batch-trips':
        return <BatchTripManagement />
      case 'prices':
        return <PriceManagement />
      case 'financial':
        return <FinancialReport />
      default:
        return null
    }
  }

  return (
    <div className="page-admin page-container">
      <Layout style={{ minHeight: '100%', background: '#f0f2f5' }}>
        <Sider
          width={200}
          style={{
            background: '#001529',
            boxShadow: '2px 0 8px rgba(0,21,41,0.08)'
          }}
        >
          <div style={{ 
            padding: '24px 20px', 
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Title level={4} style={{ margin: 0, color: '#fff', fontSize: '18px' }}>
              管理后台
            </Title>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={({ key }) => setSelectedKey(key)}
            style={{ 
              borderRight: 0, 
              paddingTop: '16px',
              background: 'transparent'
            }}
            theme="dark"
          />
        </Sider>
        <Content style={{ padding: '24px', minHeight: 'calc(100vh - 200px)', background: '#f0f2f5' }}>
          {renderContent()}
        </Content>
      </Layout>
    </div>
  )
}

export default Admin
