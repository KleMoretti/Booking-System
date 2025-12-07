// Axios封装
import axios from 'axios'
import { message } from 'antd'
import { getToken, removeToken } from './auth'
import { HTTP_STATUS } from './constants'

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 如果启用Mock模式，设置Mock拦截器
if (import.meta.env.VITE_USE_MOCK === 'true') {
  import('../mock').then(({ setupMock }) => {
    setupMock(request)
    console.log('🎭 Mock模式已启用，使用模拟数据')
  })
}

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加token到请求头
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('请求错误：', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const { data, status } = response
    
    // 处理成功响应
    if (status === HTTP_STATUS.OK) {
      return data
    }
    
    // 其他状态码
    message.error(data.message || '请求失败')
    return Promise.reject(new Error(data.message || '请求失败'))
  },
  (error) => {
    // 处理错误响应
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case HTTP_STATUS.UNAUTHORIZED:
          message.error('登录已过期，请重新登录')
          removeToken()
          // 使用事件通知，避免直接操作window.location
          window.dispatchEvent(new CustomEvent('auth:expired'))
          setTimeout(() => {
            window.location.href = '/login'
          }, 1000)
          break
        case HTTP_STATUS.FORBIDDEN:
          message.error('拒绝访问，权限不足')
          break
        case HTTP_STATUS.NOT_FOUND:
          message.error('请求的资源不存在')
          break
        case HTTP_STATUS.INTERNAL_SERVER_ERROR:
          message.error('服务器错误，请稍后重试')
          break
        default:
          message.error(data?.message || '请求失败')
      }
    } else if (error.request) {
      message.error('网络错误，请检查网络连接')
    } else {
      message.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

export default request
