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
