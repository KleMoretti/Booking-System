# 后端实现总结

## 已完成部分

### 1. 数据库设计 ✅
- ✅ 补充 `payments` 表
- ✅ 补充 `operation_logs` 表
- ✅ 完整的实体类（Payment, OperationLog）

### 2. 基础设施 ✅
- ✅ Result - 统一响应结果
- ✅ ResultCode - 响应状态码枚举
- ✅ PageResult - 分页结果
- ✅ JwtUtil - JWT工具类
- ✅ PasswordUtil - 密码加密
- ✅ RedisUtil - Redis操作

## 待实现部分（按优先级）

### Priority 1: DTO/VO类
需要完整实现以下数据传输对象：

**DTO（请求对象）:**
1. LoginDTO - 登录请求
2. RegisterDTO - 注册请求
3. OrderDTO - 订单创建请求
4. PaymentDTO - 支付请求
5. TicketQueryDTO - 票务查询请求
6. TripDTO - 班次数据
7. RefundChangeDTO - 退改签请求

**VO（响应对象）:**
1. UserVO - 用户信息返回
2. OrderVO - 订单信息返回
3. TicketVO - 票务信息返回
4. TripVO - 班次信息返回
5. SeatVO - 座位信息返回
6. PaymentVO - 支付信息返回

### Priority 2: Mapper层
需要实现MyBatis Mapper接口和XML：
1. UserMapper + user-mapper.xml
2. TripMapper + trip-mapper.xml
3. SeatMapper + seat-mapper.xml
4. OrderMapper + order-mapper.xml
5. TicketMapper + ticket-mapper.xml
6. PaymentMapper + payment-mapper.xml
7. StationMapper + station-mapper.xml
8. BalanceChangeMapper + balance-change-mapper.xml
9. TicketChangeMapper + ticket-change-mapper.xml

### Priority 3: Service层
核心业务逻辑实现：
1. UserService - 用户管理（登录、注册、个人中心）
2. TripService - 班次管理（查询、搜索）
3. SeatService - 座位管理（锁定、释放）
4. OrderService - 订单管理（创建、支付、取消）
5. TicketService - 票务管理
6. PaymentService - 支付处理
7. BalanceService - 余额管理
8. TicketChangeService - 退改签业务
9. AdminService - 后台管理

### Priority 4: Controller层
RESTful API实现：
1. UserController - 用户相关接口
2. TripController - 班次相关接口
3. OrderController - 订单相关接口
4. PaymentController - 支付相关接口
5. AdminController - 管理员接口
6. StationController - 车站接口

### Priority 5: 配置类
1. SecurityConfig - Spring Security配置
2. RedisConfig - Redis配置
3. WebMvcConfig - Web配置
4. SwaggerConfig - API文档配置
5. CorsConfig - 跨域配置

### Priority 6: 拦截器和过滤器
1. JwtAuthenticationFilter - JWT认证过滤器
2. LogInterceptor - 日志拦截器
3. GlobalExceptionHandler - 全局异常处理

## 前端API接口映射

### 用户模块 (/user)
- POST /user/login - 登录
- POST /user/register - 注册
- GET /user/profile - 获取用户信息
- PUT /user/profile - 更新用户信息
- PUT /user/password - 修改密码
- POST /user/logout - 登出

### 票务模块 (/trip, /ticket, /station)
- GET /trip/search - 搜索班次
- GET /trip/{id} - 班次详情
- GET /trip/list - 班次列表
- GET /trip/{id}/seats - 获取可用座位
- GET /station/list - 车站列表
- GET /ticket/price - 查询票价

### 订单模块 (/order)
- POST /order/create - 创建订单
- GET /order/list - 订单列表
- GET /order/{id} - 订单详情
- POST /order/{id}/cancel - 取消订单
- POST /order/{id}/pay - 支付订单
- POST /order/{id}/refund - 退票

### 支付模块 (/payment)
- POST /payment/create - 创建支付
- GET /payment/{id}/status - 查询支付状态
- GET /payment/methods - 支付方式列表
- POST /payment/callback - 支付回调

### 管理员模块 (/admin)
- GET /admin/stats - 统计数据
- GET /admin/users - 用户列表
- GET /admin/orders - 订单列表
- POST /admin/trip - 管理班次
- POST /admin/station - 管理车站
- GET /admin/config - 系统配置
- PUT /admin/config - 更新配置
- GET /admin/refund-change/list - 退改签列表
- POST /admin/refund-change/{id}/process - 处理退改签
- GET /admin/trips - 班次管理列表
- POST /admin/trips - 添加班次
- PUT /admin/trips/{id} - 更新班次
- DELETE /admin/trips/{id} - 删除班次
- PUT /admin/trips/{id}/price - 更新票价

## 技术栈
- Spring Boot 2.7.16
- MyBatis Plus 3.5.3.2
- Spring Security
- JWT
- Redis
- MySQL 8.0
- Hutool
- Lombok
