// 个人信息展示组件
import { Descriptions, Tag, Space } from 'antd'
import { formatDateTime } from '../../../utils/format'

function UserInfo({ userInfo }) {
  if (!userInfo) {
    return <div>暂无用户信息</div>
  }

  const isAdmin = userInfo.role === 'ADMIN' || userInfo.userType === 1

  const items = [
    {
      key: 'username',
      label: '用户名',
      children: userInfo.username,
    },
    {
      key: 'name',
      label: '姓名',
      children: userInfo.realName || userInfo.name || '-',
    },
    {
      key: 'idNumber',
      label: '身份证号',
      children: userInfo.idCardNo || userInfo.idNumber || '-',
    },
    {
      key: 'phone',
      label: '手机号',
      children: userInfo.phone || '-',
    },
    {
      key: 'email',
      label: '邮箱',
      children: userInfo.email || '-',
    },
    {
      key: 'balance',
      label: '账户余额',
      children: (
        <Space>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#1890ff' }}>
            ¥{(userInfo.balance || 0).toFixed(2)}
          </span>
        </Space>
      ),
    },
    {
      key: 'role',
      label: '用户角色',
      children: isAdmin ? (
        <Tag color="red">管理员</Tag>
      ) : (
        <Tag color="blue">普通用户</Tag>
      ),
    },
    {
      key: 'createdAt',
      label: '注册时间',
      children:
        (userInfo.createTime || userInfo.createdAt)
          ? formatDateTime(userInfo.createTime || userInfo.createdAt)
          : '-',
    },
  ]

  return (
    <div className="user-info-container">
      <Descriptions
        bordered
        column={{ xs: 1, sm: 1, md: 2 }}
        items={items}
        styles={{ label: { fontWeight: '600', width: '100px' } }}
        size="small"
      />
    </div>
  )
}

export default UserInfo

