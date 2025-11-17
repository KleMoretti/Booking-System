// 注册页面
import { Card, Form, Input, Button, Typography } from 'antd'
import { Link } from 'react-router-dom'
import './style.css'

const { Title, Paragraph } = Typography

function Register() {
  const [form] = Form.useForm()

  const handleRegister = values => {
    // 暂不调用后端，仅保留接口位置
    console.log('注册参数：', values)
  }

  return (
    <div className="page-register page-container">
      <Card className="page-card register-card" bordered={false}>
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
            rules={[{ required: true, message: '请输入手机号' }]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Form.Item
            label="确认密码"
            name="confirmPassword"
            dependencies={['password']}
            rules={[{ required: true, message: '请再次输入密码' }]}
          >
            <Input.Password placeholder="请再次输入密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
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
