// 管理员 - 财务报表页面
import { Card, DatePicker, Button, Space, Table, Statistic, Row, Col, Select, message, Spin } from 'antd'
import { DownloadOutlined, ReloadOutlined, RiseOutlined, FallOutlined } from '@ant-design/icons'
import { useState, useCallback, useEffect } from 'react'
import { getFinancialReport, getSalesStatistics, exportFinancialReport } from '../../../api/admin'
import { formatPrice } from '../../../utils/format'
import { API_CODE } from '../../../utils/constants'
import PageHeader from '../../../components/PageHeader'
import dayjs from 'dayjs'
import './style.css'

const { RangePicker } = DatePicker

function FinancialReport() {
  const [loading, setLoading] = useState(false)
  const [reportType, setReportType] = useState('daily') // daily, weekly, monthly
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(7, 'day'),
    dayjs()
  ])
  const [summaryData, setSummaryData] = useState({
    totalSales: 0,
    totalRefund: 0,
    netIncome: 0,
    orderCount: 0,
    refundCount: 0,
  })
  const [chartData, setChartData] = useState([])
  const [detailLoading, setDetailLoading] = useState(false)

  // 加载财务报表
  const loadFinancialReport = useCallback(async () => {
    if (!dateRange || dateRange.length !== 2) {
      message.warning('请选择日期范围')
      return
    }

    setLoading(true)
    try {
      const response = await getFinancialReport({
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        reportType,
      })

      if (response.code === API_CODE.SUCCESS) {
        setSummaryData(response.data.summary || {})
        setChartData(response.data.details || [])
      } else {
        message.error(response.message || '加载报表失败')
      }
    } catch (error) {
      console.error('加载财务报表失败：', error)
      message.error('网络错误')
    } finally {
      setLoading(false)
    }
  }, [dateRange, reportType])

  useEffect(() => {
    loadFinancialReport()
  }, [])

  // 导出报表
  const handleExport = async () => {
    if (!dateRange || dateRange.length !== 2) {
      message.warning('请选择日期范围')
      return
    }

    setDetailLoading(true)
    try {
      const response = await exportFinancialReport({
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        reportType,
      })

      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `财务报表_${dateRange[0].format('YYYYMMDD')}-${dateRange[1].format('YYYYMMDD')}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      message.success('导出成功')
    } catch (error) {
      console.error('导出报表失败：', error)
      message.error('导出失败')
    } finally {
      setDetailLoading(false)
    }
  }

  // 快速选择日期
  const handleQuickSelect = (days) => {
    setDateRange([
      dayjs().subtract(days, 'day'),
      dayjs()
    ])
  }

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      width: '15%',
      render: (date) => {
        if (reportType === 'daily') {
          return dayjs(date).format('YYYY-MM-DD')
        } else if (reportType === 'weekly') {
          return `第${dayjs(date).week()}周`
        } else {
          return dayjs(date).format('YYYY年MM月')
        }
      },
    },
    {
      title: '销售额',
      dataIndex: 'sales',
      width: '15%',
      align: 'right',
      render: (sales) => (
        <span style={{ color: '#52c41a', fontWeight: 500 }}>
          {formatPrice(sales)}
        </span>
      ),
    },
    {
      title: '退票金额',
      dataIndex: 'refund',
      width: '15%',
      align: 'right',
      render: (refund) => (
        <span style={{ color: '#ff4d4f' }}>
          {formatPrice(refund)}
        </span>
      ),
    },
    {
      title: '净收入',
      dataIndex: 'netIncome',
      width: '15%',
      align: 'right',
      render: (netIncome) => (
        <span style={{ fontWeight: 600, fontSize: 15 }}>
          {formatPrice(netIncome)}
        </span>
      ),
    },
    {
      title: '订单数',
      dataIndex: 'orderCount',
      width: '10%',
      align: 'center',
    },
    {
      title: '退票数',
      dataIndex: 'refundCount',
      width: '10%',
      align: 'center',
    },
    {
      title: '退票率',
      dataIndex: 'refundRate',
      width: '10%',
      align: 'center',
      render: (_, record) => {
        const rate = record.orderCount > 0 ? (record.refundCount / record.orderCount * 100).toFixed(2) : 0
        return `${rate}%`
      },
    },
    {
      title: '环比',
      dataIndex: 'growth',
      width: '10%',
      align: 'center',
      render: (growth) => {
        if (!growth) return '-'
        const isPositive = growth > 0
        return (
          <span style={{ color: isPositive ? '#52c41a' : '#ff4d4f' }}>
            {isPositive ? <RiseOutlined /> : <FallOutlined />}
            {Math.abs(growth).toFixed(2)}%
          </span>
        )
      },
    },
  ]

  return (
    <div className="page-admin-financial-report page-container">
      <PageHeader
        title="财务报表"
        description="查看日/周/月销售额、退票金额、净收入汇总"
      />

      {/* 汇总统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总销售额"
              value={summaryData.totalSales}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总退票金额"
              value={summaryData.totalRefund}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="净收入"
              value={summaryData.netIncome}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#1890ff', fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="订单/退票数"
              value={summaryData.orderCount}
              suffix={`/ ${summaryData.refundCount}`}
            />
          </Card>
        </Col>
      </Row>

      <Card className="page-card" variant="borderless">
        <div className="filter-bar">
          <Space size="middle" wrap>
            <Select
              value={reportType}
              onChange={setReportType}
              style={{ width: 120 }}
              options={[
                { label: '按日汇总', value: 'daily' },
                { label: '按周汇总', value: 'weekly' },
                { label: '按月汇总', value: 'monthly' },
              ]}
            />
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="YYYY-MM-DD"
              inputReadOnly
              allowClear={false}
            />
            <Space>
              <Button size="small" onClick={() => handleQuickSelect(7)}>
                近7天
              </Button>
              <Button size="small" onClick={() => handleQuickSelect(30)}>
                近30天
              </Button>
              <Button size="small" onClick={() => handleQuickSelect(90)}>
                近90天
              </Button>
            </Space>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={loadFinancialReport}
              loading={loading}
            >
              查询
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
              loading={detailLoading}
            >
              导出Excel
            </Button>
          </Space>
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={chartData}
            rowKey="date"
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
            summary={(pageData) => {
              const totalSales = pageData.reduce((sum, record) => sum + (record.sales || 0), 0)
              const totalRefund = pageData.reduce((sum, record) => sum + (record.refund || 0), 0)
              const totalNetIncome = pageData.reduce((sum, record) => sum + (record.netIncome || 0), 0)
              const totalOrders = pageData.reduce((sum, record) => sum + (record.orderCount || 0), 0)
              const totalRefunds = pageData.reduce((sum, record) => sum + (record.refundCount || 0), 0)

              return (
                <Table.Summary.Row style={{ fontWeight: 600, backgroundColor: '#fafafa' }}>
                  <Table.Summary.Cell>合计</Table.Summary.Cell>
                  <Table.Summary.Cell align="right">
                    <span style={{ color: '#52c41a' }}>{formatPrice(totalSales)}</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell align="right">
                    <span style={{ color: '#ff4d4f' }}>{formatPrice(totalRefund)}</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell align="right">
                    <span style={{ fontSize: 15 }}>{formatPrice(totalNetIncome)}</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell align="center">{totalOrders}</Table.Summary.Cell>
                  <Table.Summary.Cell align="center">{totalRefunds}</Table.Summary.Cell>
                  <Table.Summary.Cell align="center">
                    {totalOrders > 0 ? `${(totalRefunds / totalOrders * 100).toFixed(2)}%` : '0%'}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>-</Table.Summary.Cell>
                </Table.Summary.Row>
              )
            }}
          />
        </Spin>
      </Card>
    </div>
  )
}

export default FinancialReport
