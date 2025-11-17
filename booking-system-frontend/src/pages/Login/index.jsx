// 登录页面
import { Card, Form, Input, Button, Typography } from 'antd'
import { Link } from 'react-router-dom'
import './style.css'

const { Title, Paragraph } = Typography

function Login() {
  const [form] = Form.useForm()

  const handleLogin = values => {
    // 暂不调用后端，仅保留接口位置
    console.log('登录参数：', values)
  }

  return (
    <div className="page-login page-container">
      <Card className="page-card login-card" bordered={false}>
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
            <Button type="primary" htmlType="submit" block size="large">
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
