// 常量定义
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// 订单状态
export const ORDER_STATUS = {
  PENDING: 0,
  PAID: 1,
  CANCELLED: 2,
  REFUNDED: 3,
  COMPLETED: 4
}

// 用户类型
export const USER_TYPE = {
  NORMAL: 0,
  ADMIN: 1
}

