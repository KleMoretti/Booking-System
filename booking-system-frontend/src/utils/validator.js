// 验证工具

/**
 * 验证手机号
 */
export const validatePhone = (rule, value) => {
  if (!value) {
    return Promise.reject(new Error('请输入手机号'))
  }
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(value)) {
    return Promise.reject(new Error('请输入有效的手机号'))
  }
  return Promise.resolve()
}

/**
 * 验证密码强度
 */
export const validatePassword = (rule, value) => {
  if (!value) {
    return Promise.reject(new Error('请输入密码'))
  }
  if (value.length < 6) {
    return Promise.reject(new Error('密码长度至少为6位'))
  }
  return Promise.resolve()
}

/**
 * 验证确认密码
 */
export const validateConfirmPassword = (form) => (rule, value) => {
  if (!value) {
    return Promise.reject(new Error('请再次输入密码'))
  }
  if (value !== form.getFieldValue('password')) {
    return Promise.reject(new Error('两次输入的密码不一致'))
  }
  return Promise.resolve()
}

/**
 * 验证身份证号
 */
export const validateIdCard = (rule, value) => {
  if (!value) {
    return Promise.reject(new Error('请输入身份证号'))
  }
  const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  if (!idCardRegex.test(value)) {
    return Promise.reject(new Error('请输入有效的身份证号'))
  }
  return Promise.resolve()
}

/**
 * 验证邮箱
 */
export const validateEmail = (rule, value) => {
  if (!value) {
    return Promise.resolve()
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(value)) {
    return Promise.reject(new Error('请输入有效的邮箱地址'))
  }
  return Promise.resolve()
}
