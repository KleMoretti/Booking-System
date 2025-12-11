// 余额管理组件
import { Card, Button, InputNumber, Table, Tag, message, Space, Modal, Statistic } from 'antd'
import { WalletOutlined, PlusOutlined, HistoryOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { rechargeBalance, getBalanceHistory } from '../../../api/user'
import { getUserProfile } from '../../../store/slices/userSlice'
import { API_CODE } from '../../../utils/constants'
import { formatDateTime } from '../../../utils/format'

function BalanceManagement({ userInfo }) {
  const [rechargeModalVisible, setRechargeModalVisible] = useState(false)
  const [rechargeAmount, setRechargeAmount] = useState(100)
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [balanceHistory, setBalanceHistory] = useState([])
  const dispatch = useDispatch()

  // 预设充值金额
  const presetAmounts = [50, 100, 200, 500, 1000, 2000]

  useEffect(() => {
    loadBalanceHistory()
  }, [])

  const loadBalanceHistory = async () => {
    setHistoryLoading(true)
    try {
      const response = await getBalanceHistory()
      if (response.code === API_CODE.SUCCESS) {
        setBalanceHistory(response.data || [])
      }
    } catch (error) {
      console.error('加载余额历史失败：', error)
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleRecharge = async () => {
    if (!rechargeAmount || rechargeAmount <= 0) {
      message.warning('请输入有效的充值金额')
      return
    }

    if (rechargeAmount < 10) {
      message.warning('充值金额不能小于10元')
      return
    }

    if (rechargeAmount > 10000) {
      message.warning('单次充值金额不能超过10000元')
      return
    }

    setLoading(true)
    try {
      const response = await rechargeBalance({ amount: rechargeAmount })
      if (response.code === API_CODE.SUCCESS) {
        message.success(`充值成功！已充值 ¥${rechargeAmount}`)
        setRechargeModalVisible(false)
        setRechargeAmount(100)
        // 刷新用户信息
        dispatch(getUserProfile())
        // 刷新余额历史
        loadBalanceHistory()
      } else {
        message.error(response.message || '充值失败')
      }
    } catch (error) {
      console.error('充值失败：', error)
      message.error('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => formatDateTime(text),
      width: 180,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeMap = {
          RECHARGE: { text: '充值', color: 'green' },
          PAYMENT: { text: '支付', color: 'red' },
          REFUND: { text: '退款', color: 'blue' },
          CHANGE: { text: '改签', color: 'orange' },
        }
        const config = typeMap[type] || { text: type, color: 'default' }
        return <Tag color={config.color}>{config.text}</Tag>
      },
      width: 100,
    },
    {
      title: '金额变动',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <span style={{
          color: amount > 0 ? '#52c41a' : '#f5222d',
          fontWeight: 'bold'
        }}>
          {amount > 0 ? '+' : ''}{amount.toFixed(2)}
        </span>
      ),
      width: 120,
    },
    {
      title: '变动后余额',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance) => `¥${balance.toFixed(2)}`,
      width: 120,
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
  ]

  return (
    <div className="balance-management-container">
      <Card variant="borderless" className="balance-card">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div className="balance-header">
            <Statistic
              title="当前余额"
              value={userInfo?.balance || 0}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#262626', fontSize: '28px', fontWeight: '600' }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setRechargeModalVisible(true)}
            >
              立即充值
            </Button>
          </div>

          <div className="balance-history">
            <div className="section-header">
              <h3>
                <HistoryOutlined /> 余额变动记录
              </h3>
              <Button onClick={loadBalanceHistory} loading={historyLoading}>
                刷新
              </Button>
            </div>
            <Table
              columns={columns}
              dataSource={balanceHistory}
              rowKey="id"
              loading={historyLoading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              scroll={{ x: 800 }}
            />
          </div>
        </Space>
      </Card>

      {/* 充值弹窗 */}
      <Modal
        title={<span><WalletOutlined /> 账户充值</span>}
        open={rechargeModalVisible}
        onCancel={() => setRechargeModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setRechargeModalVisible(false)}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleRecharge}
          >
            确认充值
          </Button>,
        ]}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <div style={{ marginBottom: '12px', fontWeight: 'bold' }}>
              选择充值金额：
            </div>
            <Space wrap>
              {presetAmounts.map((amount) => (
                <Button
                  key={amount}
                  type={rechargeAmount === amount ? 'primary' : 'default'}
                  onClick={() => setRechargeAmount(amount)}
                >
                  ¥{amount}
                </Button>
              ))}
            </Space>
          </div>
          <div>
            <div style={{ marginBottom: '12px', fontWeight: 'bold' }}>
              或输入自定义金额：
            </div>
            <InputNumber
              style={{ width: '100%' }}
              min={10}
              max={10000}
              precision={2}
              value={rechargeAmount}
              onChange={setRechargeAmount}
              prefix="¥"
              placeholder="请输入充值金额（10-10000元）"
            />
          </div>
          <div style={{ color: '#999', fontSize: '12px' }}>
            <p>• 单次充值金额范围：10-10000元</p>
            <p>• 充值后余额即时到账</p>
            <p>• 余额可用于购票支付</p>
          </div>
        </Space>
      </Modal>
    </div>
  )
}

export default BalanceManagement

