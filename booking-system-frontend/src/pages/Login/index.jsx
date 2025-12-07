// 登录页面
import { Card, Form, Input, Button, Typography, message } from 'antd'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { login } from '../../store/slices/userSlice'
import './style.css'

const { Title, Paragraph } = Typography

function Login() {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { loading, error, isAuthenticated } = useSelector((state) => state.user)

  const from = location.state?.from?.pathname || '/home'

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  useEffect(() => {
    if (error) {
      message.error(error)
    }
  }, [error])

  const handleLogin = async (values) => {
    try {
      await dispatch(login(values)).unwrap()
      message.success('登录成功！')
      navigate(from, { replace: true })
    } catch (err) {
      // 错误已在 useEffect 中处理
    }
  }

  return (
    <div className="page-login page-container">
      <Card className="page-card login-card" variant="borderless">
        <Title level={3} className="page-title">
          登录账号
        </Title>
        <Paragraph className="page-subtitle">
          使用手机号或账号登录火车票预订系统。
        </Paragraph>
        <Form form={form} layout="vertical" onFinish={handleLogin}>
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" autoComplete="username" />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" autoComplete="current-password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              登录
            </Button>
          </Form.Item>
          <div className="login-extra">
            <span>还没有账号？</span>
            <Link to="/register">前往注册</Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default Login
