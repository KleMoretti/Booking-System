// 页面头部组件
import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, Dropdown, Avatar, message } from 'antd'
import { UserOutlined, HomeOutlined, ProfileOutlined, OrderedListOutlined, DashboardOutlined, LogoutOutlined, SwapOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/slices/userSlice'
import './style.css'

const { Header: AntHeader } = Layout

const navItems = [
  { key: '/home', label: '首页', icon: <HomeOutlined /> },
  { key: '/tickets', label: '车票查询', icon: <OrderedListOutlined /> },
  { key: '/orders', label: '我的订单', icon: <ProfileOutlined /> },
  { key: '/refund-change', label: '退票改签', icon: <SwapOutlined /> },
  { key: '/admin', label: '后台管理', icon: <DashboardOutlined /> },
]

function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { userInfo, isAuthenticated } = useSelector((state) => state.user)
  
  // 管理员检查（userType: 1 = 管理员，0 = 普通用户）
  const isAdmin = userInfo?.userType === 1

  const handleLogout = () => {
    dispatch(logout())
    message.success('登出成功')
    navigate('/login')
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  return (
    <AntHeader className="app-header">
      <div className="app-header-left">
        <Link to="/home" className="app-logo">
          <span className="logo-text">火车票预订</span>
        </Link>
      </div>
      <Menu
        theme="light"
        mode="horizontal"
        selectedKeys={[navItems.find(item => location.pathname.startsWith(item.key))?.key || '/home']}
        items={navItems
          .filter(item => {
            // 管理后台仅管理员可见
            if (item.key === '/admin') {
              return isAdmin
            }
            return true
          })
          .map(item => ({
            key: item.key,
            icon: item.icon,
            label: <Link to={item.key}>{item.label}</Link>,
          }))}
        className="app-header-menu"
      />
      <div className="app-header-right">
        {isAuthenticated && userInfo ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className="user-info">
              <Avatar icon={<UserOutlined />} className="user-avatar" />
              <span className="user-name">{userInfo.username || '用户'}</span>
            </div>
          </Dropdown>
        ) : (
          <Link to="/login" className="user-entry">
            <UserOutlined />
            <span className="user-entry-text">登录 / 注册</span>
          </Link>
        )}
      </div>
    </AntHeader>
  )
}

export default React.memo(Header)
