// 个人中心页面
import { Card, Tabs, message } from 'antd'
import { UserOutlined, LockOutlined, WalletOutlined, TeamOutlined, FileTextOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import UserInfo from './components/UserInfo'
import ChangePassword from './components/ChangePassword'
import BalanceManagement from './components/BalanceManagement'
import PassengerManagement from './components/PassengerManagement'
import InvoiceManagement from './components/InvoiceManagement'
import { getUserProfile } from '../../store/slices/userSlice'
import './style.css'

function Profile() {
  const [activeTab, setActiveTab] = useState('info')
  const dispatch = useDispatch()
  const { userInfo, loading } = useSelector((state) => state.user)

  useEffect(() => {
    // 加载最新的用户信息
    dispatch(getUserProfile())
  }, [dispatch])

  const tabItems = [
    {
      key: 'info',
      label: (
        <span>
          <UserOutlined />
          个人信息
        </span>
      ),
      children: <UserInfo userInfo={userInfo} />,
    },
    {
      key: 'balance',
      label: (
        <span>
          <WalletOutlined />
          余额管理
        </span>
      ),
      children: <BalanceManagement userInfo={userInfo} />,
    },
    {
      key: 'passengers',
      label: (
        <span>
          <TeamOutlined />
          常用联系人
        </span>
      ),
      children: <PassengerManagement />,
    },
    {
      key: 'invoices',
      label: (
        <span>
          <FileTextOutlined />
          发票管理
        </span>
      ),
      children: <InvoiceManagement />,
    },
    {
      key: 'password',
      label: (
        <span>
          <LockOutlined />
          修改密码
        </span>
      ),
      children: <ChangePassword />,
    },
  ]

  return (
    <div className="page-profile page-container">
      <Card className="page-card" loading={loading}>
        <div className="profile-header">
          <h2 className="page-title">个人中心</h2>
          <p className="page-subtitle">管理您的个人信息、余额和密码</p>
        </div>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="profile-tabs"
        />
      </Card>
    </div>
  )
}

export default Profile

