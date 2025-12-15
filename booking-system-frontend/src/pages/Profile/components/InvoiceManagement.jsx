// 发票管理组件
import { useState, useEffect } from 'react'
import { Tabs, Table, Button, Space, Modal, Form, Input, Select, message, Tag, Popconfirm } from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  FileTextOutlined,
  DownloadOutlined 
} from '@ant-design/icons'
import { 
  getInvoiceList, 
  applyInvoice,
  issueInvoice,
  deleteInvoice,
  downloadInvoice, 
  getInvoiceTitleList, 
  createInvoiceTitle, 
  updateInvoiceTitle, 
  deleteInvoiceTitle 
} from '../../../api/invoice'
import { API_CODE } from '../../../utils/constants'

const { Option } = Select
const { TextArea } = Input

function InvoiceManagement() {
  const [activeTab, setActiveTab] = useState('invoices')

  const tabItems = [
    {
      key: 'invoices',
      label: '发票记录',
      children: <InvoiceList />,
    },
    {
      key: 'titles',
      label: '发票抬头',
      children: <InvoiceTitleList />,
    },
  ]

  return (
    <div className="invoice-management">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />
    </div>
  )
}

// 发票记录列表
function InvoiceList() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [titleList, setTitleList] = useState([])

  useEffect(() => {
    fetchData()
    fetchTitles()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await getInvoiceList()
      if (response.code === API_CODE.SUCCESS && response.data) {
        setDataSource(response.data)
      }
    } catch (error) {
      message.error('获取发票记录失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchTitles = async () => {
    try {
      const response = await getInvoiceTitleList()
      if (response.code === API_CODE.SUCCESS && response.data) {
        setTitleList(response.data)
      }
    } catch (error) {
      console.error('获取发票抬头失败', error)
    }
  }

  const showApplyModal = () => {
    form.resetFields()
    setModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      const response = await applyInvoice(values)
      if (response.code === API_CODE.SUCCESS) {
        message.success('发票申请成功')
        setModalVisible(false)
        fetchData()
      }
    } catch (error) {
      console.error('申请失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (invoiceId) => {
    try {
      const blob = await downloadInvoice(invoiceId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice_${invoiceId}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      message.success('发票下载成功')
    } catch (error) {
      console.error('下载错误:', error)
      message.error('发票下载失败')
    }
  }

  const handleIssue = async (invoiceId) => {
    try {
      const response = await issueInvoice(invoiceId)
      if (response.code === API_CODE.SUCCESS) {
        message.success('发票开具成功')
        fetchData()
      }
    } catch (error) {
      message.error('开具失败')
    }
  }

  const handleDelete = async (invoiceId) => {
    try {
      const response = await deleteInvoice(invoiceId)
      if (response.code === API_CODE.SUCCESS) {
        message.success('删除成功')
        fetchData()
      }
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleTitleSelect = (titleId) => {
    const selectedTitle = titleList.find(t => t.titleId === titleId)
    if (selectedTitle) {
      form.setFieldsValue({
        invoiceType: selectedTitle.titleType === 1 ? 1 : 0,
        invoiceTitle: selectedTitle.titleName,
        taxNumber: selectedTitle.taxNumber || '',
      })
    }
  }

  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 160,
    },
    {
      title: '发票抬头',
      dataIndex: 'invoiceTitle',
      key: 'invoiceTitle',
      width: 200,
      ellipsis: true,
    },
    {
      title: '发票类型',
      dataIndex: 'invoiceType',
      key: 'invoiceType',
      width: 120,
      render: (type) => {
        const typeMap = { 0: '电子普通发票', 1: '增值税专用发票' }
        return typeMap[type] || '未知'
      },
    },
    {
      title: '金额',
      dataIndex: 'invoiceAmount',
      key: 'invoiceAmount',
      width: 100,
      render: (amount) => `¥${amount?.toFixed(2) || '0.00'}`,
    },
    {
      title: '状态',
      dataIndex: 'invoiceStatus',
      key: 'invoiceStatus',
      width: 100,
      render: (status) => {
        const statusMap = {
          0: { text: '待开具', color: 'orange' },
          1: { text: '已开具', color: 'blue' },
          2: { text: '已发送', color: 'green' },
        }
        const config = statusMap[status] || { text: '未知', color: 'default' }
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '申请时间',
      dataIndex: 'applyTime',
      key: 'applyTime',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {record.invoiceStatus === 0 && (
            <Button
              type="link"
              size="small"
              onClick={() => handleIssue(record.invoiceId)}
            >
              开具
            </Button>
          )}
          {record.invoiceStatus >= 1 && (
            <Button
              type="link"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record.invoiceId)}
            >
              下载
            </Button>
          )}
          <Popconfirm
            title="确定删除此发票记录？"
            onConfirm={() => handleDelete(record.invoiceId)}
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
    <div>
      <div className="invoice-list-header" style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={showApplyModal}>
          申请发票
        </Button>
      </div>

      <Table
        loading={loading}
        dataSource={dataSource}
        columns={columns}
        rowKey="invoiceId"
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total) => `共 ${total} 条`,
        }}
        scroll={{ x: 900 }}
      />

      <Modal
        title="申请发票"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        width={600}
        okText="提交申请"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          {titleList.length > 0 && (
            <Form.Item label="选择发票抬头（可选）">
              <Select
                placeholder="选择常用抬头快速填充"
                onChange={handleTitleSelect}
                allowClear
              >
                {titleList.map(title => (
                  <Option key={title.titleId} value={title.titleId}>
                    {title.titleName} {title.titleType === 1 ? '(企业)' : '(个人)'}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            label="订单号"
            name="orderNumber"
            rules={[{ required: true, message: '请输入订单号' }]}
          >
            <Input placeholder="请输入需要开具发票的订单号" />
          </Form.Item>

          <Form.Item
            label="发票类型"
            name="invoiceType"
            initialValue={0}
            rules={[{ required: true, message: '请选择发票类型' }]}
          >
            <Select>
              <Option value={0}>电子普通发票</Option>
              <Option value={1}>增值税专用发票</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="发票抬头"
            name="invoiceTitle"
            rules={[
              { required: true, message: '请输入发票抬头' },
              { max: 200, message: '发票抬头不能超过200个字符' },
            ]}
          >
            <Input placeholder="个人或企业名称" />
          </Form.Item>

          <Form.Item
            label="纳税人识别号"
            name="taxNumber"
            rules={[
              { max: 50, message: '纳税人识别号不能超过50个字符' },
            ]}
          >
            <Input placeholder="企业发票需填写（可选）" />
          </Form.Item>

          <Form.Item
            label="接收邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入接收邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' },
            ]}
          >
            <Input placeholder="用于接收电子发票" />
          </Form.Item>

          <Form.Item
            label="备注"
            name="note"
          >
            <TextArea rows={3} placeholder="其他说明（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

// 发票抬头管理
function InvoiceTitleList() {
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
      const response = await getInvoiceTitleList()
      if (response.code === API_CODE.SUCCESS && response.data) {
        setDataSource(response.data)
      }
    } catch (error) {
      message.error('获取发票抬头失败')
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
        const response = await updateInvoiceTitle(editingRecord.titleId, values)
        if (response.code === API_CODE.SUCCESS) {
          message.success('更新成功')
          setModalVisible(false)
          fetchData()
        }
      } else {
        const response = await createInvoiceTitle(values)
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

  const handleDelete = async (titleId) => {
    try {
      const response = await deleteInvoiceTitle(titleId)
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
      title: '抬头名称',
      dataIndex: 'titleName',
      key: 'titleName',
      width: 200,
    },
    {
      title: '抬头类型',
      dataIndex: 'titleType',
      key: 'titleType',
      width: 100,
      render: (type) => {
        const typeMap = { 0: '个人', 1: '企业' }
        return typeMap[type] || '未知'
      },
    },
    {
      title: '纳税人识别号',
      dataIndex: 'taxNumber',
      key: 'taxNumber',
      width: 180,
      render: (text) => text || '-',
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
            title="确定删除此抬头？"
            onConfirm={() => handleDelete(record.titleId)}
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
    <div>
      <div className="invoice-title-header" style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          添加抬头
        </Button>
      </div>

      <Table
        loading={loading}
        dataSource={dataSource}
        columns={columns}
        rowKey="titleId"
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total) => `共 ${total} 条`,
        }}
        scroll={{ x: 900 }}
      />

      <Modal
        title={editingRecord ? '编辑发票抬头' : '添加发票抬头'}
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
            label="抬头类型"
            name="titleType"
            initialValue={0}
            rules={[{ required: true, message: '请选择抬头类型' }]}
          >
            <Select>
              <Option value={0}>个人</Option>
              <Option value={1}>企业</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="抬头名称"
            name="titleName"
            rules={[
              { required: true, message: '请输入抬头名称' },
              { max: 200, message: '抬头名称不能超过200个字符' },
            ]}
          >
            <Input placeholder="个人姓名或企业名称" />
          </Form.Item>

          <Form.Item
            label="纳税人识别号"
            name="taxNumber"
            rules={[
              { max: 50, message: '纳税人识别号不能超过50个字符' },
            ]}
          >
            <Input placeholder="企业必填，个人可不填" />
          </Form.Item>

          <Form.Item
            label="开户银行"
            name="bankName"
          >
            <Input placeholder="企业发票可填写（可选）" />
          </Form.Item>

          <Form.Item
            label="银行账号"
            name="bankAccount"
          >
            <Input placeholder="企业发票可填写（可选）" />
          </Form.Item>

          <Form.Item
            label="企业地址"
            name="companyAddress"
          >
            <Input placeholder="企业发票可填写（可选）" />
          </Form.Item>

          <Form.Item
            label="企业电话"
            name="companyPhone"
          >
            <Input placeholder="企业发票可填写（可选）" />
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

export default InvoiceManagement
