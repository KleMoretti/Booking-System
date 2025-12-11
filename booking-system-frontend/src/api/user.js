// 用户相关API
import request from '../utils/request'

/**
 * 用户登录
 */
export const login = (data) => {
  return request({
    url: '/user/login',
    method: 'post',
    data,
  })
}

/**
 * 用户注册
 */
export const register = (data) => {
  return request({
    url: '/user/register',
    method: 'post',
    data,
  })
}

/**
 * 获取用户信息
 */
export const getUserProfile = () => {
  return request({
    url: '/user/profile',
    method: 'get',
  })
}

/**
 * 更新用户信息
 */
export const updateUserProfile = (data) => {
  return request({
    url: '/user/profile',
    method: 'put',
    data,
  })
}

/**
 * 修改密码
 */
export const changePassword = (data) => {
  return request({
    url: '/user/password',
    method: 'put',
    data,
  })
}

/**
 * 用户登出
 */
export const logout = () => {
  return request({
    url: '/user/logout',
    method: 'post',
  })
}

/**
 * 充值余额
 */
export const rechargeBalance = (data) => {
  return request({
    url: '/user/balance/recharge',
    method: 'post',
    data,
  })
}

/**
 * 获取余额变动历史
 */
export const getBalanceHistory = (params) => {
  return request({
    url: '/user/balance/history',
    method: 'get',
    params,
  })
}

