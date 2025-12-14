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

  // ==================== 用户管理 ====================
  
  // 生成Mock用户列表
  const mockUsers = [
    {
      userId: 1,
      username: 'testuser',
      realName: '张三',
      phone: '13800138000',
      idCard: '110101199001011234',
      email: 'zhangsan@example.com',
      status: 0,
      balance: 1000.00,
      createTime: '2025-01-01 10:00:00',
      lastLoginTime: '2025-12-14 08:00:00',
      orderCount: 15,
    },
    {
      userId: 2,
      username: 'user02',
      realName: '李四',
      phone: '13900139000',
      idCard: '110101199002021234',
      email: 'lisi@example.com',
      status: 0,
      balance: 500.50,
      createTime: '2025-02-15 14:30:00',
      lastLoginTime: '2025-12-13 15:20:00',
      orderCount: 8,
    },
    {
      userId: 3,
      username: 'frozen_user',
      realName: '王五',
      phone: '13700137000',
      idCard: '110101199003031234',
      email: 'wangwu@example.com',
      status: 1, // 已冻结
      balance: 200.00,
      createTime: '2025-03-20 09:15:00',
      lastLoginTime: '2025-10-01 10:00:00',
      orderCount: 3,
    },
    {
      userId: 4,
      username: 'user04',
      realName: '赵六',
      phone: '13600136000',
      idCard: '440301199004041234',
      email: null,
      status: 0,
      balance: 2500.00,
      createTime: '2025-05-10 16:45:00',
      lastLoginTime: '2025-12-14 07:30:00',
      orderCount: 32,
    },
  ]

  // 搜索用户
  mock.onGet('/admin/users/search').reply((config) => {
    const { keyword, page = 1, pageSize = 10 } = config.params
    console.log('Mock: 搜索用户', keyword)
    
    let results = mockUsers
    if (keyword) {
      results = mockUsers.filter(user => 
        user.username.includes(keyword) ||
        (user.phone && user.phone.includes(keyword)) ||
        (user.idCard && user.idCard.includes(keyword)) ||
        (user.realName && user.realName.includes(keyword))
      )
    }
    
    const start = (page - 1) * pageSize
    const end = start + pageSize
    
    return [200, {
      code: 200,
      data: {
        list: results.slice(start, end),
        total: results.length,
        page,
        pageSize,
      }
    }]
  })

  // 获取用户详情
  mock.onGet(/\/admin\/users\/\d+/).reply((config) => {
    const userId = parseInt(config.url.split('/')[3])
    console.log('Mock: 获取用户详情', userId)
    
    const user = mockUsers.find(u => u.userId === userId)
    if (user) {
      return [200, {
        code: 200,
        data: user,
      }]
    }
    return [404, { code: 404, message: '用户不存在' }]
  })

  // 重置密码
  mock.onPost(/\/admin\/users\/\d+\/reset-password/).reply((config) => {
    const userId = parseInt(config.url.split('/')[3])
    const data = JSON.parse(config.data)
    console.log('Mock: 重置密码', userId, data)
    
    return [200, {
      code: 200,
      message: '密码重置成功',
    }]
  })

  // 冻结用户
  mock.onPost(/\/admin\/users\/\d+\/freeze/).reply((config) => {
    const userId = parseInt(config.url.split('/')[3])
    console.log('Mock: 冻结用户', userId)
    
    const user = mockUsers.find(u => u.userId === userId)
    if (user) {
      user.status = 1
    }
    
    return [200, {
      code: 200,
      message: '账号已冻结',
    }]
  })

  // 解冻用户
  mock.onPost(/\/admin\/users\/\d+\/unfreeze/).reply((config) => {
    const userId = parseInt(config.url.split('/')[3])
    console.log('Mock: 解冻用户', userId)
    
    const user = mockUsers.find(u => u.userId === userId)
    if (user) {
      user.status = 0
    }
    
    return [200, {
      code: 200,
      message: '账号已解冻',
    }]
  })

  // ==================== 批量车次管理 ====================

  // 获取管理员车次列表
  mock.onGet('/admin/trips').reply((config) => {
    const { page = 1, pageSize = 10 } = config.params
    console.log('Mock: 获取管理员车次列表', page, pageSize)
    
    // 转换mockTrips数据为管理员视图格式
    const adminTrips = mockTrips.map(trip => ({
      id: trip.id,
      tripNo: trip.tripNumber,
      fromStation: trip.departureStation,
      toStation: trip.arrivalStation,
      departureTime: `${trip.date} ${trip.departureTime}:00`,
      arrivalTime: `${trip.date} ${trip.arrivalTime}:00`,
      price: trip.seats.price,
      availableSeats: trip.seats.available,
      totalSeats: trip.seats.total,
      status: trip.status !== undefined ? trip.status : 1, // 默认运营中
      createTime: '2025-11-01 10:00:00',
    }))
    
    const start = (page - 1) * pageSize
    const end = start + pageSize
    
    return [200, {
      code: 200,
      data: {
        list: adminTrips.slice(start, end),
        total: adminTrips.length,
        page,
        pageSize,
      }
    }]
  })

  // 批量导入车次
  mock.onPost('/admin/trips/batch-import').reply((config) => {
    console.log('Mock: 批量导入车次')
    
    // 模拟导入成功
    const successCount = Math.floor(Math.random() * 50) + 10
    
    return [200, {
      code: 200,
      message: '导入成功',
      data: {
        successCount,
        failCount: 0,
      }
    }]
  })

  // 批量下线车次
  mock.onPost('/admin/trips/batch-offline').reply((config) => {
    const { tripIds } = JSON.parse(config.data)
    console.log('Mock: 批量下线车次', tripIds)
    
    tripIds.forEach(id => {
      const trip = mockTrips.find(t => t.id === id)
      if (trip) {
        trip.status = 0
      }
    })
    
    return [200, {
      code: 200,
      message: `成功下线 ${tripIds.length} 个车次`,
    }]
  })

  // 批量上线车次
  mock.onPost('/admin/trips/batch-online').reply((config) => {
    const { tripIds } = JSON.parse(config.data)
    console.log('Mock: 批量上线车次', tripIds)
    
    tripIds.forEach(id => {
      const trip = mockTrips.find(t => t.id === id)
      if (trip) {
        trip.status = 1
      }
    })
    
    return [200, {
      code: 200,
      message: `成功上线 ${tripIds.length} 个车次`,
    }]
  })

  // 下载车次导入模板
  mock.onGet('/admin/trips/template').reply(() => {
    console.log('Mock: 下载车次导入模板')
    
    // 返回一个模拟的Excel文件
    return [200, new Blob(['车次模板内容'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })]
  })

  // ==================== 财务报表 ====================

  // 生成Mock财务数据
  const generateFinancialData = (startDate, endDate, reportType) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const data = []
    let totalSales = 0
    let totalRefund = 0
    let totalOrders = 0
    let totalRefunds = 0
    
    let current = new Date(start)
    while (current <= end) {
      const sales = Math.random() * 50000 + 10000
      const refund = Math.random() * 5000 + 1000
      const orderCount = Math.floor(Math.random() * 100) + 20
      const refundCount = Math.floor(Math.random() * 10) + 2
      
      data.push({
        date: current.toISOString().split('T')[0],
        sales: Math.round(sales * 100) / 100,
        refund: Math.round(refund * 100) / 100,
        netIncome: Math.round((sales - refund) * 100) / 100,
        orderCount,
        refundCount,
        growth: Math.random() * 20 - 10, // -10% to +10%
      })
      
      totalSales += sales
      totalRefund += refund
      totalOrders += orderCount
      totalRefunds += refundCount
      
      // 根据报表类型增加日期
      if (reportType === 'daily') {
        current.setDate(current.getDate() + 1)
      } else if (reportType === 'weekly') {
        current.setDate(current.getDate() + 7)
      } else {
        current.setMonth(current.getMonth() + 1)
      }
    }
    
    return {
      summary: {
        totalSales: Math.round(totalSales * 100) / 100,
        totalRefund: Math.round(totalRefund * 100) / 100,
        netIncome: Math.round((totalSales - totalRefund) * 100) / 100,
        orderCount: totalOrders,
        refundCount: totalRefunds,
      },
      details: data,
    }
  }

  // 获取财务报表
  mock.onGet('/admin/financial/report').reply((config) => {
    const { startDate, endDate, reportType } = config.params
    console.log('Mock: 获取财务报表', startDate, endDate, reportType)
    
    const data = generateFinancialData(startDate, endDate, reportType)
    
    return [200, {
      code: 200,
      data,
    }]
  })

  // 获取销售统计
  mock.onGet('/admin/financial/sales').reply((config) => {
    const { startDate, endDate } = config.params
    console.log('Mock: 获取销售统计', startDate, endDate)
    
    return [200, {
      code: 200,
      data: {
        totalSales: 156789.50,
        totalOrders: 1234,
        avgOrderAmount: 127.05,
      }
    }]
  })

  // 导出财务报表
  mock.onGet('/admin/financial/export').reply((config) => {
    const { startDate, endDate, reportType } = config.params
    console.log('Mock: 导出财务报表', startDate, endDate, reportType)
    
    // 返回一个模拟的Excel文件
    return [200, new Blob(['财务报表内容'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })]
  })

  console.log('✅ Mock API已启用')
  
  return mock
}
