// Axios封装
import axios from 'axios'
import { message } from 'antd'
import { getToken, removeToken } from './auth'
import { HTTP_STATUS } from './constants'

// 将技术性错误转换为用户友好的提示
const getFriendlyErrorMessage = (errorMsg) => {
  if (!errorMsg) return '操作失败，请重试'
  
  // 过滤数据库相关错误
  if (errorMsg.includes('SQL') || 
      errorMsg.includes('database') || 
      errorMsg.includes('SQLException') ||
      errorMsg.includes('Column') ||
      errorMsg.includes('Table') ||
      errorMsg.includes('Cause:')) {
    return '系统繁忙，请稍后重试'
  }
  
  // 过滤约束冲突错误
  if (errorMsg.includes('Duplicate') || errorMsg.includes('already exists')) {
    if (errorMsg.includes('username')) {
      return '该用户名已被使用'
    }
    if (errorMsg.includes('phone')) {
      return '该手机号已被注册'
    }
    if (errorMsg.includes('id_card') || errorMsg.includes('身份证')) {
      return '该身份证号已被使用'
    }
    return '信息重复，请检查后重试'
  }
  
  // 过滤空指针等Java异常
  if (errorMsg.includes('NullPointerException') || 
      errorMsg.includes('Exception') ||
      errorMsg.includes('Error')) {
    return '系统异常，请稍后重试'
  }
  
  // 其他错误显示原始消息（如果是业务错误）
  return errorMsg
}

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
    
    // 其他状态码 - 过滤技术性错误
    const friendlyMsg = getFriendlyErrorMessage(data.message)
    message.error(friendlyMsg)
    return Promise.reject(new Error(friendlyMsg))
  },
  (error) => {
    // 处理错误响应
    if (error.response) {
      const { status, data, config } = error.response
      
      // 获取当前路径，避免在公开页面显示登录错误
      const currentPath = window.location.pathname
      const isPublicPage = ['/login', '/register', '/home'].includes(currentPath)
      
      switch (status) {
        case HTTP_STATUS.UNAUTHORIZED:
          // 如果是公开页面且是获取用户信息的请求，不显示错误
          if (isPublicPage && config.url?.includes('/user/profile')) {
            removeToken()
            break
          }
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
          // 避免在注册页面显示"用户不存在"的错误
          if (!isPublicPage || !config.url?.includes('/user')) {
            message.error('请求的资源不存在')
          }
          break
        case HTTP_STATUS.INTERNAL_SERVER_ERROR:
          // 检查是否为认证相关错误
          const errorMessage = data?.message || ''
          if (errorMessage.includes('Authorization') || 
              errorMessage.includes('认证') ||
              errorMessage.includes('token') ||
              errorMessage.includes('not present')) {
            message.error('登录已失效，请重新登录')
            removeToken()
            setTimeout(() => {
              window.location.href = '/login'
            }, 1000)
          } else {
            // 其他服务器错误，使用友好提示
            const friendlyMsg = getFriendlyErrorMessage(errorMessage)
            message.error(friendlyMsg)
          }
          break
        default:
          // 过滤技术性错误信息
          const friendlyMsg = getFriendlyErrorMessage(data?.message)
          message.error(friendlyMsg)
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
