// 站点管理页面
import { useState, useEffect } from 'react'
import { Table, Card, Button, Space, Modal, Form, Input, message, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { getStationList, createStation, updateStation, deleteStation } from '../../api/ticket'

function StationManagement() {
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
      const response = await getStationList()
      if (response.data) {
        setDataSource(response.data)
      }
    } catch (error) {
      message.error('获取站点数据失败')
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
    form.setFieldsValue({
      ...record,
      // 兼容后端返回字段名为 code 或 stationCode 的情况
      code: record.code ?? record.stationCode,
    })
    setModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      // 同步表单中的 code 到 stationCode，兼容后端字段名
      const payload = {
        ...values,
        stationCode: values.code,
      }

      if (editingRecord) {
        await updateStation(editingRecord.id, payload)
        message.success('更新成功')
      } else {
        await createStation(payload)
        message.success('添加成功')
      }
      
      setModalVisible(false)
      fetchData()
    } catch (error) {
      if (error.errorFields) {
        message.warning('请填写完整信息')
      } else {
        message.error('操作失败')
      }
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteStation(id)
      message.success('删除成功')
      fetchData()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const columns = [
    {
      title: '站点ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      align: 'center',
    },
    {
      title: '站点名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name) => (
        <div style={{ fontWeight: 500, fontSize: '14px' }}>
          <EnvironmentOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {name}
        </div>
      ),
    },
    {
      title: '站点代码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      align: 'center',
      render: (code, record) => {
        const value = code ?? record.stationCode
        return value || '-'
      },
    },
    {
      title: '所在城市',
      dataIndex: 'city',
      key: 'city',
      width: 150,
      align: 'center',
    },
    {
      title: '详细地址',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此站点？"
            description="删除站点后，相关车次数据可能受影响"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card
        title={
          <Space>
            <EnvironmentOutlined />
            <span>站点管理</span>
          </Space>
        }
        variant="borderless"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            添加站点
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 个站点`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑站点' : '添加站点'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="name"
            label="站点名称"
            rules={[
              { required: true, message: '请输入站点名称' },
              { max: 100, message: '站点名称不能超过100个字符' },
            ]}
          >
            <Input placeholder="例如：北京南站" />
          </Form.Item>

          <Form.Item
            name="code"
            label="站点代码"
            rules={[
              { required: true, message: '请输入站点代码' },
              { max: 50, message: '站点代码不能超过50个字符' },
            ]}
          >
            <Input placeholder="例如：VNP" />
          </Form.Item>

          <Form.Item
            name="city"
            label="所在城市"
            rules={[
              { required: true, message: '请输入所在城市' },
              { max: 100, message: '城市名称不能超过100个字符' },
            ]}
          >
            <Input placeholder="例如：北京" />
          </Form.Item>

          <Form.Item
            name="address"
            label="详细地址"
            rules={[
              { max: 255, message: '地址不能超过255个字符' },
            ]}
          >
            <Input.TextArea
              rows={3}
              placeholder="请输入站点详细地址（可选）"
            />
          </Form.Item>
        </Form>

        <div
          style={{
            marginTop: 16,
            padding: '12px',
            background: '#fafafa',
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#595959',
          }}
        >
          <div style={{ fontWeight: 500, marginBottom: '4px', color: '#262626' }}>提示</div>
          <div>• 站点代码通常为车站的拼音缩写或电报码</div>
          <div>• 删除站点前请确认没有关联的车次数据</div>
        </div>
      </Modal>
    </div>
  )
}

export default StationManagement
