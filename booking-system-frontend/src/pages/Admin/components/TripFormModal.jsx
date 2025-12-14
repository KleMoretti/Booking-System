// 车次表单模态框组件
import React, { useEffect } from 'react'
import { Modal, Form, Input, Select, InputNumber, TimePicker, DatePicker, Space } from 'antd'
import dayjs from 'dayjs'
import { TRAIN_TYPE } from '../../../utils/constants'

function TripFormModal({ visible, editingRecord, stations, onOk, onCancel, form }) {
  // 自动计算历时
  const calculateDuration = () => {
    const departureTime = form.getFieldValue('departureTime')
    const arrivalTime = form.getFieldValue('arrivalTime')
    
    if (departureTime && arrivalTime) {
      const depTime = dayjs(departureTime.format('HH:mm'), 'HH:mm')
      let arrTime = dayjs(arrivalTime.format('HH:mm'), 'HH:mm')
      
      // 如果到达时间早于出发时间，说明是第二天
      if (arrTime.isBefore(depTime)) {
        arrTime = arrTime.add(1, 'day')
      }
      
      const diff = arrTime.diff(depTime, 'minute')
      const hours = Math.floor(diff / 60)
      const minutes = diff % 60
      
      const duration = `${hours}小时${minutes > 0 ? minutes + '分' : ''}`
      form.setFieldsValue({ duration })
    }
  }

  // 监听时间变化
  useEffect(() => {
    if (visible) {
      const departureTime = form.getFieldValue('departureTime')
      const arrivalTime = form.getFieldValue('arrivalTime')
      if (departureTime && arrivalTime) {
        calculateDuration()
      }
    }
  }, [visible])

  const handleTimeChange = () => {
    calculateDuration()
  }
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
            <TimePicker format="HH:mm" onChange={handleTimeChange} inputReadOnly allowClear={false} />
          </Form.Item>

          <Form.Item
            name="arrivalTime"
            label="到达时间"
            rules={[{ required: true, message: '请选择到达时间' }]}
          >
            <TimePicker format="HH:mm" onChange={handleTimeChange} inputReadOnly allowClear={false} />
          </Form.Item>

          <Form.Item
            name="duration"
            label="历时"
            rules={[{ required: true, message: '请输入历时' }]}
          >
            <Input placeholder="自动计算" disabled style={{ backgroundColor: '#f5f5f5' }} />
          </Form.Item>
        </Space>

        <Form.Item
          name="date"
          label="发车日期"
          rules={[{ required: true, message: '请选择发车日期' }]}
        >
          <DatePicker 
            format="YYYY-MM-DD" 
            style={{ width: '100%' }}
            disabledDate={(current) => {
              // 禁用今天之前的日期
              return current && current < dayjs().startOf('day')
            }}
            inputReadOnly
            allowClear={false}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default React.memo(TripFormModal)
