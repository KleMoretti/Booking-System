// 管理员相关API

// 后台管理API
import request from '../utils/request'

/**
 * 获取统计数据
 */
export const getStatistics = (params) => {
  return request({
    url: '/admin/stats',
    method: 'get',
    params,
  })
}

/**
 * 获取用户列表
 */
export const getUserList = (params) => {
  return request({
    url: '/admin/users',
    method: 'get',
    params,
  })
}

/**
 * 获取订单列表
 */
export const getAdminOrderList = (params) => {
  return request({
    url: '/admin/orders',
    method: 'get',
    params,
  })
}

/**
 * 管理车次
 */
export const manageTrip = (data) => {
  return request({
    url: '/admin/trip',
    method: 'post',
    data,
  })
}

/**
 * 管理车站
 */
export const manageStation = (data) => {
  return request({
    url: '/admin/station',
    method: 'post',
    data,
  })
}

/**
 * 获取系统配置
 */
export const getSystemConfig = () => {
  return request({
    url: '/admin/config',
    method: 'get',
  })
}

/**
 * 更新系统配置
 */
export const updateSystemConfig = (data) => {
  return request({
    url: '/admin/config',
    method: 'put',
    data,
  })
}

/**
 * 获取改签退票请求列表
 */
export const getRefundChangeList = (params) => {
  return request({
    url: '/admin/refund-change/list',
    method: 'get',
    params,
  })
}

/**
 * 审核改签退票请求
 */
export const processRefundChange = (id, data) => {
  return request({
    url: `/admin/refund-change/${id}/process`,
    method: 'post',
    data,
  })
}

/**
 * 获取车次管理列表
 */
export const getAdminTripList = (params) => {
  return request({
    url: '/admin/trips',
    method: 'get',
    params,
  })
}

/**
 * 添加车次
 */
export const createTrip = (data) => {
  return request({
    url: '/admin/trips',
    method: 'post',
    data,
  })
}

/**
 * 更新车次
 */
export const updateTrip = (id, data) => {
  return request({
    url: `/admin/trips/${id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除车次
 */
export const deleteTrip = (id) => {
  return request({
    url: `/admin/trips/${id}`,
    method: 'delete',
  })
}

/**
 * 更新票价
 */
export const updateTripPrice = (id, data) => {
  return request({
    url: `/admin/trips/${id}/price`,
    method: 'put',
    data,
  })
}

// ==================== 用户管理 ====================

/**
 * 搜索用户（按用户名/手机号/证件号）
 */
export const searchUsers = (params) => {
  return request({
    url: '/admin/users/search',
    method: 'get',
    params,
  })
}

/**
 * 重置用户密码
 */
export const resetUserPassword = (userId, data) => {
  return request({
    url: `/admin/users/${userId}/reset-password`,
    method: 'post',
    data,
  })
}

/**
 * 获取用户详情（管理员视角）
 */
export const getUserDetail = (userId) => {
  return request({
    url: `/admin/users/${userId}`,
    method: 'get',
  })
}

// ==================== 批量车次管理 ====================

/**
 * 批量导入车次（Excel/CSV）
 */
export const batchImportTrips = (formData) => {
  return request({
    url: '/admin/trips/batch-import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

/**
 * 批量下线车次
 */
export const batchOfflineTrips = (data) => {
  return request({
    url: '/admin/trips/batch-offline',
    method: 'post',
    data,
  })
}

/**
 * 批量上线车次
 */
export const batchOnlineTrips = (data) => {
  return request({
    url: '/admin/trips/batch-online',
    method: 'post',
    data,
  })
}

/**
 * 下载车次导入模板
 */
export const downloadTripTemplate = () => {
  return request({
    url: '/admin/trips/template',
    method: 'get',
    responseType: 'blob',
  })
}

// ==================== 财务报表 ====================

/**
 * 获取财务汇总报表
 */
export const getFinancialReport = (params) => {
  return request({
    url: '/admin/financial/report',
    method: 'get',
    params,
  })
}

/**
 * 获取销售数据统计
 */
export const getSalesStatistics = (params) => {
  return request({
    url: '/admin/financial/sales',
    method: 'get',
    params,
  })
}

/**
 * 导出财务报表
 */
export const exportFinancialReport = (params) => {
  return request({
    url: '/admin/financial/export',
    method: 'get',
    params,
    responseType: 'blob',
  })
}
