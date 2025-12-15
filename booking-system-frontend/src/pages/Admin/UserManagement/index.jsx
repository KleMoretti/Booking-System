// 管理员 - 用户管理页面
import { Card, Table, Button, Space, Input, message, Modal, Form, Tag, Descriptions } from 'antd'
import { SearchOutlined, ReloadOutlined, LockOutlined, EyeOutlined } from '@ant-design/icons'
import { useState, useCallback, useEffect } from 'react'
import { getUserList, searchUsers, resetUserPassword, getUserDetail } from '../../../api/admin'
import { formatDateTime, formatIdCard } from '../../../utils/format'
import { API_CODE, PAGINATION } from '../../../utils/constants'
import PageHeader from '../../../components/PageHeader'
import './style.css'

const { Search } = Input

function UserManagement() {
  const [loading, setLoading] = useState(false)
  const [userList, setUserList] = useState([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
    total: 0,
  })
  const [searchKeyword, setSearchKeyword] = useState('')
  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [userDetail, setUserDetail] = useState(null)
  const [form] = Form.useForm()

  // 加载用户列表（无关键词，调用 /admin/users）
  const loadUserList = useCallback(async (page = 1, pageSize = PAGINATION.DEFAULT_PAGE_SIZE) => {
    setLoading(true)
    try {
      const response = await getUserList({
        page,
        pageSize,
      })

      if (response.code === API_CODE.SUCCESS) {
        setUserList(response.data.list || [])
        setPagination({
          current: page,
          pageSize,
          total: response.data.total || 0,
        })
      } else {
        message.error(response.message || '获取用户列表失败')
      }
    } catch (error) {
      console.error('获取用户列表失败：', error)
      message.error('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [])

  // 搜索用户（有关键词时调用 /admin/users/search，没关键词时调用 /admin/users）
  const handleSearch = useCallback(async (keyword = searchKeyword, page = 1, pageSize = PAGINATION.DEFAULT_PAGE_SIZE) => {
    const trimmed = keyword ? keyword.trim() : ''
    if (!trimmed) {
      // 无关键词时，查询全部用户
      loadUserList(page, pageSize)
      return
    }

    setLoading(true)
    try {
      const response = await searchUsers({
        keyword: trimmed,
        page,
        pageSize,
      })

      if (response.code === API_CODE.SUCCESS) {
        setUserList(response.data.list || [])
        setPagination({
          current: page,
          pageSize,
          total: response.data.total || 0,
        })
      } else {
        message.error(response.message || '搜索失败')
      }
    } catch (error) {
      console.error('搜索用户失败：', error)
      message.error('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [searchKeyword, loadUserList])

  // 初始进入页面时加载一页用户列表
  useEffect(() => {
    loadUserList()
  }, [loadUserList])

  // 表格分页变化
  const handleTableChange = (newPagination) => {
    handleSearch(searchKeyword, newPagination.current, newPagination.pageSize)
  }

  // 查看用户详情
  const handleViewDetail = async (userId) => {
    try {
      const response = await getUserDetail(userId)
      if (response.code === API_CODE.SUCCESS) {
        setUserDetail(response.data)
        setDetailModalVisible(true)
      } else {
        message.error(response.message || '获取用户详情失败')
      }
    } catch (error) {
      console.error('获取用户详情失败：', error)
      message.error('网络错误')
    }
  }

  // 重置密码
  const handleResetPassword = (user) => {
    setSelectedUser(user)
    setResetPasswordModalVisible(true)
    form.resetFields()
  }

  const handleResetPasswordConfirm = async () => {
    try {
      const values = await form.validateFields()
      const response = await resetUserPassword(selectedUser.userId, {
        newPassword: values.newPassword,
        reason: values.reason,
      })
      
      if (response.code === API_CODE.SUCCESS) {
        message.success('密码重置成功')
        setResetPasswordModalVisible(false)
        form.resetFields()
      } else {
        message.error(response.message || '密码重置失败')
      }
    } catch (error) {
      if (error.errorFields) {
        return
      }
      console.error('重置密码失败：', error)
      message.error('网络错误')
    }
  }

  const columns = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      width: '8%',
      align: 'center',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      width: '12%',
    },
    {
      title: '真实姓名',
      dataIndex: 'realName',
      width: '10%',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      width: '12%',
    },
    {
      title: '身份证号',
      dataIndex: 'idCard',
      width: '15%',
      render: (idCard) => idCard ? formatIdCard(idCard) : '-',
    },
    {
      title: '用户类型',
      dataIndex: 'userType',
      width: '10%',
      align: 'center',
      render: (userType) => {
        const typeValue = Number(userType)
        if (typeValue === 1) {
          return <Tag color="blue">管理员</Tag>
        }
        return <Tag color="green">普通用户</Tag>
      },
    },
    {
      title: '余额',
      dataIndex: 'balance',
      width: '10%',
      align: 'right',
      render: (balance) => `¥${(balance || 0).toFixed(2)}`,
    },
    {
      title: '注册时间',
      dataIndex: 'createTime',
      width: '13%',
      render: (time) => formatDateTime(time),
    },
    {
      title: '操作',
      key: 'action',
      width: '10%',
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record.userId)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<LockOutlined />}
            onClick={() => handleResetPassword(record)}
          >
            重置密码
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div className="page-admin-user-management page-container">
      <PageHeader
        title="用户管理"
        description="搜索用户、查看详情、重置密码"
      />

      <Card className="page-card" variant="borderless">
        <div className="search-bar">
          <Search
            placeholder="输入用户名、手机号或身份证号搜索"
            allowClear
            enterButton={<><SearchOutlined /> 搜索</>}
            size="large"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onSearch={(value) => handleSearch(value, 1)}
            style={{ maxWidth: 600 }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearchKeyword('')
              loadUserList(1, PAGINATION.DEFAULT_PAGE_SIZE)
            }}
          >
            刷新
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={userList}
          rowKey="userId"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 重置密码Modal */}
      <Modal
        title="重置用户密码"
        open={resetPasswordModalVisible}
        onOk={handleResetPasswordConfirm}
        onCancel={() => {
          setResetPasswordModalVisible(false)
          form.resetFields()
        }}
        width={500}
      >
        {selectedUser && (
          <div style={{ marginBottom: 16 }}>
            <p><strong>用户名：</strong>{selectedUser.username}</p>
            <p><strong>真实姓名：</strong>{selectedUser.realName || '-'}</p>
          </div>
        )}
        <Form form={form} layout="vertical">
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度不能少于6位' },
              { max: 20, message: '密码长度不能超过20位' },
            ]}
          >
            <Input.Password placeholder="请输入新密码（6-20位）" />
          </Form.Item>
          <Form.Item
            name="reason"
            label="重置原因"
            rules={[
              { required: true, message: '请输入重置原因' },
            ]}
          >
            <Input.TextArea
              rows={3}
              placeholder="请说明重置密码的原因（将记录到操作日志）"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 用户详情Modal */}
      <Modal
        title="用户详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {userDetail && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="用户ID">{userDetail.userId}</Descriptions.Item>
            <Descriptions.Item label="用户名">{userDetail.username}</Descriptions.Item>
            <Descriptions.Item label="真实姓名">{userDetail.realName || '-'}</Descriptions.Item>
            <Descriptions.Item label="手机号">{userDetail.phone || '-'}</Descriptions.Item>
            <Descriptions.Item label="身份证号">{userDetail.idCard ? formatIdCard(userDetail.idCard) : '-'}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{userDetail.email || '-'}</Descriptions.Item>
            <Descriptions.Item label="用户类型">
              {Number(userDetail.userType) === 1 ? (
                <Tag color="blue">管理员</Tag>
              ) : (
                <Tag color="green">普通用户</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="账户余额">
              ¥{(userDetail.balance || 0).toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="注册时间" span={2}>
              {formatDateTime(userDetail.createTime)}
            </Descriptions.Item>
            <Descriptions.Item label="订单数量" span={2}>
              总订单：{userDetail.orderCount || 0} 笔
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default UserManagement
