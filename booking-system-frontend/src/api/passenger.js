// 常用联系人相关API
import request from '../utils/request'

/**
 * 获取常用联系人列表
 */
export const getPassengerList = () => {
  return request.get('/passengers')
}

/**
 * 创建常用联系人
 */
export const createPassenger = (data) => {
  return request.post('/passengers', data)
}

/**
 * 更新常用联系人
 */
export const updatePassenger = (passengerId, data) => {
  return request.put(`/passengers/${passengerId}`, data)
}

/**
 * 删除常用联系人
 */
export const deletePassenger = (passengerId) => {
  return request.delete(`/passengers/${passengerId}`)
}

/**
 * 获取默认联系人
 */
export const getDefaultPassenger = () => {
  return request.get('/passengers/default')
}
