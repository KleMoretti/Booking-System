// 认证工具
import { getStorage, setStorage, removeStorage } from './storage'

const TOKEN_KEY = 'auth_token'
const USER_INFO_KEY = 'user_info'

/**
 * 获取token
 */
export const getToken = () => {
  return getStorage(TOKEN_KEY)
}

/**
 * 设置token
 */
export const setToken = (token) => {
  setStorage(TOKEN_KEY, token)
}

/**
 * 移除token
 */
export const removeToken = () => {
  removeStorage(TOKEN_KEY)
}

/**
 * 获取用户信息
 */
export const getUserInfo = () => {
  const userInfo = getStorage(USER_INFO_KEY)
  return userInfo ? JSON.parse(userInfo) : null
}

/**
 * 设置用户信息
 */
export const setUserInfo = (userInfo) => {
  setStorage(USER_INFO_KEY, JSON.stringify(userInfo))
}

/**
 * 移除用户信息
 */
export const removeUserInfo = () => {
  removeStorage(USER_INFO_KEY)
}

/**
 * 清除所有认证信息
 */
export const clearAuth = () => {
  removeToken()
  removeUserInfo()
}

/**
 * 检查是否已登录
 */
export const isAuthenticated = () => {
  return !!getToken()
}
