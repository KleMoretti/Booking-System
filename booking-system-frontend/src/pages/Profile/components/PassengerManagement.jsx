// 常用联系人管理组件
import { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, Form, Input, Select, message, Popconfirm, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons'
import { getPassengerList, createPassenger, updatePassenger, deletePassenger } from '../../../api/passenger'
import { API_CODE } from '../../../utils/constants'

const { Option } = Select

function PassengerManagement() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await getPassengerList()
      if (response.code === API_CODE.SUCCESS && response.data) {
        setDataSource(response.data)
      }
    } catch (error) {
      message.error('获取常用联系人失败')
    } finally {
      setLoading(false)
    }
  }

  const showAddModal = () => {
    setEditingRecord(null)
    form.resetFields()
    setModalVisible(true)
  }

  const showEditModal = (record) => {
    setEditingRecord(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      if (editingRecord) {
        // 编辑
        const response = await updatePassenger(editingRecord.passengerId, values)
        if (response.code === API_CODE.SUCCESS) {
          message.success('更新成功')
          setModalVisible(false)
          fetchData()
        }
      } else {
        // 新增
        const response = await createPassenger(values)
        if (response.code === API_CODE.SUCCESS) {
          message.success('添加成功')
          setModalVisible(false)
          fetchData()
        }
      }
    } catch (error) {
      console.error('保存失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (passengerId) => {
    try {
      const response = await deletePassenger(passengerId)
      if (response.code === API_CODE.SUCCESS) {
        message.success('删除成功')
        fetchData()
      }
    } catch (error) {
      message.error('删除失败')
    }
  }

  const columns = [
    {
      title: '姓名',
      dataIndex: 'passengerName',
      key: 'passengerName',
      width: 120,
    },
    {
      title: '证件类型',
      dataIndex: 'idCardType',
      key: 'idCardType',
      width: 100,
      render: (type) => {
        const typeMap = { 0: '身份证', 1: '护照', 2: '其他' }
        return typeMap[type] || '未知'
      },
    },
    {
      title: '证件号码',
      dataIndex: 'idCardNo',
      key: 'idCardNo',
      width: 180,
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: '旅客类型',
      dataIndex: 'passengerType',
      key: 'passengerType',
      width: 100,
      render: (type) => {
        const typeMap = { 0: '成人', 1: '儿童', 2: '学生' }
        const colorMap = { 0: 'blue', 1: 'green', 2: 'orange' }
        return <Tag color={colorMap[type]}>{typeMap[type] || '未知'}</Tag>
      },
    },
    {
      title: '默认',
      dataIndex: 'isDefault',
      key: 'isDefault',
      width: 80,
      render: (isDefault) => (isDefault === 1 ? <Tag color="red">默认</Tag> : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此联系人？"
            onConfirm={() => handleDelete(record.passengerId)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="passenger-management">
      <div className="passenger-header">
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          添加联系人
        </Button>
      </div>

      <Table
        loading={loading}
        dataSource={dataSource}
        columns={columns}
        rowKey="passengerId"
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total) => `共 ${total} 条`,
        }}
        scroll={{ x: 900 }}
      />

      <Modal
        title={editingRecord ? '编辑联系人' : '添加联系人'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        width={600}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            label="姓名"
            name="passengerName"
            rules={[
              { required: true, message: '请输入姓名' },
              { max: 50, message: '姓名不能超过50个字符' },
            ]}
          >
            <Input placeholder="请输入真实姓名" prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item
            label="证件类型"
            name="idCardType"
            initialValue={0}
            rules={[{ required: true, message: '请选择证件类型' }]}
          >
            <Select>
              <Option value={0}>身份证</Option>
              <Option value={1}>护照</Option>
              <Option value={2}>其他</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="证件号码"
            name="idCardNo"
            rules={[
              { required: true, message: '请输入证件号码' },
              { max: 32, message: '证件号码不能超过32个字符' },
            ]}
          >
            <Input placeholder="请输入证件号码" />
          </Form.Item>

          <Form.Item
            label="联系电话"
            name="phone"
            rules={[
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
            ]}
          >
            <Input placeholder="请输入联系电话（可选）" />
          </Form.Item>

          <Form.Item
            label="旅客类型"
            name="passengerType"
            initialValue={0}
            rules={[{ required: true, message: '请选择旅客类型' }]}
          >
            <Select>
              <Option value={0}>成人</Option>
              <Option value={1}>儿童</Option>
              <Option value={2}>学生</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="设为默认"
            name="isDefault"
            initialValue={0}
            rules={[{ required: true }]}
          >
            <Select>
              <Option value={0}>否</Option>
              <Option value={1}>是</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default PassengerManagement
