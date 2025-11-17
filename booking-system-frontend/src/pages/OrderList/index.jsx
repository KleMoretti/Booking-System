// 订单列表页面
import { Card, Table, Tag, Typography } from 'antd'
import './style.css'

const { Title, Paragraph } = Typography

const columns = [
  {
    title: '订单号',
    dataIndex: 'orderNo',
  },
  {
    title: '车次',
    dataIndex: 'tripNo',
  },
  {
    title: '出发站-到达站',
    dataIndex: 'stations',
  },
  {
    title: '出发时间',
    dataIndex: 'departureTime',
  },
  {
    title: '订单状态',
    dataIndex: 'status',
    render: (status) => {
      const colorMap = {
        已支付: 'green',
        未支付: 'orange',
        已取消: 'red',
      }
      return <Tag color={colorMap[status] || 'default'}>{status}</Tag>
    },
  },
]

// 暂时使用静态数据，后续接入后端订单接口
const dataSource = []

function OrderList() {
  return (
    <div className="page-order-list page-container">
      <Card className="page-card" bordered={false}>
        <Title level={3} className="page-title">
          我的订单
        </Title>
        <Paragraph className="page-subtitle">
          查看历史订单和当前订单状态，支持后续扩展退票、改签等操作。
        </Paragraph>
        <Table
          rowKey="orderNo"
          columns={columns}
          dataSource={dataSource}
          locale={{
            emptyText: '暂无订单，后续接入后端后展示真实数据',
          }}
        />
      </Card>
    </div>
  )
}

export default OrderList
