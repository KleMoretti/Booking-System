import { useState, useEffect, useCallback } from 'react'
import { Table, Card, Button, Space, message, Popconfirm, Tag, Form, Input, DatePicker, Select } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { getAdminTripList, createTrip, updateTrip, deleteTrip } from '../../api/admin'
import { getStationList } from '../../api/ticket'
import { PAGINATION } from '../../utils/constants'
import TripFormModal from './components/TripFormModal'

function TripManagement() {
  // 查询表单与编辑表单使用不同的 Form 实例，避免互相干扰
  const [searchForm] = Form.useForm()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState([])
  const [stations, setStations] = useState([])
  const [pagination, setPagination] = useState({
    current: PAGINATION.DEFAULT_PAGE,
    pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
    total: 0,
  })
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)

  const fetchData = useCallback(async () => {
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
  }, [pagination.current, pagination.pageSize, searchForm])

  const fetchStations = useCallback(async () => {
    try {
      const response = await getStationList()
      if (response.data) {
        setStations(response.data)
      }
    } catch (error) {
      console.error('获取车站列表失败', error)
    }
  }, [])

  useEffect(() => {
    fetchData()
    fetchStations()
  }, [fetchData, fetchStations])

  const handleTableChange = (newPagination) => {
    setPagination(newPagination)
  }

  const handleSearch = () => {
    // 重置到第一页，依赖 pagination 的 useEffect 会自动触发 fetchData
    setPagination(prev => ({ ...prev, current: PAGINATION.DEFAULT_PAGE }))
    // 立即按当前筛选条件请求一次，避免在第一页时点击无效
    fetchData()
  }

  const handleReset = () => {
    searchForm.resetFields(['tripNumber', 'departureDate', 'departureStation', 'arrivalStation'])
    setPagination(prev => ({ ...prev, current: PAGINATION.DEFAULT_PAGE }))
    fetchData()
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
      departureTime: record.departureTime ? dayjs(record.departureTime, 'HH:mm') : null,
      arrivalTime: record.arrivalTime ? dayjs(record.arrivalTime, 'HH:mm') : null,
      date: record.date ? dayjs(record.date) : null,
    })
    setModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      
      // 格式化时间和日期
      const formattedValues = {
        ...values,
        departureTime: values.departureTime?.format('HH:mm'),
        arrivalTime: values.arrivalTime?.format('HH:mm'),
        date: values.date?.format('YYYY-MM-DD'),
      }

      if (editingRecord) {
        await updateTrip(editingRecord.id, formattedValues)
        message.success('更新成功')
      } else {
        await createTrip(formattedValues)
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
      await deleteTrip(id)
      message.success('删除成功')
      fetchData()
    } catch (error) {
      message.error('删除失败')
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
      width: 180,
      align: 'center',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: '14px' }}>
            {record.departureStation} → {record.arrivalStation}
          </div>
        </div>
      ),
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 110,
      align: 'center',
      render: (date) => (
        <Tag color="geekblue">{date || '-'}</Tag>
      ),
    },
    {
      title: '时间',
      key: 'time',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <div style={{ fontSize: '13px', color: '#595959' }}>
          {record.departureTime} - {record.arrivalTime}
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: 2 }}>({record.duration})</div>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button danger icon={<DeleteOutlined />}>
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
        title="车次管理" 
        variant="borderless"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            添加车次
          </Button>
        }
      >
        <Form
          form={searchForm}
          layout="inline"
          size="middle"
          style={{
            marginBottom: 16,
            padding: 12,
            background: '#fafafa',
            borderRadius: 8,
          }}
        >
          <Form.Item label="车次号" name="tripNumber">
            <Input placeholder="请输入车次号" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item label="出发日期" name="departureDate">
            <DatePicker allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item label="出发站" name="departureStation">
            <Select
              allowClear
              showSearch
              placeholder="请选择出发站"
              style={{ width: 180 }}
              optionFilterProp="children"
            >
              {stations.map(station => (
                <Select.Option key={station.id} value={station.name}>
                  {station.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="到达站" name="arrivalStation">
            <Select
              allowClear
              showSearch
              placeholder="请选择到达站"
              style={{ width: 180 }}
              optionFilterProp="children"
            >
              {stations.map(station => (
                <Select.Option key={station.id} value={station.name}>
                  {station.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
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

      {/* 添加/编辑模态框 */}
      <TripFormModal
        visible={modalVisible}
        editingRecord={editingRecord}
        stations={stations}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        form={form}
      />
    </div>
  )
}

export default TripManagement
