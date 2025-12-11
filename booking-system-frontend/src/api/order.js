// 订单相关API
import request from '../utils/request'

/**
 * 创建订单
 */
export const createOrder = (data) => {
  return request({
    url: '/order/create',
    method: 'post',
    data,
  })
}

/**
 * 获取订单列表
 */
export const getOrderList = (params) => {
  return request({
    url: '/order/list',
    method: 'get',
    params,
  })
}

/**
 * 获取订单详情
 */
export const getOrderDetail = (orderId) => {
  return request({
    url: `/order/${orderId}`,
    method: 'get',
  })
}

/**
 * 取消订单
 */
export const cancelOrder = (orderId) => {
  return request({
    url: `/order/${orderId}/cancel`,
    method: 'post',
  })
}

/**
 * 支付订单
 */
export const payOrder = (orderId, paymentMethod) => {
  return request({
    url: `/order/${orderId}/pay`,
    method: 'post',
    data: { paymentMethod },
  })
}

/**
 * 退票
 */
export const refundOrder = (orderId, data) => {
  return request({
    url: `/order/${orderId}/refund`,
    method: 'post',
    data,
  })
}

/**
 * 改签
 */
export const changeOrder = (orderId, data) => {
  return request({
    url: `/order/${orderId}/change`,
    method: 'post',
    data,
  })
}
