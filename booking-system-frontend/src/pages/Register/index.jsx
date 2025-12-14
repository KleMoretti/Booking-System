// 注册页面
import { Card, Form, Input, Button, Typography, message } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { PasswordInput } from 'antd-password-input-strength'
import { register } from '../../store/slices/userSlice'
import { validatePhone, validateConfirmPassword } from '../../utils/validator'
import './style.css'

const { Title, Paragraph } = Typography

function Register() {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.user)
  const [passwordLevel, setPasswordLevel] = useState(0)

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
            rules={[
              { required: true, message: '请输入密码' },
              {
                validator: async (_, value) => {
                  if (!value || value.length < 8) {
                    return Promise.reject('密码长度至少8位')
                  }
                  if (passwordLevel < 2) {
                    return Promise.reject('密码强度太弱，请使用字母、数字和特殊字符组合')
                  }
                  return Promise.resolve()
                }
              }
            ]}
            extra="密码强度：建议使用8位以上，包含大小写字母、数字和特殊字符"
          >
            <PasswordInput
              placeholder="请输入密码（至少8位）"
              onLevelChange={setPasswordLevel}
              settings={{
                colorScheme: {
                  levels: ['#ff4033', '#fe940d', '#ffd908', '#cbe11d', '#6ecc3a'],
                  noLevel: 'lightgrey'
                },
                height: 4,
                alwaysVisible: false
              }}
            />
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
