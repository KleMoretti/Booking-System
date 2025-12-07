import { useState, useEffect, useCallback } from 'react'
import { Table, Card, Button, Space, message, Popconfirm, Tag, Form } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { getAdminTripList, createTrip, updateTrip, deleteTrip } from '../../api/admin'
import { getStationList } from '../../api/ticket'
import { PAGINATION } from '../../utils/constants'
import TripFormModal from './components/TripFormModal'

function TripManagement() {
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
  }, [pagination.current, pagination.pageSize])

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
      availableSeats: record.seats?.available || 0,
      totalSeats: record.seats?.total || 0,
      price: record.seats?.price || 0,
    })
    setModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      
      // 格式化时间
      const formattedValues = {
        ...values,
        departureTime: values.departureTime?.format('HH:mm'),
        arrivalTime: values.arrivalTime?.format('HH:mm'),
        seats: {
          available: values.availableSeats,
          total: values.totalSeats,
          price: values.price,
        },
      }

      // 移除临时字段
      delete formattedValues.availableSeats
      delete formattedValues.totalSeats
      delete formattedValues.price

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
      title: '时间',
      key: 'time',
      width: 180,
      align: 'center',
      render: (_, record) => (
        <div style={{ fontSize: '13px', color: '#595959' }}>
          {record.departureTime} - {record.arrivalTime}
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: 2 }}>({record.duration})</div>
        </div>
      ),
    },
    {
      title: '座位',
      key: 'seats',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <div style={{ fontSize: '14px', color: '#262626' }}>
          {record.seats.available}<span style={{ color: '#8c8c8c' }}>/{record.seats.total}</span>
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
          ¥{record.seats.price}
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
        bordered={false}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            添加车次
          </Button>
        }
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
