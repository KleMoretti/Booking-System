// 修改密码组件
import { Form, Input, Button, message, Card } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { changePassword } from '../../../api/user'
import { API_CODE } from '../../../utils/constants'

function ChangePassword() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      const response = await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      })

      if (response.code === API_CODE.SUCCESS) {
        message.success('密码修改成功，请重新登录')
        form.resetFields()
        // 可以考虑跳转到登录页
        setTimeout(() => {
          window.location.href = '/login'
        }, 1500)
      } else {
        message.error(response.message || '密码修改失败')
      }
    } catch (error) {
      console.error('修改密码失败：', error)
      message.error('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="change-password-container">
      <Card variant="borderless">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: '450px' }}
        >
          <Form.Item
            label="原密码"
            name="oldPassword"
            rules={[
              { required: true, message: '请输入原密码' },
              { min: 6, message: '密码至少6位' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入原密码"
            />
          </Form.Item>

          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6位' },
              { max: 20, message: '密码最多20位' },
              {
                pattern: /^(?=.*[a-zA-Z])(?=.*\d).+$/,
                message: '密码必须包含字母和数字',
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入新密码（6-20位，需包含字母和数字）"
            />
          </Form.Item>

          <Form.Item
            label="确认新密码"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请再次输入新密码"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              修改密码
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default ChangePassword

