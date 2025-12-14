// 常量定义
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// HTTP状态码
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
}

// API响应码
export const API_CODE = {
  SUCCESS: 200,
  ERROR: 500,
}

// 订单状态
export const ORDER_STATUS = {
  PENDING: 0,      // 待支付：订单已创建，等待支付
  PAID: 1,         // 已支付：订单已支付，等待乘车
  CANCELLED: 2,    // 已取消：订单已取消（支付取消）
  REFUNDED: 4,     // 已退票：订单已退票退款
  CHANGED: 5,      // 已改签：订单已改签
  TIMEOUT: 5,      // 已超时：订单超时未支付自动取消（实际与已改签共用状态码，需通过业务逻辑区分）
}

// 用户类型
export const USER_TYPE = {
  NORMAL: 0,       // 普通用户
  ADMIN: 1,        // 管理员
}

// 分页配置
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
}

// 列车类型
export const TRAIN_TYPE = {
  HIGH_SPEED: '高铁',
  BULLET: '动车',
  NORMAL: '普速',
}

// 支付方式
export const PAYMENT_METHOD = {
  BALANCE: 'BALANCE',    // 余额支付
  ALIPAY: 'ALIPAY',      // 支付宝
  WECHAT: 'WECHAT',      // 微信支付
}

// 订单支付超时时间（毫秒）
export const ORDER_TIMEOUT = 15 * 60 * 1000 // 15分钟

// 本地存储键名
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  SEARCH_PARAMS: 'searchParams',
}

