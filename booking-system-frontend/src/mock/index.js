// Mock API拦截器
import MockAdapter from 'axios-mock-adapter'
import {
  mockStations,
  mockTrips,
  mockOrders,
  mockUser,
  mockAdmin,
  mockAdminStats,
  mockRefundChangeRequests,
} from './data'

// 模拟延迟
const delay = 300

// 初始化Mock适配器
export function setupMock(axiosInstance) {
  const mock = new MockAdapter(axiosInstance, { delayResponse: delay })

  // 用户相关API
  // 登录
  mock.onPost('/user/login').reply((config) => {
    const { username, password } = JSON.parse(config.data)
    console.log('Mock: 用户登录', username)
    
    if (username && password) {
      // 根据用户名返回不同用户数据
      const user = username === 'admin' ? mockAdmin : mockUser
      
      return [200, {
        code: 200,
        message: '登录成功',
        data: {
          token: 'mock-token-' + Date.now(),
          user: user,
        }
      }]
    }
    return [400, { code: 400, message: '用户名或密码错误' }]
  })

  // 注册
  mock.onPost('/user/register').reply((config) => {
    const data = JSON.parse(config.data)
    console.log('Mock: 用户注册', data.username)
    
    return [200, {
      code: 200,
      message: '注册成功',
      data: {
        id: Math.floor(Math.random() * 10000),
        username: data.username,
      }
    }]
  })

  // 获取用户信息
  mock.onGet('/user/profile').reply(() => {
    console.log('Mock: 获取用户信息')
    return [200, {
      code: 200,
      data: mockUser,
    }]
  })

  // 更新用户信息
  mock.onPut('/user/profile').reply((config) => {
    const data = JSON.parse(config.data)
    console.log('Mock: 更新用户信息', data)
    
    // 更新 mockUser 数据
    Object.assign(mockUser, data)
    
    return [200, {
      code: 200,
      message: '更新成功',
      data: mockUser,
    }]
  })

  // 修改密码
  mock.onPut('/user/password').reply(() => {
    console.log('Mock: 修改密码')
    return [200, {
      code: 200,
      message: '密码修改成功',
    }]
  })

  // 登出
  mock.onPost('/user/logout').reply(() => {
    console.log('Mock: 用户登出')
    return [200, {
      code: 200,
      message: '登出成功',
    }]
  })

  // 车站相关API
  // 获取车站列表
  mock.onGet('/station/list').reply(() => {
    console.log('Mock: 获取车站列表')
    return [200, {
      code: 200,
      data: mockStations,
    }]
  })

  // 车次相关API
  // 搜索车次
  mock.onGet('/trip/search').reply((config) => {
    const params = config.params || {}
    console.log('Mock: 搜索车次', params)
    
    // 根据参数过滤车次
    let filteredTrips = [...mockTrips]
    
    // 转换 fromStationId 到 departureStation 名称
    if (params.fromStationId) {
      const fromStation = mockStations.find(s => s.id === parseInt(params.fromStationId))
      if (fromStation) {
        filteredTrips = filteredTrips.filter(
          trip => trip.departureStation === fromStation.name
        )
      }
    }
    
    // 转换 toStationId 到 arrivalStation 名称
    if (params.toStationId) {
      const toStation = mockStations.find(s => s.id === parseInt(params.toStationId))
      if (toStation) {
        filteredTrips = filteredTrips.filter(
          trip => trip.arrivalStation === toStation.name
        )
      }
    }
    
    // 按日期过滤
    if (params.departureDate) {
      filteredTrips = filteredTrips.filter(
        trip => trip.date === params.departureDate
      )
    }
    
    // 将数据格式转换为前端所需的格式
    const formattedTrips = filteredTrips.map(trip => ({
      ...trip,
      tripNo: trip.tripNumber,
      fromStation: trip.departureStation,
      toStation: trip.arrivalStation,
      // 保留原始的时间字符串
      departureTime: trip.departureTime,
      arrivalTime: trip.arrivalTime,
    }))
    
    return [200, {
      code: 200,
      data: formattedTrips,
    }]
  })

  // 获取车次列表
  mock.onGet('/trip/list').reply((config) => {
    const params = config.params || {}
    console.log('Mock: 获取车次列表', params)
    
    const page = parseInt(params.page) || 1
    const pageSize = parseInt(params.pageSize) || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize
    
    return [200, {
      code: 200,
      data: {
        list: mockTrips.slice(start, end),
        total: mockTrips.length,
        page,
        pageSize,
      }
    }]
  })

  // 获取车次详情
  mock.onGet(/\/trip\/\d+/).reply((config) => {
    const tripId = parseInt(config.url.split('/').pop())
    console.log('Mock: 获取车次详情', tripId)
    
    const trip = mockTrips.find(t => t.id === tripId)
    
    if (trip) {
      return [200, {
        code: 200,
        data: trip,
      }]
    }
    return [404, { code: 404, message: '车次不存在' }]
  })

  // 获取可用座位
  mock.onGet(/\/trip\/\d+\/seats/).reply((config) => {
    const tripId = parseInt(config.url.split('/')[2])
    console.log('Mock: 获取可用座位', tripId)
    
    const trip = mockTrips.find(t => t.id === tripId)
    
    if (trip) {
      // 生成座位列表
      const seats = []
      const available = trip.seats.available || 0
      
      for (let i = 1; i <= available; i++) {
        seats.push({
          id: i,
          carriage: Math.ceil(i / 20),
          seatNumber: `${String(i).padStart(2, '0')}${String.fromCharCode(65 + (i % 5))}`,
          available: true,
        })
      }
      
      return [200, {
        code: 200,
        data: seats,
      }]
    }
    return [404, { code: 404, message: '车次不存在' }]
  })

  // 查询票价
  mock.onGet('/ticket/price').reply((config) => {
    const params = config.params || {}
    console.log('Mock: 查询票价', params)
    
    return [200, {
      code: 200,
      data: {
        price: 553,
      }
    }]
  })

  // 订单相关API
  // 创建订单
  mock.onPost('/order/create').reply((config) => {
    const data = JSON.parse(config.data)
    console.log('Mock: 创建订单', data)
    
    // 生成随机座位号
    const generateSeatNumber = () => {
      const carNumber = String(Math.floor(Math.random() * 8) + 1).padStart(2, '0') // 01-08车
      const rowNumber = String(Math.floor(Math.random() * 20) + 1).padStart(2, '0') // 01-20排
      const seatLetter = ['A', 'B', 'C', 'D', 'F'][Math.floor(Math.random() * 5)] // A-F座位
      return `${carNumber}车${rowNumber}${seatLetter}`
    }
    
    // 查找车次信息
    const trip = mockTrips.find(t => t.id === data.tripId)
    const basePrice = trip ? trip.seats.price : 553
    
    // 生成车票列表
    const tickets = data.passengers.map((passenger, index) => ({
      ticketId: Math.floor(Math.random() * 100000) + index,
      passengerName: passenger.name,
      passengerIdCard: passenger.idCard,
      seatNumber: generateSeatNumber(),
      price: basePrice,
      ticketStatus: 0, // 未使用
      ticketStatusText: '未使用',
    }))
    
    const orderId = Math.floor(Math.random() * 10000)
    const totalAmount = basePrice * tickets.length
    
    const newOrder = {
      orderId: orderId,
      id: orderId,
      orderNumber: 'ORD' + Date.now(),
      tripId: data.tripId,
      tripNumber: trip ? trip.tripNo : 'G1',
      departureStation: trip ? trip.fromStation : '北京南',
      arrivalStation: trip ? trip.toStation : '上海虹桥',
      departureTime: trip ? trip.departureTime : '2025-12-15 08:00:00',
      arrivalTime: trip ? trip.arrivalTime : '2025-12-15 13:30:00',
      totalAmount: totalAmount,
      paidAmount: 0,
      orderStatus: 0, // 待支付
      orderStatusText: '待支付',
      createTime: new Date().toISOString(),
      tickets: tickets,
    }
    
    // 添加到mockOrders用于后续查询
    mockOrders.unshift(newOrder)
    
    return [200, {
      code: 200,
      message: '订单创建成功',
      data: newOrder,
    }]
  })

  // 获取订单列表
  mock.onGet('/order/list').reply((config) => {
    const params = config.params || {}
    console.log('Mock: 获取订单列表', params)
    
    const page = parseInt(params.page) || 1
    const pageSize = parseInt(params.pageSize) || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize
    
    return [200, {
      code: 200,
      data: {
        list: mockOrders.slice(start, end),
        total: mockOrders.length,
        page,
        pageSize,
      }
    }]
  })

  // 获取订单详情
  mock.onGet(/\/order\/\d+/).reply((config) => {
    const orderId = parseInt(config.url.split('/').pop())
    console.log('Mock: 获取订单详情', orderId)
    
    const order = mockOrders.find(o => o.id === orderId)
    
    if (order) {
      return [200, {
        code: 200,
        data: order,
      }]
    }
    return [404, { code: 404, message: '订单不存在' }]
  })

  // 取消订单
  mock.onPost(/\/order\/\d+\/cancel/).reply((config) => {
    const orderId = parseInt(config.url.split('/')[2])
    console.log('Mock: 取消订单', orderId)
    
    // 更新订单状态
    const order = mockOrders.find(o => (o.orderId ?? o.id) === orderId)
    if (order) {
      order.orderStatus = 2 // 已取消
      order.status = 2
      order.orderStatusText = '已取消'
      order.statusText = '已取消'
    }
    
    return [200, {
      code: 200,
      message: '订单已取消',
    }]
  })

  // 支付订单
  mock.onPost(/\/order\/\d+\/pay/).reply((config) => {
    const orderId = parseInt(config.url.split('/')[2])
    console.log('Mock: 支付订单', orderId)
    
    // 更新订单状态
    const order = mockOrders.find(o => (o.orderId ?? o.id) === orderId)
    if (order) {
      order.orderStatus = 1 // 已支付
      order.status = 1
      order.orderStatusText = '已支付'
      order.statusText = '已支付'
      order.paidAmount = order.totalAmount
      order.payTime = new Date().toISOString()
    }
    
    return [200, {
      code: 200,
      message: '支付成功',
      data: {
        paymentUrl: '/payment/success',
      }
    }]
  })

  // 支付相关API
  // 创建支付
  mock.onPost('/payment/create').reply((config) => {
    const data = JSON.parse(config.data)
    console.log('Mock: 创建支付', data)
    
    return [200, {
      code: 200,
      data: {
        paymentId: 'PAY' + Date.now(),
        paymentUrl: '/payment/qrcode',
      }
    }]
  })

  // 查询支付状态
  mock.onGet(/\/payment\/\w+\/status/).reply(() => {
    console.log('Mock: 查询支付状态')
    
    return [200, {
      code: 200,
      data: {
        status: 'success',
        message: '支付成功',
      }
    }]
  })

  // 管理员相关API
  // 获取统计数据
  mock.onGet('/admin/stats').reply(() => {
    console.log('Mock: 获取统计数据')
    
    return [200, {
      code: 200,
      data: mockAdminStats,
    }]
  })

  // 获取改签退票请求列表
  mock.onGet('/admin/refund-change/list').reply((config) => {
    const params = config.params || {}
    console.log('Mock: 获取改签退票请求列表', params)
    
    let filteredRequests = [...mockRefundChangeRequests]
    
    // 按类型过滤
    if (params.type) {
      filteredRequests = filteredRequests.filter(r => r.type === params.type)
    }
    
    // 按状态过滤
    if (params.status) {
      filteredRequests = filteredRequests.filter(r => r.status === params.status)
    }
    
    const page = parseInt(params.page) || 1
    const pageSize = parseInt(params.pageSize) || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize
    
    return [200, {
      code: 200,
      data: {
        list: filteredRequests.slice(start, end),
        total: filteredRequests.length,
        page,
        pageSize,
      }
    }]
  })

  // 审核改签退票请求
  mock.onPost(/\/admin\/refund-change\/\d+\/process/).reply((config) => {
    const requestId = parseInt(config.url.split('/')[3])
    const { action, rejectReason } = JSON.parse(config.data)
    console.log('Mock: 审核改签退票请求', requestId, action)
    
    return [200, {
      code: 200,
      message: action === 'approve' ? '审核通过' : '已拒绝',
    }]
  })

  // 获取车次管理列表
  mock.onGet('/admin/trips').reply((config) => {
    const params = config.params || {}
    console.log('Mock: 获取车次管理列表', params)
    
    const page = parseInt(params.page) || 1
    const pageSize = parseInt(params.pageSize) || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize
    
    return [200, {
      code: 200,
      data: {
        list: mockTrips.slice(start, end),
        total: mockTrips.length,
        page,
        pageSize,
      }
    }]
  })

  // 添加车次
  mock.onPost('/admin/trips').reply((config) => {
    const data = JSON.parse(config.data)
    console.log('Mock: 添加车次', data)
    
    const newTrip = {
      id: mockTrips.length + 1,
      ...data,
    }
    
    mockTrips.push(newTrip)
    
    return [200, {
      code: 200,
      message: '车次添加成功',
      data: newTrip,
    }]
  })

  // 更新车次
  mock.onPut(/\/admin\/trips\/\d+/).reply((config) => {
    const tripId = parseInt(config.url.split('/')[3])
    const data = JSON.parse(config.data)
    console.log('Mock: 更新车次', tripId, data)
    
    return [200, {
      code: 200,
      message: '车次更新成功',
    }]
  })

  // 删除车次
  mock.onDelete(/\/admin\/trips\/\d+/).reply((config) => {
    const tripId = parseInt(config.url.split('/')[3])
    console.log('Mock: 删除车次', tripId)
    
    return [200, {
      code: 200,
      message: '车次删除成功',
    }]
  })

  // 更新票价
  mock.onPut(/\/admin\/trips\/\d+\/price/).reply((config) => {
    const tripId = parseInt(config.url.split('/')[3])
    const data = JSON.parse(config.data)
    console.log('Mock: 更新票价', tripId, data)
    
    return [200, {
      code: 200,
      message: '票价更新成功',
    }]
  })

  console.log('✅ Mock API已启用')
  
  return mock
}
