// 电子车票详情组件
import { Card, Descriptions, QRCode, Space, Button, Divider, Alert, Tag } from 'antd'
import { 
  EnvironmentOutlined, 
  ClockCircleOutlined, 
  UserOutlined,
  IdcardOutlined,
  BarcodeOutlined,
  DownloadOutlined,
  PrinterOutlined
} from '@ant-design/icons'
import { formatDateTime, formatPrice, formatIdCard } from '../../utils/format'
import './style.css'

function ETicketDetail({ ticket, trip, order }) {
  if (!ticket) return null

  const handleDownload = () => {
    // TODO: 实现下载行程单功能
    console.log('下载行程单')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="e-ticket-detail">
      <Card className="ticket-card" bordered={false}>
        {/* 车票二维码区域 */}
        <div className="ticket-qr-section">
          <div className="qr-code-wrapper">
            <QRCode
              value={ticket.ticketCode || `TICKET-${ticket.ticketId}`}
              size={120}
              bordered={false}
            />
            <div className="qr-code-label">取票二维码</div>
          </div>
          <div className="ticket-code-info">
            <div className="code-item">
              <BarcodeOutlined className="code-icon" />
              <div>
                <div className="code-label">取票号</div>
                <div className="code-value">{ticket.ticketCode || '未生成'}</div>
              </div>
            </div>
            {ticket.checkInGate && (
              <div className="code-item">
                <EnvironmentOutlined className="code-icon" />
                <div>
                  <div className="code-label">检票口</div>
                  <div className="code-value">{ticket.checkInGate}</div>
                </div>
              </div>
            )}
            {ticket.boardingTime && (
              <div className="code-item">
                <ClockCircleOutlined className="code-icon" />
                <div>
                  <div className="code-label">检票开始时间</div>
                  <div className="code-value">{formatDateTime(ticket.boardingTime)}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <Divider />

        {/* 乘车信息 */}
        <Descriptions
          title="乘车信息"
          column={2}
          size="small"
          bordered
          className="ticket-descriptions"
        >
          <Descriptions.Item label="车次" span={2}>
            <Tag color="blue" style={{ fontSize: '16px', padding: '4px 12px' }}>
              {trip?.tripNumber || order?.tripNumber || '-'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="出发站">
            {trip?.departureStation || order?.departureStation || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="到达站">
            {trip?.arrivalStation || order?.arrivalStation || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="出发时间">
            {formatDateTime(trip?.departureTime || order?.departureTime)}
          </Descriptions.Item>
          <Descriptions.Item label="到达时间">
            {formatDateTime(trip?.arrivalTime || order?.arrivalTime)}
          </Descriptions.Item>
          <Descriptions.Item label="座位号">
            <Tag color="green">{ticket.seatNumber || '-'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="票价">
            <span style={{ color: '#ff4d4f', fontWeight: '600', fontSize: '16px' }}>
              {formatPrice(ticket.actualPrice || ticket.price)}
            </span>
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* 乘客信息 */}
        <Descriptions
          title="乘客信息"
          column={2}
          size="small"
          bordered
          className="ticket-descriptions"
        >
          <Descriptions.Item label="姓名" icon={<UserOutlined />}>
            {ticket.passengerName || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="证件号" icon={<IdcardOutlined />}>
            {formatIdCard(ticket.passengerIdCard || ticket.idCardNo)}
          </Descriptions.Item>
        </Descriptions>

        {/* 乘车须知 */}
        {ticket.notes && (
          <>
            <Divider />
            <Alert
              message="乘车须知"
              description={ticket.notes}
              type="info"
              showIcon
              className="ticket-notes"
            />
          </>
        )}

        {/* 操作按钮 */}
        <div className="ticket-actions">
          <Button 
            icon={<PrinterOutlined />}
            onClick={handlePrint}
          >
            打印车票
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default ETicketDetail
