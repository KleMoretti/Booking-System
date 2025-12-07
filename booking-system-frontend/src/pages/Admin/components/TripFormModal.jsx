// 车次表单模态框组件
import { Modal, Form, Input, Select, InputNumber, TimePicker, Space } from 'antd'
import dayjs from 'dayjs'
import { TRAIN_TYPE } from '../../../utils/constants'

function TripFormModal({ visible, editingRecord, stations, onOk, onCancel, form }) {
  return (
    <Modal
      title={editingRecord ? '编辑车次' : '添加车次'}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      width={800}
      okText="确定"
      cancelText="取消"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="tripNumber"
          label="车次号"
          rules={[{ required: true, message: '请输入车次号' }]}
        >
          <Input placeholder="例如：G101" />
        </Form.Item>

        <Form.Item
          name="trainType"
          label="列车类型"
          rules={[{ required: true, message: '请选择列车类型' }]}
        >
          <Select placeholder="请选择">
            <Select.Option value={TRAIN_TYPE.HIGH_SPEED}>{TRAIN_TYPE.HIGH_SPEED}</Select.Option>
            <Select.Option value={TRAIN_TYPE.BULLET}>{TRAIN_TYPE.BULLET}</Select.Option>
            <Select.Option value={TRAIN_TYPE.NORMAL}>{TRAIN_TYPE.NORMAL}</Select.Option>
          </Select>
        </Form.Item>

        <Space style={{ width: '100%' }} size="large">
          <Form.Item
            name="departureStation"
            label="出发站"
            rules={[{ required: true, message: '请选择出发站' }]}
            style={{ flex: 1 }}
          >
            <Select placeholder="请选择" showSearch>
              {stations.map(station => (
                <Select.Option key={station.id} value={station.name}>
                  {station.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="arrivalStation"
            label="到达站"
            rules={[{ required: true, message: '请选择到达站' }]}
            style={{ flex: 1 }}
          >
            <Select placeholder="请选择" showSearch>
              {stations.map(station => (
                <Select.Option key={station.id} value={station.name}>
                  {station.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Space>

        <Space style={{ width: '100%' }} size="large">
          <Form.Item
            name="departureTime"
            label="出发时间"
            rules={[{ required: true, message: '请选择出发时间' }]}
          >
            <TimePicker format="HH:mm" />
          </Form.Item>

          <Form.Item
            name="arrivalTime"
            label="到达时间"
            rules={[{ required: true, message: '请选择到达时间' }]}
          >
            <TimePicker format="HH:mm" />
          </Form.Item>

          <Form.Item
            name="duration"
            label="历时"
            rules={[{ required: true, message: '请输入历时' }]}
          >
            <Input placeholder="例如：5小时30分" />
          </Form.Item>
        </Space>

        <Form.Item
          name="date"
          label="日期"
          rules={[{ required: true, message: '请输入日期' }]}
        >
          <Input placeholder="例如：2024-01-20" />
        </Form.Item>

        <h4>座位信息</h4>
        <Space style={{ width: '100%' }} size="large">
          <Form.Item 
            name="availableSeats" 
            label="可用座位"
            rules={[{ required: true, message: '请输入可用座位' }]}
          >
            <InputNumber min={0} placeholder="0" style={{ width: '150px' }} />
          </Form.Item>
          <Form.Item 
            name="totalSeats" 
            label="总座位"
            rules={[{ required: true, message: '请输入总座位' }]}
          >
            <InputNumber min={0} placeholder="0" style={{ width: '150px' }} />
          </Form.Item>
          <Form.Item 
            name="price" 
            label="票价（元）"
            rules={[{ required: true, message: '请输入票价' }]}
          >
            <InputNumber min={0} placeholder="0" style={{ width: '150px' }} />
          </Form.Item>
        </Space>
      </Form>
    </Modal>
  )
}

export default TripFormModal
