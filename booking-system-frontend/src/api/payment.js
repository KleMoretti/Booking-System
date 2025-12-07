// 支付相关API
import request from '../utils/request'

/**
 * 创建支付
 */
export const createPayment = (data) => {
  return request({
    url: '/payment/create',
    method: 'post',
    data,
  })
}

/**
 * 查询支付状态
 */
export const getPaymentStatus = (paymentId) => {
  return request({
    url: `/payment/${paymentId}/status`,
    method: 'get',
  })
}

/**
 * 获取支付方式列表
 */
export const getPaymentMethods = () => {
  return request({
    url: '/payment/methods',
    method: 'get',
  })
}

/**
 * 支付回调
 */
export const paymentCallback = (data) => {
  return request({
    url: '/payment/callback',
    method: 'post',
    data,
  })
}
