// 票务相关API
import request from '../utils/request'

/**
 * 搜索车次
 */
export const searchTrips = (params) => {
  return request({
    url: '/trip/search',
    method: 'get',
    params,
  })
}

/**
 * 获取车次详情
 */
export const getTripDetail = (tripId) => {
  return request({
    url: `/trip/${tripId}`,
    method: 'get',
  })
}

/**
 * 获取车次列表
 */
export const getTripList = (params) => {
  return request({
    url: '/trip/list',
    method: 'get',
    params,
  })
}

/**
 * 获取可用座位
 */
export const getAvailableSeats = (tripId, seatType) => {
  return request({
    url: `/trip/${tripId}/seats`,
    method: 'get',
    params: { seatType },
  })
}

/**
 * 获取车站列表
 */
export const getStationList = () => {
  return request({
    url: '/station/list',
    method: 'get',
  })
}

/**
 * 查询票价
 */
export const getTicketPrice = (params) => {
  return request({
    url: '/ticket/price',
    method: 'get',
    params,
  })
}
