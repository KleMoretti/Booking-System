import { useState, useEffect } from 'react'
import { Table, Card, Tag, Button, Space, Modal, Input, Select, message, Tabs } from 'antd'
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons'
import { getRefundChangeList, processRefundChange } from '../../api/admin'

const { TextArea } = Input

function RefundChangeManagement() {
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [filters, setFilters] = useState({
    type: null,
    status: null,
  })
  const [detailVisible, setDetailVisible] = useState(false)
  const [processVisible, setProcessVisible] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [processAction, setProcessAction] = useState('approve')
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    fetchData()
  }, [pagination.current, pagination.pageSize, filters])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await getRefundChangeList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...filters,
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

  const handleTabChange = (key) => {
    setFilters({
      ...filters,
      type: key === 'all' ? null : key,
    })
    setPagination({ ...pagination, current: 1 })
  }

  const showDetail = (record) => {
    setSelectedRecord(record)
    setDetailVisible(true)
  }

  const showProcess = (record, action) => {
    setSelectedRecord(record)
    setProcessAction(action)
    setRejectReason('')
    setProcessVisible(true)
  }

  const handleProcess = async () => {
    if (processAction === 'reject' && !rejectReason.trim()) {
      message.warning('请输入拒绝原因')
      return
    }

    try {
      await processRefundChange(selectedRecord.id, {
        action: processAction,
        rejectReason: processAction === 'reject' ? rejectReason : null,
      })
      message.success(processAction === 'approve' ? '审核通过' : '已拒绝')
      setProcessVisible(false)
      fetchData()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const columns = [
    {
      title: '类型',
      dataIndex: 'typeText',
      key: 'typeText',
      width: 80,
      align: 'center',
      render: (text, record) => (
        <Tag color={record.type === 'refund' ? 'volcano' : 'blue'}>{text}</Tag>
      ),
    },
    {
      title: '乘客与订单',
      key: 'orderInfo',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '14px' }}>{record.passengerName}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: 2 }}>{record.orderNumber}</div>
        </div>
      ),
    },
    {
      title: '行程信息',
      key: 'tripInfo',
      width: 240,
      render: (_, record) => (
        <div style={{ 
          padding: '8px 12px',
          background: '#fafafa',
          borderRadius: '6px',
          border: '1px solid #f0f0f0'
        }}>
          <div style={{ fontWeight: 500, fontSize: '14px', marginBottom: 4 }}>{record.tripNumber}</div>
          <div style={{ fontSize: '12px', color: '#262626' }}>
            {record.departureStation} → {record.arrivalStation}
          </div>
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: 2 }}>
            {record.departureTime}
          </div>
        </div>
      ),
    },
    {
      title: '金额',
      key: 'amount',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <div style={{
          padding: '6px 12px',
          background: '#fff1f0',
          border: '1px solid #ffa39e',
          borderRadius: '6px'
        }}>
          <div style={{ fontSize: '11px', color: '#cf1322', marginBottom: 2 }}>
            {record.type === 'refund' ? '退款' : '手续费'}
          </div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#cf1322' }}>
            ¥{record.type === 'refund' ? record.refundAmount : record.changeFee}
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'statusText',
      key: 'statusText',
      width: 80,
      align: 'center',
      render: (text, record) => {
        const colorMap = {
          pending: 'orange',
          approved: 'green',
          rejected: 'red',
        }
        return <Tag color={colorMap[record.status]}>{text}</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            onClick={() => showDetail(record)}
          >
            详情
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => showProcess(record, 'approve')}
              >
                通过
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => showProcess(record, 'reject')}
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ]

  const tabItems = [
    { key: 'all', label: '全部' },
    { key: 'refund', label: '退票申请' },
    { key: 'change', label: '改签申请' },
  ]

  return (
    <div>
      <Card 
        title="改签退票管理" 
        bordered={false}
      >
        <Tabs
          items={tabItems}
          onChange={handleTabChange}
          style={{ marginBottom: 16 }}
        />
        
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          rowKey="id"
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>

      {/* 详情模态框 */}
      <Modal
        title={
          <Space>
            <Tag color={selectedRecord?.type === 'refund' ? 'volcano' : 'blue'}>
              {selectedRecord?.typeText}
            </Tag>
            <span>申请详情</span>
          </Space>
        }
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={550}
      >
        {selectedRecord && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '8px 24px',
            fontSize: '14px'
          }}>
            <div><span style={{ color: '#999' }}>订单号</span><br/><strong>{selectedRecord.orderNumber}</strong></div>
            <div><span style={{ color: '#999' }}>乘客</span><br/><strong>{selectedRecord.passengerName}</strong></div>
            <div><span style={{ color: '#999' }}>车次</span><br/><strong>{selectedRecord.tripNumber}</strong></div>
            <div><span style={{ color: '#999' }}>座位</span><br/><strong>{selectedRecord.seatType} {selectedRecord.seatNumber}</strong></div>
            <div><span style={{ color: '#999' }}>出发站</span><br/><strong>{selectedRecord.departureStation}</strong></div>
            <div><span style={{ color: '#999' }}>到达站</span><br/><strong>{selectedRecord.arrivalStation}</strong></div>
            <div style={{ gridColumn: '1 / -1' }}><span style={{ color: '#999' }}>出发时间</span><br/><strong>{selectedRecord.departureTime}</strong></div>
            
            {selectedRecord.type === 'refund' && (
              <>
                <div><span style={{ color: '#999' }}>原价</span><br/><strong>¥{selectedRecord.originalPrice}</strong></div>
                <div><span style={{ color: '#999' }}>退款金额</span><br/><strong style={{ color: '#ff4d4f' }}>¥{selectedRecord.refundAmount}</strong></div>
              </>
            )}
            
            {selectedRecord.type === 'change' && (
              <>
                <div><span style={{ color: '#999' }}>改签车次</span><br/><strong>{selectedRecord.newTripNumber}</strong></div>
                <div><span style={{ color: '#999' }}>新出发时间</span><br/><strong>{selectedRecord.newDepartureTime}</strong></div>
                <div><span style={{ color: '#999' }}>原价</span><br/><strong>¥{selectedRecord.originalPrice}</strong></div>
                <div><span style={{ color: '#999' }}>改签费用</span><br/><strong style={{ color: '#ff4d4f' }}>¥{selectedRecord.changeFee}</strong></div>
              </>
            )}
            
            <div style={{ gridColumn: '1 / -1', marginTop: '8px', padding: '12px', background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: '6px' }}>
              <span style={{ color: '#8c8c8c', fontSize: '13px' }}>申请原因</span><br/>
              <span style={{ color: '#262626' }}>{selectedRecord.reason}</span>
            </div>
            
            <div><span style={{ color: '#999' }}>状态</span><br/>
              <Tag color={
                selectedRecord.status === 'pending' ? 'orange' :
                selectedRecord.status === 'approved' ? 'green' : 'red'
              }>
                {selectedRecord.statusText}
              </Tag>
            </div>
            <div><span style={{ color: '#999' }}>申请时间</span><br/><strong>{selectedRecord.createTime}</strong></div>
            
            {selectedRecord.status === 'rejected' && (
              <div style={{ gridColumn: '1 / -1', marginTop: '8px', padding: '12px', background: '#fff1f0', border: '1px solid #ffccc7', borderRadius: '6px' }}>
                <span style={{ color: '#8c8c8c', fontSize: '13px' }}>拒绝原因</span><br/>
                <span style={{ color: '#262626' }}>{selectedRecord.rejectReason}</span>
              </div>
            )}
            
            {selectedRecord.processTime && (
              <div style={{ gridColumn: '1 / -1' }}><span style={{ color: '#999' }}>处理时间</span><br/><strong>{selectedRecord.processTime}</strong></div>
            )}
          </div>
        )}
      </Modal>

      {/* 审核模态框 */}
      <Modal
        title={processAction === 'approve' ? '审核通过' : '拒绝申请'}
        open={processVisible}
        onOk={handleProcess}
        onCancel={() => setProcessVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        {processAction === 'approve' ? (
          <p>确定通过该{selectedRecord?.typeText}申请吗？</p>
        ) : (
          <div>
            <p>确定拒绝该{selectedRecord?.typeText}申请吗？</p>
            <TextArea
              rows={4}
              placeholder="请输入拒绝原因"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

export default RefundChangeManagement
