import { useState, useEffect } from 'react'
import { Table, Card, Button, Space, Modal, Form, InputNumber, message, Tag, Input, DatePicker, Select } from 'antd'
import { EditOutlined, DollarOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { getAdminTripList, updateTripPrice } from '../../api/admin'
import { getStationList } from '../../api/ticket'

function PriceManagement() {
  const [searchForm] = Form.useForm()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState([])
  const [stations, setStations] = useState([])
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
      const values = searchForm.getFieldsValue()
      const response = await getAdminTripList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        tripNumber: values.tripNumber,
        departureDate: values.departureDate ? values.departureDate.format('YYYY-MM-DD') : undefined,
        departureStation: values.departureStation,
        arrivalStation: values.arrivalStation,
        sortBy: values.sortBy,
        sortOrder: values.sortOrder,
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

  const fetchStations = async () => {
    try {
      const response = await getStationList()
      if (response.data) {
        setStations(response.data)
      }
    } catch (error) {
      console.error('获取车站列表失败', error)
    }
  }

  useEffect(() => {
    fetchStations()
  }, [])

  const handleTableChange = (newPagination) => {
    setPagination(newPagination)
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchData()
  }

  const handleReset = () => {
    searchForm.resetFields(['tripNumber', 'departureDate', 'departureStation', 'arrivalStation', 'sortBy', 'sortOrder'])
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchData()
  }

  const showEditModal = (record) => {
    setEditingRecord(record)
    form.setFieldsValue({
      price: record.seats?.price || 0,
      availableSeats: record.seats?.available || 0,
      totalSeats: record.seats?.total || 0,
    })
    setModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      
      await updateTripPrice(editingRecord.id, {
        price: values.price,
        availableSeats: values.availableSeats,
        totalSeats: values.totalSeats,
      })
      
      message.success('票价和座位信息更新成功')
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
          {record.date ? `${record.date} ${record.departureTime}` : record.departureTime}
        </div>
      ),
    },
    {
      title: '座位信息',
      key: 'seats',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '14px', color: '#262626', marginBottom: '4px' }}>
            <span style={{ fontWeight: 600 }}>可售：</span>
            <span style={{ color: '#52c41a' }}>{record.seats?.available || 0}</span>
          </div>
          <div style={{ fontSize: '13px', color: '#8c8c8c' }}>
            <span>总数：</span>
            <span>{record.seats?.total || 0}</span>
          </div>
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
        <Form
          form={searchForm}
          layout="vertical"
          size="middle"
          style={{
            marginBottom: 16,
            padding: '16px 16px 0',
            background: 'var(--color-bg-container)',
            borderRadius: 12,
            border: '1px solid var(--color-border-secondary)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <Form.Item label="车次号" name="tripNumber" style={{ marginBottom: 0 }}>
              <Input 
                placeholder="请输入车次号" 
                allowClear 
                style={{ width: '100%' }} 
              />
            </Form.Item>
            <Form.Item label="出发日期" name="departureDate" style={{ marginBottom: 0 }}>
              <DatePicker 
                allowClear 
                style={{ width: '100%' }} 
                placeholder="选择日期"
              />
            </Form.Item>
            <Form.Item label="出发站" name="departureStation" style={{ marginBottom: 0 }}>
              <Select
                allowClear
                showSearch
                placeholder="请选择出发站"
                style={{ width: '100%' }}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {stations.map(station => (
                  <Select.Option key={station.id} value={station.name}>
                    {station.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="到达站" name="arrivalStation" style={{ marginBottom: 0 }}>
              <Select
                allowClear
                showSearch
                placeholder="请选择到达站"
                style={{ width: '100%' }}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {stations.map(station => (
                  <Select.Option key={station.id} value={station.name}>
                    {station.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="排序字段" name="sortBy" style={{ marginBottom: 0 }}>
              <Select
                allowClear
                placeholder="选择排序字段"
                style={{ width: '100%' }}
              >
                <Select.Option value="tripNumber">车次号</Select.Option>
                <Select.Option value="date">日期</Select.Option>
                <Select.Option value="departureTime">出发时间</Select.Option>
                <Select.Option value="departureStation">出发站</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="排序方向" name="sortOrder" style={{ marginBottom: 0 }}>
              <Select
                allowClear
                placeholder="选择排序方向"
                style={{ width: '100%' }}
              >
                <Select.Option value="asc">升序</Select.Option>
                <Select.Option value="desc">降序</Select.Option>
              </Select>
            </Form.Item>
          </div>
          <div style={{ marginTop: 12, paddingBottom: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
          </div>
        </Form>

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
            name="totalSeats"
            label="总座位数"
            rules={[{ required: true, message: '请输入总座位数' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="请输入总座位数"
            />
          </Form.Item>

          <Form.Item
            name="availableSeats"
            label="可售座位数"
            rules={[
              { required: true, message: '请输入可售座位数' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const total = getFieldValue('totalSeats')
                  if (!value || value <= total) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('可售座位数不能超过总座位数'))
                },
              }),
            ]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="请输入可售座位数"
            />
          </Form.Item>

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
