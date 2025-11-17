// 票务列表页面
import { Card, Table, Tag, Typography } from 'antd'
import './style.css'

const { Title, Paragraph } = Typography

const columns = [
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
    title: '座位类型',
    dataIndex: 'seatType',
  },
  {
    title: '票价',
    dataIndex: 'price',
  },
  {
    title: '余票',
    dataIndex: 'remain',
    render: (remain) => {
      const color = remain > 20 ? 'green' : remain > 0 ? 'orange' : 'red'
      return <Tag color={color}>{remain}</Tag>
    },
  },
]

// 暂时使用静态数据，后续接入后端车次与票务接口
const dataSource = []

function TicketList() {
  return (
    <div className="page-ticket-list page-container">
      <Card className="page-card" bordered={false}>
        <Title level={3} className="page-title">
          车票列表
        </Title>
        <Paragraph className="page-subtitle">
          展示查询到的车次与余票信息，后续可扩展下单、选座等操作。
        </Paragraph>
        <Table
          rowKey={(record, index) => index}
          columns={columns}
          dataSource={dataSource}
          locale={{
            emptyText: '暂无车次数据，后续接入后端后展示真实数据',
          }}
        />
      </Card>
    </div>
  )
}

export default TicketList
