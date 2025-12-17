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
    searchForm.resetFields(['tripNumber', 'departureDate', 'departureStation', 'arrivalStation', 'sortBy', 'sortOrder'])
    setPagination(prev => ({ ...prev, current: PAGINATION.DEFAULT_PAGE }))
    fetchData()
  }

  const showAddModal = () => {
    setEditingRecord(null)
    form.resetFields()
    setModalVisible(true)
  }

  const showEditModal = (record) => {
    // 检查车次状态是否可编辑：已删除(3)和已完成(2)不可编辑
    if (record.status === 2 || record.status === 3) {
      message.warning(`该车次状态为「${record.statusText}」，不可编辑`)
      return
    }
    
    setEditingRecord(record)
    // 组合日期和时间为完整的日期时间
    const departureDateTime = record.date && record.departureTime 
      ? dayjs(`${record.date} ${record.departureTime}`, 'YYYY-MM-DD HH:mm')
      : null
    
    // 到达时间可能跨天，需要根据历时计算
    let arrivalDateTime = null
    if (record.date && record.arrivalTime) {
      const baseArrivalTime = dayjs(`${record.date} ${record.arrivalTime}`, 'YYYY-MM-DD HH:mm')
      // 如果到达时间早于出发时间，说明是第二天或更晚
      if (departureDateTime && baseArrivalTime.isBefore(departureDateTime)) {
        // 从历时字符串中提取天数
        const durationMatch = record.duration?.match(/(\d+)天/)
        const days = durationMatch ? parseInt(durationMatch[1]) : 1
        arrivalDateTime = baseArrivalTime.add(days, 'day')
      } else {
        arrivalDateTime = baseArrivalTime
      }
    }
    
    form.setFieldsValue({
      ...record,
      departureTime: departureDateTime,
      arrivalTime: arrivalDateTime,
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
        // 使用出发时间的日期作为发车日期
        date: values.departureTime?.format('YYYY-MM-DD') || values.date?.format('YYYY-MM-DD'),
      }

      let res
      if (editingRecord) {
        res = await updateTrip(editingRecord.id, formattedValues)
      } else {
        res = await createTrip(formattedValues)
      }

      if (res && res.code === 200) {
        message.success(editingRecord ? '更新成功' : '添加成功')
        setModalVisible(false)
        fetchData()
      } else {
        message.error(res?.message || '操作失败')
      }
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
      title: '状态',
      key: 'status',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const statusConfig = {
          0: { color: 'blue', text: '计划中' },
          1: { color: 'orange', text: '进行中' },
          2: { color: 'default', text: '已完成' },
          3: { color: 'red', text: '已删除' },
        }
        const config = statusConfig[record.status] || { color: 'default', text: '未知' }
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      align: 'center',
      render: (_, record) => {
        const isEditable = record.status !== 2 && record.status !== 3
        const isDeletable = record.status !== 3
        
        return (
          <Space size="small">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
              disabled={!isEditable}
              title={!isEditable ? `${record.statusText}状态不可编辑` : '编辑车次'}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定删除？"
              description="删除后车次将被标记为已删除状态，用户将无法搜索到该车次"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
              disabled={!isDeletable}
            >
              <Button 
                danger 
                icon={<DeleteOutlined />}
                disabled={!isDeletable}
                title={!isDeletable ? '已删除的车次不可再次删除' : '删除车次'}
              >
                删除
              </Button>
            </Popconfirm>
          </Space>
        )
      },
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
