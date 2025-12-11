import { useState, useEffect } from 'react'
import { Table, Card, Button, Space, Modal, Form, InputNumber, message, Tag } from 'antd'
import { EditOutlined, DollarOutlined } from '@ant-design/icons'
import { getAdminTripList, updateTripPrice } from '../../api/admin'

function PriceManagement() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)

  useEffect(() => {
    fetchData()
  }, [pagination.current, pagination.pageSize])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await getAdminTripList({
        page: pagination.current,
        pageSize: pagination.pageSize,
      })
      
      if (response.data) {
        setDataSource(response.data.list || [])
        setPagination({
          ...pagination,
          total: response.data.total || 0,
        })
      }
    } catch (error) {
      message.error('获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleTableChange = (newPagination) => {
    setPagination(newPagination)
  }

  const showEditModal = (record) => {
    setEditingRecord(record)
    form.setFieldsValue({
      price: record.seats?.price || 0,
    })
    setModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      
      await updateTripPrice(editingRecord.id, {
        price: values.price,
      })
      
      message.success('票价更新成功')
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

  const columns = [
    {
      title: '车次',
      key: 'tripNumber',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600, fontSize: '15px' }}>{record.tripNumber}</span>
          <Tag size="small" color="blue">{record.trainType}</Tag>
        </div>
      ),
    },
    {
      title: '线路',
      key: 'route',
      width: 160,
      align: 'center',
      render: (_, record) => (
        <div style={{ fontWeight: 500, fontSize: '14px' }}>
          {record.departureStation} → {record.arrivalStation}
        </div>
      ),
    },
    {
      title: '出发时间',
      key: 'time',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <div style={{ fontSize: '13px', color: '#595959' }}>
          {record.departureTime}
        </div>
      ),
    },
    {
      title: '票价',
      key: 'price',
      width: 90,
      align: 'center',
      render: (_, record) => (
        <div style={{ 
          padding: '4px 12px',
          background: '#f0f5ff',
          border: '1px solid #d6e4ff',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 600,
          color: '#1d39c4',
          display: 'inline-block'
        }}>
          ¥{record.seats?.price || 0}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => showEditModal(record)}
        >
          修改
        </Button>
      ),
    },
  ]

  return (
    <div>
      <Card 
        title={
          <Space>
            <DollarOutlined />
            <span>票价管理</span>
          </Space>
        }
        variant="borderless"
      >
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          rowKey="id"
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>

      {/* 编辑票价模态框 */}
      <Modal
        title="修改票价"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={450}
      >
        {editingRecord && (
          <div style={{ 
            marginBottom: 20, 
            padding: '12px 16px', 
            background: '#fafafa', 
            border: '1px solid #f0f0f0',
            borderRadius: '6px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#262626' }}>
              {editingRecord.tripNumber} - {editingRecord.trainType}
            </div>
            <div style={{ fontSize: '13px', color: '#8c8c8c', marginTop: '4px' }}>
              {editingRecord.departureStation} → {editingRecord.arrivalStation}
            </div>
          </div>
        )}
        
        <Form form={form} layout="vertical">
          <Form.Item
            name="price"
            label="票价（元）"
            rules={[{ required: true, message: '请输入票价' }]}
          >
            <InputNumber
              min={0}
              step={10}
              style={{ width: '100%' }}
              placeholder="请输入票价"
              prefix="¥"
            />
          </Form.Item>
        </Form>

        <div style={{ 
          marginTop: 16, 
          padding: '12px', 
          background: '#fafafa', 
          border: '1px solid #d9d9d9',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#595959'
        }}>
          <div style={{ fontWeight: 500, marginBottom: '4px', color: '#262626' }}>提示</div>
          <div>票价修改后立即生效，请根据市场情况设置合理价格</div>
        </div>
      </Modal>
    </div>
  )
}

export default PriceManagement
