// 注册页面
import { Card, Form, Input, Button, Typography, message } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { register } from '../../store/slices/userSlice'
import { validatePhone, validatePassword, validateConfirmPassword } from '../../utils/validator'
import './style.css'

const { Title, Paragraph } = Typography

function Register() {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.user)

  useEffect(() => {
    if (error) {
      message.error(error)
    }
  }, [error])

  const handleRegister = async (values) => {
    try {
      await dispatch(register(values)).unwrap()
      message.success('注册成功！请登录')
      navigate('/login')
    } catch (err) {
      // 错误已在 useEffect 中处理
    }
  }

  return (
    <div className="page-register page-container">
      <Card className="page-card register-card" variant="borderless">
        <Title level={3} className="page-title">
          注册账号
        </Title>
        <Paragraph className="page-subtitle">
          创建一个新账号以开始使用火车票预订系统。
        </Paragraph>
        <Form form={form} layout="vertical" onFinish={handleRegister}>
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            label="手机号"
            name="phone"
            rules={[{ required: true, validator: validatePhone }]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, validator: validatePassword }]}
          >
            <Input.Password placeholder="请输入密码（至少6位）" />
          </Form.Item>
          <Form.Item
            label="确认密码"
            name="confirmPassword"
            dependencies={['password']}
            rules={[{ required: true, validator: validateConfirmPassword(form) }]}
          >
            <Input.Password placeholder="请再次输入密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              注册
            </Button>
          </Form.Item>
          <div className="register-extra">
            <span>已经有账号？</span>
            <Link to="/login">前往登录</Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default Register
