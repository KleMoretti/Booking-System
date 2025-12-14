// 统一错误处理工具

/**
 * 将技术性错误转换为用户友好的提示
 * @param {string} errorMsg - 原始错误信息
 * @returns {string} 用户友好的错误提示
 */
export const getFriendlyErrorMessage = (errorMsg) => {
  if (!errorMsg) return '操作失败，请重试'
  
  // 优先处理认证相关错误（不要过滤）
  if (errorMsg.includes('Authorization') || 
      errorMsg.includes('认证') ||
      errorMsg.includes('token') ||
      errorMsg.includes('Token') ||
      errorMsg.includes('登录')) {
    if (errorMsg.includes('not present') || errorMsg.includes('缺失')) {
      return '登录已失效，请重新登录'
    }
    return '登录状态异常，请重新登录'
  }
  
  // 过滤数据库相关错误
  if (errorMsg.includes('SQL') || 
      errorMsg.includes('database') || 
      errorMsg.includes('SQLException') ||
      errorMsg.includes('Column') ||
      errorMsg.includes('Table') ||
      errorMsg.includes('Cause:') ||
      errorMsg.includes('Constraint')) {
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
  
  // 过滤 MyBatis 相关错误
  if (errorMsg.includes('Mapper') || 
      errorMsg.includes('mapper') ||
      errorMsg.includes('The error may exist') ||
      errorMsg.includes('The error occurred')) {
    return '系统繁忙，请稍后重试'
  }
  
  // 其他错误显示原始消息（如果是业务错误）
  return errorMsg
}

/**
 * 安全地显示错误消息（自动过滤技术错误）
 * @param {object} message - antd 的 message 对象
 * @param {string} errorMsg - 错误消息
 */
export const showSafeError = (message, errorMsg) => {
  const friendlyMsg = getFriendlyErrorMessage(errorMsg)
  message.error(friendlyMsg)
}

/**
 * 处理 API 响应错误
 * @param {object} response - API 响应对象
 * @param {object} message - antd 的 message 对象
 * @param {string} defaultMsg - 默认错误消息
 */
export const handleApiError = (response, message, defaultMsg = '操作失败') => {
  if (response && response.code !== 200) {
    const friendlyMsg = getFriendlyErrorMessage(response.message || defaultMsg)
    message.error(friendlyMsg)
    return false
  }
  return true
}

/**
 * 处理异常错误
 * @param {Error} error - 异常对象
 * @param {object} message - antd 的 message 对象
 * @param {string} defaultMsg - 默认错误消息
 */
export const handleException = (error, message, defaultMsg = '操作失败，请重试') => {
  // 记录到控制台供开发调试
  console.error('操作失败:', error)
  
  // 显示用户友好的提示
  const friendlyMsg = getFriendlyErrorMessage(error.message || defaultMsg)
  message.error(friendlyMsg)
}
