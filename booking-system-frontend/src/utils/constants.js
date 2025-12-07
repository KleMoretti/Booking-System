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
  PENDING: 0,      // 未支付
  PAID: 1,         // 已支付
  CANCELLED: 2,    // 已取消
  REFUNDED: 3,     // 已退款
  COMPLETED: 4,    // 已完成
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

// 本地存储键名
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  SEARCH_PARAMS: 'searchParams',
}

