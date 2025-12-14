// 格式化工具函数
import dayjs from 'dayjs'

/**
 * 格式化日期
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * 格式化日期时间
 */
export const formatDateTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * 格式化时间
 */
export const formatTime = (date, format = 'HH:mm') => {
  if (!date) return ''
  // 如果已经是时间格式字符串 (HH:mm), 直接返回
  if (typeof date === 'string' && /^\d{2}:\d{2}$/.test(date)) {
    return date
  }
  // 否则尝试用 dayjs 解析
  const parsed = dayjs(date)
  return parsed.isValid() ? parsed.format(format) : date
}

/**
 * 格式化价格
 */
export const formatPrice = (price) => {
  if (price === null || price === undefined) return '¥0.00'
  return `¥${Number(price).toFixed(2)}`
}

/**
 * 格式化手机号
 */
export const formatPhone = (phone) => {
  if (!phone) return ''
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3')
}

/**
 * 格式化身份证号
 */
export const formatIdCard = (idCard) => {
  if (!idCard) return ''
  return idCard.replace(/(\d{6})(\d{8})(\d{4})/, '$1********$3')
}

/**
 * 订单状态映射
 */
export const orderStatusMap = {
  0: { text: '待支付', color: 'orange' },
  1: { text: '已支付', color: 'green' },
  2: { text: '已取消', color: 'red' },
  3: { text: '已退款', color: 'default' },
  4: { text: '已完成', color: 'blue' },
  5: { text: '已超时', color: 'volcano' },
}

/**
 * 获取订单状态
 */
export const getOrderStatus = (status) => {
  return orderStatusMap[status] || { text: '未知', color: 'default' }
}

/**
 * 座位类型 - 根据数据库设计，不区分座位等级
 */
export const getSeatTypeName = () => {
  return '座位'
}
