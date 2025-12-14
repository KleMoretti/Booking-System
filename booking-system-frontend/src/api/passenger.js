// 常用联系人相关API
import request from '../utils/request'

/**
 * 获取常用联系人列表
 */
export const getPassengerList = () => {
  return request.get('/api/passengers')
}

/**
 * 创建常用联系人
 */
export const createPassenger = (data) => {
  return request.post('/api/passengers', data)
}

/**
 * 更新常用联系人
 */
export const updatePassenger = (passengerId, data) => {
  return request.put(`/api/passengers/${passengerId}`, data)
}

/**
 * 删除常用联系人
 */
export const deletePassenger = (passengerId) => {
  return request.delete(`/api/passengers/${passengerId}`)
}

/**
 * 获取默认联系人
 */
export const getDefaultPassenger = () => {
  return request.get('/api/passengers/default')
}
