// 完善个人信息弹窗组件
import { Modal, Form, Input, message } from 'antd'
import { validateIdCard } from '../../utils/validator'
import { updateUserProfile } from '../../api/user'
import { getUserProfile } from '../../store/slices/userSlice'
import { handleApiError, handleException } from '../../utils/errorHandler'
import { useDispatch } from 'react-redux'
import './style.css'

function CompleteProfileModal({ visible, onComplete }) {
  const [form] = Form.useForm()
  const dispatch = useDispatch()

  const handleSubmit = async (values) => {
    try {
      const response = await updateUserProfile(values)
      console.log('更新用户信息响应：', response)
      
      if (handleApiError(response, message, '信息提交失败')) {
        message.success('个人信息完善成功！')
        // 重新获取用户信息以确保数据同步
        await dispatch(getUserProfile()).unwrap()
        onComplete()
      }
    } catch (error) {
      // 捕获所有错误，显示统一的友好提示
      console.error('提交失败：', error)
      handleException(error, message, '信息提交失败，请稍后重试')
    }
  }

  return (
    <Modal
      title="完善个人信息"
      open={visible}
      onOk={() => form.submit()}
      onCancel={null}
      closable={false}
      maskClosable={false}
      keyboard={false}
      okText="提交"
      cancelButtonProps={{ style: { display: 'none' } }}
      className="complete-profile-modal"
      width={480}
    >
      <div className="modal-tip">
        为了确保您能够正常购票，请补充以下必要信息：
      </div>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="真实姓名"
          name="realName"
          rules={[
            { required: true, message: '请输入真实姓名' },
            { min: 2, max: 20, message: '姓名长度为2-20个字符' }
          ]}
        >
          <Input placeholder="请输入真实姓名（用于购票）" />
        </Form.Item>

        <Form.Item
          label="身份证号"
          name="idCard"
          rules={[
            { required: true, message: '请输入身份证号' },
            { validator: validateIdCard }
          ]}
        >
          <Input placeholder="请输入18位身份证号" maxLength={18} />
        </Form.Item>

        <Form.Item
          label="邮箱（选填）"
          name="email"
          rules={[
            { type: 'email', message: '请输入正确的邮箱地址' }
          ]}
        >
          <Input placeholder="用于接收订单通知" />
        </Form.Item>
      </Form>
      
      <div className="modal-notice">
        <strong>提示：</strong>姓名和身份证号将用于实名购票，请确保信息真实有效。
      </div>
    </Modal>
  )
}

export default CompleteProfileModal
