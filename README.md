# 网上订票系统 - 数据库综合实验

## 目录
- [1. 系统概述](#1-系统概述)
- [2. 需求分析](#2-需求分析)
  - [2.1 系统分析](#21-系统分析)
  - [2.2 数据流图](#22-数据流图)
  - [2.3 数据字典](#23-数据字典)
- [3. 功能需求](#3-功能需求)
  - [3.1 结构功能图](#31-结构功能图)
  - [3.2 主要功能说明](#32-主要功能说明)
- [4. 开发与运行环境](#4-开发与运行环境)
- [5. 技术栈](#5-技术栈)
- [6. 数据库设计](#6-数据库设计)
- [7. 系统架构](#7-系统架构)
- [8. 项目实施](#8-项目实施计划)
- [9. 总结](#9-总结)
- [f附录](#附录)

---

## 1. 系统概述

### 1.1 项目背景
随着互联网技术的快速发展，传统的线下订票方式已经无法满足人们日益增长的便捷出行需求。网上订票系统通过互联网平台，为用户提供7×24小时的在线订票服务，大大提高了订票效率，改善了用户体验。

### 1.2 系统目标
本系统旨在构建一个功能完善、性能稳定的网上订票平台，实现以下目标：
- 为用户提供便捷的在线查询、预订、支付服务
- 为管理员提供高效的票务管理、订单管理工具
- 实现票务信息的实时更新与同步
- 保证交易的安全性和数据的完整性
- 支持多种支付方式和退改签业务

### 1.3 应用场景
- 火车票、飞机票、汽车票等交通票务预订
- 电影票、演唱会门票等娱乐票务预订
- 景区门票、展览票等旅游票务预订

---

## 2. 需求分析

### 2.1 系统分析

#### 2.1.1 用户角色分析
系统主要包含以下用户角色：

**1. 普通用户（游客）**
- 浏览票务信息
- 查询车次/航班/场次
- 查看票价和余票信息

**2. 注册用户**
- 拥有普通用户的所有权限
- 在线预订票务
- 管理个人订单
- 在线支付
- 申请退票/改签
- 查看历史订单
- 管理个人信息

**3. 系统管理员**
- 管理票务信息（增删改查）
- 管理用户信息
- 处理订单
- 处理退改签申请
- 统计分析报表
- 系统配置管理

**4. 财务管理员**
- 查看交易记录
- 生成财务报表
- 处理退款业务
- 对账管理

#### 2.1.2 业务流程分析

**用户订票流程：**
1. 用户登录/注册
2. 查询票务信息
3. 选择座位/舱位
4. 填写乘客信息
5. 确认订单
6. 在线支付
7. 生成电子票据
8. 接收订单通知

**管理员管理流程：**
1. 登录管理后台
2. 发布/更新票务信息
3. 监控订单状态
4. 处理用户申请
5. 生成业务报表

#### 2.1.3 非功能性需求

**1. 性能需求**
- 系统响应时间 < 3秒
- 支持并发用户数 ≥ 10000
- 数据库查询响应时间 < 1秒
- 支付处理时间 < 5秒

**2. 安全性需求**
- 用户密码加密存储
- 支付信息加密传输
- 防SQL注入、XSS攻击
- 操作日志记录
- 权限控制与认证

**3. 可靠性需求**
- 系统可用性 ≥ 99.9%
- 数据备份机制
- 事务处理保证一致性
- 异常处理与容错机制

**4. 易用性需求**
- 界面友好、操作简便
- 支持响应式设计（PC/移动端）
- 提供操作提示和帮助文档
- 支持多语言（中英文）

### 2.2 数据流图

#### 2.2.1 顶层数据流图（第0层）

```
                          ┌─────────────────────┐
                          │                     │
        订票请求           │   网上订票系统       │    票务信息
   ┌──────────────────────▶                     ├───────────────┐
   │                      │                     │               │
   │   订单信息            │                     │   管理操作    ▼
   │◄──────────────────────┤                     │◄──────────────┐
   │                      │                     │               │
 ┌─┴─┐                    └─────────────────────┘             ┌─┴──┐
 │用户│                                                        │管理员│
 └───┘                                                        └────┘
   │                      ┌─────────────────────┐               │
   │   支付信息            │                     │   财务报表    │
   └──────────────────────▶   第三方支付平台     ◄───────────────┘
                          │                     │
                          └─────────────────────┘
```

#### 2.2.2 第1层数据流图

```
用户 ──查询请求──▶ [1.查询票务] ──票务信息──▶ 票务数据库
                      │
                      ▼
用户 ──订票请求──▶ [2.预订票务] ──订单数据──▶ 订单数据库
                      │
                      ▼
用户 ──支付信息──▶ [3.支付处理] ──支付记录──▶ 支付数据库
                      │
                      ▼
用户 ◄──订单确认─── [4.订单管理] ◄──订单状态─── 订单数据库
                      │
                      ▼
管理员──管理操作──▶ [5.系统管理] ──更新数据──▶ 各数据表
```

#### 2.2.3 查询票务子系统数据流图（第2层）

```
                    ┌──────────────────────────────┐
                    │      查询票务子系统           │
                    │                              │
用户输入条件 ───────▶│  [1.1]                       │
                    │  接收查询条件                 │
                    │    │                         │
                    │    ▼                         │
                    │  [1.2]                       │
                    │  查询数据库  ◄──────票务表    │
                    │    │                         │
                    │    ▼                         │
                    │  [1.3]                       │
                    │  筛选与排序                   │
                    │    │                         │
                    │    ▼                         │
                    │  [1.4]                       │
用户 ◄───────查询结果┤  返回结果                     │
                    │                              │
                    └──────────────────────────────┘
```

#### 2.2.4 订票处理子系统数据流图

```
                    ┌──────────────────────────────┐
                    │      订票处理子系统           │
                    │                              │
用户订票信息 ───────▶│  [2.1]                       │
                    │  验证票务信息                 │
                    │    │                         │
                    │    ▼                         │
                    │  [2.2]              ┌───────┴────┐
                    │  检查余票  ◄────────│  票务表     │
                    │    │                └───────┬────┘
                    │    ▼                        │
                    │  [2.3]                      │
                    │  锁定座位  ─────────────────┘
                    │    │                         │
                    │    ▼                         │
                    │  [2.4]              ┌───────┴────┐
                    │  创建订单  ─────────▶│  订单表     │
                    │    │                └────────────┘
                    │    ▼                         │
用户 ◄───────订单号──┤  [2.5]                       │
                    │  返回订单信息                 │
                    │                              │
                    └──────────────────────────────┘
```

### 2.3 数据字典

#### 2.3.1 数据项

| 数据项名称 | 数据类型 | 长度 | 说明 | 约束 |
|-----------|---------|------|------|------|
| user_id | INT | - | 用户ID | 主键、自增 |
| username | VARCHAR | 50 | 用户名 | 唯一、非空 |
| password | VARCHAR | 255 | 密码（加密） | 非空 |
| email | VARCHAR | 100 | 邮箱 | 唯一、非空 |
| phone | VARCHAR | 20 | 手机号 | 唯一、非空 |
| real_name | VARCHAR | 50 | 真实姓名 | 非空 |
| id_card | VARCHAR | 18 | 身份证号 | - |
| user_type | TINYINT | - | 用户类型 | 0-普通用户，1-管理员 |
| create_time | DATETIME | - | 创建时间 | 默认当前时间 |
| ticket_id | INT | - | 票务ID | 主键、自增 |
| ticket_type | VARCHAR | 20 | 票务类型 | 火车/飞机/汽车/电影等 |
| departure | VARCHAR | 50 | 出发地 | 非空 |
| destination | VARCHAR | 50 | 目的地 | 非空 |
| departure_time | DATETIME | - | 出发时间 | 非空 |
| arrival_time | DATETIME | - | 到达时间 | - |
| price | DECIMAL | 10,2 | 价格 | 非空、≥0 |
| total_seats | INT | - | 总座位数 | 非空、>0 |
| available_seats | INT | - | 剩余座位数 | ≥0 |
| order_id | INT | - | 订单ID | 主键、自增 |
| order_no | VARCHAR | 32 | 订单号 | 唯一、非空 |
| order_status | TINYINT | - | 订单状态 | 0-待支付，1-已支付，2-已取消，3-已退款 |
| total_amount | DECIMAL | 10,2 | 订单总额 | 非空、≥0 |
| pay_time | DATETIME | - | 支付时间 | - |
| payment_method | VARCHAR | 20 | 支付方式 | 支付宝/微信/银行卡 |

#### 2.3.2 数据结构

**用户数据结构（User）**
```
User = {
    user_id,
    username,
    password,
    email,
    phone,
    real_name,
    id_card,
    user_type,
    create_time,
    update_time
}
```

**票务数据结构（Ticket）**
```
Ticket = {
    ticket_id,
    ticket_type,
    ticket_no,
    departure,
    destination,
    departure_time,
    arrival_time,
    price,
    total_seats,
    available_seats,
    status,
    create_time,
    update_time
}
```

**订单数据结构（Order）**
```
Order = {
    order_id,
    order_no,
    user_id,
    ticket_id,
    passenger_name,
    passenger_id_card,
    seat_no,
    order_status,
    total_amount,
    payment_method,
    pay_time,
    create_time,
    update_time
}
```

**支付数据结构（Payment）**
```
Payment = {
    payment_id,
    order_id,
    payment_no,
    payment_method,
    amount,
    payment_status,
    transaction_id,
    pay_time,
    create_time
}
```

#### 2.3.3 数据流

| 数据流名称 | 说明 | 数据流来源 | 数据流去向 | 数据组成 |
|-----------|------|-----------|-----------|---------|
| 查询请求 | 用户查询票务信息 | 用户 | 查询处理模块 | 出发地+目的地+出发时间 |
| 查询结果 | 返回符合条件的票务列表 | 查询处理模块 | 用户 | Ticket列表 |
| 订票请求 | 用户提交订票信息 | 用户 | 订单处理模块 | user_id+ticket_id+乘客信息 |
| 订单确认 | 返回订单详情 | 订单处理模块 | 用户 | Order信息 |
| 支付信息 | 用户提交支付数据 | 用户 | 支付处理模块 | order_id+payment_method |
| 支付结果 | 返回支付状态 | 支付处理模块 | 用户 | Payment信息 |
| 管理操作 | 管理员执行管理命令 | 管理员 | 系统管理模块 | 操作类型+操作数据 |
| 操作结果 | 返回操作执行结果 | 系统管理模块 | 管理员 | 执行状态+结果信息 |

#### 2.3.4 数据存储

| 数据存储名称 | 说明 | 数据组成 | 数据量估算 | 存取方式 |
|-------------|------|---------|-----------|---------|
| 用户表（users） | 存储用户信息 | User结构 | 10万-100万条 | 按user_id主键查询，按username/email索引查询 |
| 票务表（tickets） | 存储票务信息 | Ticket结构 | 1万-10万条 | 按ticket_id主键查询，按出发地、目的地、时间复合索引查询 |
| 订单表（orders） | 存储订单信息 | Order结构 | 100万-1000万条 | 按order_id主键查询，按user_id索引查询，按order_no唯一索引查询 |
| 支付表（payments） | 存储支付记录 | Payment结构 | 100万-1000万条 | 按payment_id主键查询，按order_id索引查询 |
| 座位表（seats） | 存储座位信息 | Seat结构 | 10万-100万条 | 按seat_id主键查询，按ticket_id索引查询 |

---

## 3. 功能需求

### 3.1 结构功能图

```
                        ┌─────────────────────────┐
                        │   网上订票系统           │
                        └────────┬────────────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │               │               │
         ┌───────▼──────┐ ┌─────▼──────┐ ┌──────▼───────┐
         │ 前台用户模块  │ │ 后台管理模块│ │ 系统支撑模块  │
         └───────┬──────┘ └─────┬──────┘ └──────┬───────┘
                 │               │               │
      ┌──────────┼──────────┐    │      ┌────────┼────────┐
      │          │          │    │      │        │        │
  ┌───▼───┐ ┌───▼───┐ ┌───▼───┐ │  ┌───▼───┐ ┌──▼───┐ ┌──▼───┐
  │用户管理│ │票务查询│ │订单管理│ │  │票务管理│ │用户管理│ │财务管理│
  └───┬───┘ └───┬───┘ └───┬───┘ │  └───┬───┘ └──┬───┘ └──┬───┘
      │         │         │     │      │        │        │
  ┌───┴───┐ ┌───┴───┐ ┌───┴───┐ │  ┌───┴───┐ ┌──┴───┐ ┌──┴───┐
  │注册登录│ │车次查询│ │我的订单│ │  │票务发布│ │用户列表│ │交易记录│
  │       │ │       │ │       │ │  │       │ │       │ │      │
  │个人中心│ │余票查询│ │订单支付│ │  │票务编辑│ │权限管理│ │财务报表│
  │       │ │       │ │       │ │  │       │ │       │ │      │
  │密码修改│ │价格查询│ │退改签  │ │  │库存管理│ │用户审核│ │对账管理│
  └───────┘ └───────┘ └───────┘ │  └───────┘ └───────┘ └──────┘
                                 │
                        ┌────────┼────────┐
                        │                 │
                   ┌────▼────┐      ┌────▼────┐
                   │权限控制  │      │日志审计  │
                   │         │      │         │
                   │身份认证  │      │数据备份  │
                   │         │      │         │
                   │接口安全  │      │监控告警  │
                   └─────────┘      └─────────┘
```

### 3.2 主要功能说明

#### 3.2.1 前台用户模块

**1. 用户管理功能**

**1.1 用户注册**
- **功能描述**：新用户通过填写注册信息创建账号
- **输入**：用户名、密码、邮箱、手机号、真实姓名、身份证号
- **处理**：
  - 验证信息格式（邮箱、手机号、身份证）
  - 检查用户名/邮箱/手机号唯一性
  - 密码加密（BCrypt算法）
  - 发送验证邮件/短信
  - 创建用户记录
- **输出**：注册成功/失败信息
- **异常处理**：用户名已存在、邮箱已注册、手机号已注册

**1.2 用户登录**
- **功能描述**：用户通过账号密码登录系统
- **输入**：用户名/邮箱/手机号，密码
- **处理**：
  - 验证用户存在性
  - 验证密码正确性
  - 生成JWT令牌
  - 记录登录日志
- **输出**：JWT令牌、用户基本信息
- **异常处理**：用户不存在、密码错误、账号被锁定

**1.3 个人中心**
- **功能描述**：查看和修改个人信息
- **功能点**：
  - 查看个人资料
  - 修改联系方式
  - 修改密码
  - 实名认证
  - 查看积分/优惠券

**2. 票务查询功能**

**2.1 车次/航班查询**
- **功能描述**：根据条件查询可用票务信息
- **输入**：出发地、目的地、出发日期、（可选）票务类型、价格区间
- **处理**：
  - 构建查询条件
  - 数据库多表关联查询
  - 按时间/价格排序
  - 分页返回结果
- **输出**：票务列表（票号、时间、价格、余票等）
- **性能要求**：查询响应时间 < 1秒

**2.2 余票查询**
- **功能描述**：实时查询某车次/航班的余票情况
- **输入**：ticket_id
- **处理**：
  - 查询总座位数
  - 统计已预订座位
  - 计算可用座位
  - 返回座位分布图
- **输出**：余票数量、座位分布、价格信息

**2.3 票价查询**
- **功能描述**：查询不同座位等级的价格
- **输出**：不同等级座位的价格列表

**3. 订单管理功能**

**3.1 在线订票**
- **功能描述**：用户选择票务并创建订单
- **输入**：ticket_id、乘客信息、座位选择
- **处理流程**：
  1. 验证用户登录状态
  2. 检查票务有效性
  3. 检查余票数量
  4. 锁定座位（悲观锁/乐观锁）
  5. 创建订单记录
  6. 设置订单超时（15分钟）
  7. 返回订单号
- **输出**：订单详情
- **并发控制**：使用数据库行锁防止超卖
- **异常处理**：余票不足、座位已被占用、系统繁忙

**3.2 订单支付**
- **功能描述**：用户完成订单支付
- **输入**：order_id、payment_method
- **处理流程**：
  1. 验证订单状态
  2. 检查订单是否超时
  3. 调用第三方支付接口
  4. 接收支付回调
  5. 更新订单状态
  6. 扣减座位库存
  7. 生成电子票据
  8. 发送短信/邮件通知
- **输出**：支付结果、电子票据
- **支付方式**：支付宝、微信支付、银行卡
- **安全机制**：支付接口签名验证、HTTPS加密传输

**3.3 我的订单**
- **功能描述**：查看个人所有订单
- **功能点**：
  - 订单列表展示（分页）
  - 订单状态筛选
  - 订单详情查看
  - 订单搜索（按订单号/日期）

**3.4 退票/改签**
- **功能描述**：申请订单退票或改签
- **输入**：order_id、操作类型、改签目标（如果是改签）
- **处理**：
  - 验证订单状态
  - 检查退改签规则
  - 计算手续费
  - 创建退改签申请
  - 管理员审核
  - 处理退款
  - 释放座位
- **输出**：申请结果、退款金额
- **业务规则**：
  - 出发前24小时可免费改签
  - 出发前48小时退票收取5%手续费
  - 出发前24-48小时退票收取10%手续费
  - 出发前24小时内退票收取20%手续费

#### 3.2.2 后台管理模块

**1. 票务管理功能**

**1.1 票务发布**
- **功能描述**：管理员发布新的票务信息
- **输入**：票务类型、车次/航班号、出发地、目的地、时间、价格、座位信息
- **处理**：
  - 验证管理员权限
  - 数据格式验证
  - 创建票务记录
  - 初始化座位库存
  - 记录操作日志
- **输出**：发布成功/失败信息

**1.2 票务编辑**
- **功能描述**：修改已发布的票务信息
- **功能点**：
  - 修改票务基本信息
  - 调整价格
  - 增减座位
  - 启用/禁用票务
- **权限控制**：仅管理员可操作

**1.3 库存管理**
- **功能描述**：管理票务库存
- **功能点**：
  - 查看实时库存
  - 手动调整库存
  - 座位分配管理
  - 库存预警（低于阈值提醒）

**2. 用户管理功能**

**2.1 用户列表**
- **功能描述**：查看和管理所有用户
- **功能点**：
  - 用户列表展示（分页、搜索）
  - 用户详情查看
  - 用户状态管理（启用/禁用）
  - 用户数据导出

**2.2 权限管理**
- **功能描述**：管理用户权限和角色
- **功能点**：
  - 角色定义（普通用户、管理员、财务）
  - 权限分配
  - 角色绑定

**2.3 订单管理**
- **功能描述**：管理所有订单
- **功能点**：
  - 订单列表查看
  - 订单状态修改
  - 退改签审核
  - 异常订单处理

**3. 财务管理功能**

**3.1 交易记录**
- **功能描述**：查看所有交易记录
- **功能点**：
  - 交易流水查询
  - 交易明细导出
  - 支付方式统计

**3.2 财务报表**
- **功能描述**：生成各类财务报表
- **报表类型**：
  - 日/周/月营收报表
  - 票务销售统计
  - 退款统计报表
  - 用户消费排行

**3.3 对账管理**
- **功能描述**：与第三方支付平台对账
- **功能点**：
  - 对账单下载
  - 差异处理
  - 结算管理

#### 3.2.3 系统支撑模块

**1. 权限控制**
- JWT身份认证
- RBAC权限模型
- 接口权限拦截
- 数据权限控制

**2. 日志审计**
- 操作日志记录
- 登录日志记录
- 异常日志记录
- 日志查询与分析

**3. 数据备份**
- 定时自动备份
- 手动备份
- 备份文件管理
- 数据恢复

**4. 监控告警**
- 系统性能监控
- 业务指标监控
- 异常告警通知
- 健康检查

---

## 4. 开发与运行环境

### 4.1 开发环境

#### 4.1.1 前端开发环境
- **操作系统**：Windows 10/11、macOS、Linux
- **Node.js**：v16.x 或更高版本
- **包管理器**：npm v8.x 或 yarn v1.22.x
- **IDE**：Visual Studio Code、WebStorm
- **浏览器**：Chrome 90+、Firefox 88+、Edge 90+（开发者工具）

#### 4.1.2 后端开发环境
- **操作系统**：Windows 10/11、macOS、Linux
- **JDK**：JDK 11 或 JDK 17
- **构建工具**：Maven 3.8+ 或 Gradle 7.x
- **IDE**：IntelliJ IDEA、Eclipse
- **数据库工具**：Navicat、DataGrip、MySQL Workbench

#### 4.1.3 数据库环境
- **数据库**：MySQL 8.0+ 或 PostgreSQL 13+
- **缓存**：Redis 6.x
- **消息队列**：RabbitMQ 3.x 或 Kafka 2.x（可选）

### 4.2 运行环境

#### 4.2.1 生产环境服务器配置
- **应用服务器**：
  - CPU：8核心及以上
  - 内存：16GB及以上
  - 硬盘：200GB SSD
  - 操作系统：CentOS 7+、Ubuntu 20.04+、Windows Server 2019+

- **数据库服务器**：
  - CPU：8核心及以上
  - 内存：32GB及以上
  - 硬盘：500GB SSD（RAID 10）
  - 操作系统：CentOS 7+、Ubuntu 20.04+

- **缓存服务器**：
  - CPU：4核心
  - 内存：8GB
  - 硬盘：100GB SSD

#### 4.2.2 软件环境
- **Web服务器**：Nginx 1.20+ 或 Apache 2.4+
- **应用服务器**：Tomcat 9.x、Spring Boot内嵌服务器
- **JVM**：OpenJDK 11/17 或 Oracle JDK 11/17
- **数据库**：MySQL 8.0+
- **缓存**：Redis 6.x
- **容器化**：Docker 20.x、Docker Compose 2.x（可选）

#### 4.2.3 网络环境
- **带宽**：100Mbps及以上
- **域名**：已备案的域名
- **SSL证书**：HTTPS证书（Let's Encrypt或商业证书）
- **CDN**：阿里云CDN、腾讯云CDN、七牛云（静态资源加速）

### 4.3 第三方服务
- **支付接口**：支付宝开放平台、微信支付商户平台
- **短信服务**：阿里云短信、腾讯云短信
- **邮件服务**：阿里云邮件推送、SendCloud
- **对象存储**：阿里云OSS、腾讯云COS、七牛云（存储票据、图片等）

---

## 5. 技术栈

### 5.1 前端技术栈

#### 5.1.1 核心框架
- **React 18.x**：前端UI框架
  - Hooks：函数式组件开发
  - Context API：全局状态管理
  - Suspense & Lazy：代码分割与懒加载

#### 5.1.2 状态管理
- **Redux Toolkit**：全局状态管理
- **React Query / SWR**：服务端状态管理、数据缓存

#### 5.1.3 路由
- **React Router v6**：前端路由管理
  - 声明式路由
  - 路由守卫
  - 路由懒加载

#### 5.1.4 UI组件库
- **Ant Design 5.x** 或 **Material-UI (MUI) 5.x**：
  - 丰富的组件库
  - 响应式设计
  - 主题定制
  - 表单验证

#### 5.1.5 HTTP客户端
- **Axios**：HTTP请求库
  - 请求/响应拦截器
  - 请求取消
  - 超时控制
  - 错误统一处理

#### 5.1.6 表单处理
- **React Hook Form** 或 **Formik**：表单状态管理与验证
- **Yup**：表单验证规则定义

#### 5.1.7 样式方案
- **CSS Modules** 或 **Styled Components** 或 **Tailwind CSS**：
  - 样式隔离
  - 动态样式
  - 响应式设计

#### 5.1.8 图表可视化
- **ECharts** 或 **Recharts**：数据可视化（财务报表、统计图表）

#### 5.1.9 工具库
- **Day.js** 或 **date-fns**：日期时间处理
- **Lodash**：JavaScript工具库
- **classnames**：动态类名管理

#### 5.1.10 构建工具
- **Vite** 或 **Webpack 5**：模块打包工具
- **Babel**：JavaScript编译器
- **TypeScript**：类型系统（可选但推荐）

#### 5.1.11 代码质量
- **ESLint**：代码检查
- **Prettier**：代码格式化
- **Husky**：Git Hooks
- **lint-staged**：暂存区代码检查

#### 5.1.12 测试
- **Jest**：单元测试框架
- **React Testing Library**：组件测试
- **Cypress** 或 **Playwright**：端到端测试

### 5.2 后端技术栈

#### 5.2.1 核心框架
- **Spring Boot 2.7.x / 3.x**：微服务开发框架
  - 快速开发
  - 自动配置
  - 嵌入式服务器
  - 生产就绪特性

#### 5.2.2 Web框架
- **Spring MVC**：Web应用开发
  - RESTful API
  - 请求映射
  - 数据绑定
  - 参数校验

#### 5.2.3 ORM框架
- **MyBatis Plus** 或 **Spring Data JPA**：
  - 数据库操作
  - CRUD自动生成
  - 分页插件
  - 乐观锁支持

#### 5.2.4 数据库
- **MySQL 8.0**：关系型数据库
  - InnoDB存储引擎
  - 事务支持
  - 索引优化
- **Redis**：缓存数据库
  - 热点数据缓存
  - 分布式锁
  - 消息队列
  - Session共享

#### 5.2.5 安全框架
- **Spring Security**：安全认证框架
  - 用户认证
  - 权限授权
  - 密码加密（BCrypt）
  - CSRF防护
- **JWT (JSON Web Token)**：无状态身份认证
  - Token生成与验证
  - 刷新Token机制

#### 5.2.6 参数校验
- **Hibernate Validator (JSR-303)**：参数校验
  - 注解式校验
  - 自定义校验器

#### 5.2.7 API文档
- **Swagger 3 (SpringDoc OpenAPI)**：API文档生成
  - 自动生成API文档
  - 在线调试接口

#### 5.2.8 日志框架
- **Logback** 或 **Log4j2**：日志记录
  - 分级别日志
  - 日志滚动
  - 异步日志

#### 5.2.9 工具库
- **Lombok**：简化Java代码
  - 自动生成Getter/Setter
  - 构造函数
  - Builder模式
- **Hutool**：Java工具类库
  - 日期、字符串、加密等工具
- **Guava**：Google Java工具库

#### 5.2.10 消息队列（可选）
- **RabbitMQ** 或 **Apache Kafka**：
  - 异步消息处理
  - 订单超时处理
  - 邮件/短信通知

#### 5.2.11 定时任务
- **Spring Task** 或 **Quartz**：
  - 订单超时检查
  - 数据同步
  - 报表生成

#### 5.2.12 分布式支持（可选）
- **Spring Cloud Alibaba**：微服务解决方案
  - **Nacos**：服务注册与配置中心
  - **Sentinel**：流量控制、熔断降级
  - **Seata**：分布式事务
  - **Gateway**：API网关

#### 5.2.13 测试
- **JUnit 5**：单元测试
- **Mockito**：Mock测试
- **Spring Boot Test**：集成测试

#### 5.2.14 构建与部署
- **Maven** 或 **Gradle**：项目构建
- **Docker**：容器化部署
- **Jenkins** 或 **GitLab CI/CD**：持续集成/部署

### 5.3 数据库缓存配置

#### 5.3.1 MySQL配置优化
```ini
# InnoDB配置
innodb_buffer_pool_size = 2G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2

# 查询缓存
query_cache_size = 128M
query_cache_type = 1

# 连接数
max_connections = 1000
```

#### 5.3.2 Redis使用场景
- **缓存**：热点票务数据、用户信息
- **分布式锁**：防止订单重复提交、库存超卖
- **Session管理**：用户会话存储
- **限流**：接口访问频率限制
- **消息队列**：异步任务处理

### 5.4 技术架构图

```
┌─────────────────────────────────────────────────────────┐
│                       前端层                             │
│  React + Redux + Ant Design + React Router + Axios      │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTPS (Nginx反向代理)
┌─────────────────────▼───────────────────────────────────┐
│                    API网关层                             │
│         Spring Cloud Gateway (可选) / Nginx              │
│              负载均衡、限流、鉴权、路由                    │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                   应用服务层                             │
│      Spring Boot + Spring MVC + Spring Security         │
│  ┌────────────┬────────────┬────────────┬────────────┐ │
│  │ 用户服务   │ 票务服务   │ 订单服务   │ 支付服务   │ │
│  └────────────┴────────────┴────────────┴────────────┘ │
└─────────────────────┬───────────────────────────────────┘
                      │
      ┌───────────────┼───────────────┐
      │               │               │
┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
│   MySQL   │  │   Redis   │  │ RabbitMQ  │
│  主从复制  │  │  缓存+锁   │  │ 消息队列  │
└───────────┘  └───────────┘  └───────────┘
```

---

## 6. 数据库设计

### 6.1 核心数据表

#### 6.1.1 用户表（users）
```sql
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码（加密）',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
    phone VARCHAR(20) NOT NULL UNIQUE COMMENT '手机号',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    id_card VARCHAR(18) COMMENT '身份证号',
    user_type TINYINT DEFAULT 0 COMMENT '用户类型：0-普通用户，1-管理员',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

#### 6.1.2 票务表（tickets）
```sql
CREATE TABLE tickets (
    ticket_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '票务ID',
    ticket_type VARCHAR(20) NOT NULL COMMENT '票务类型：train-火车，plane-飞机',
    ticket_no VARCHAR(50) NOT NULL COMMENT '车次/航班号',
    departure VARCHAR(50) NOT NULL COMMENT '出发地',
    destination VARCHAR(50) NOT NULL COMMENT '目的地',
    departure_time DATETIME NOT NULL COMMENT '出发时间',
    arrival_time DATETIME COMMENT '到达时间',
    duration INT COMMENT '行程时长（分钟）',
    price DECIMAL(10,2) NOT NULL COMMENT '基础价格',
    total_seats INT NOT NULL COMMENT '总座位数',
    available_seats INT NOT NULL COMMENT '剩余座位数',
    status TINYINT DEFAULT 1 COMMENT '状态：0-下架，1-在售',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_route (departure, destination, departure_time),
    INDEX idx_ticket_no (ticket_no),
    INDEX idx_departure_time (departure_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='票务表';
```

#### 6.1.3 座位表（seats）
```sql
CREATE TABLE seats (
    seat_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '座位ID',
    ticket_id INT NOT NULL COMMENT '票务ID',
    seat_type VARCHAR(20) NOT NULL COMMENT '座位类型：一等座、二等座、商务座等',
    seat_no VARCHAR(10) NOT NULL COMMENT '座位号',
    price DECIMAL(10,2) NOT NULL COMMENT '价格',
    status TINYINT DEFAULT 0 COMMENT '状态：0-可用，1-已锁定，2-已售',
    lock_time DATETIME COMMENT '锁定时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_status (status),
    UNIQUE KEY uk_ticket_seat (ticket_id, seat_no),
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='座位表';
```

#### 6.1.4 订单表（orders）
```sql
CREATE TABLE orders (
    order_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
    order_no VARCHAR(32) NOT NULL UNIQUE COMMENT '订单号',
    user_id INT NOT NULL COMMENT '用户ID',
    ticket_id INT NOT NULL COMMENT '票务ID',
    seat_id INT NOT NULL COMMENT '座位ID',
    passenger_name VARCHAR(50) NOT NULL COMMENT '乘客姓名',
    passenger_id_card VARCHAR(18) NOT NULL COMMENT '乘客身份证',
    passenger_phone VARCHAR(20) COMMENT '乘客手机号',
    order_status TINYINT DEFAULT 0 COMMENT '订单状态：0-待支付，1-已支付，2-已取消，3-已退款，4-已完成',
    total_amount DECIMAL(10,2) NOT NULL COMMENT '订单金额',
    payment_method VARCHAR(20) COMMENT '支付方式',
    pay_time DATETIME COMMENT '支付时间',
    cancel_time DATETIME COMMENT '取消时间',
    refund_time DATETIME COMMENT '退款时间',
    refund_amount DECIMAL(10,2) COMMENT '退款金额',
    expire_time DATETIME COMMENT '过期时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_order_no (order_no),
    INDEX idx_order_status (order_status),
    INDEX idx_create_time (create_time),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id),
    FOREIGN KEY (seat_id) REFERENCES seats(seat_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';
```

#### 6.1.5 支付表（payments）
```sql
CREATE TABLE payments (
    payment_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '支付ID',
    order_id BIGINT NOT NULL COMMENT '订单ID',
    payment_no VARCHAR(64) NOT NULL UNIQUE COMMENT '支付流水号',
    payment_method VARCHAR(20) NOT NULL COMMENT '支付方式：alipay-支付宝，wechat-微信',
    amount DECIMAL(10,2) NOT NULL COMMENT '支付金额',
    payment_status TINYINT DEFAULT 0 COMMENT '支付状态：0-待支付，1-支付成功，2-支付失败',
    transaction_id VARCHAR(64) COMMENT '第三方交易号',
    pay_time DATETIME COMMENT '支付时间',
    notify_time DATETIME COMMENT '回调通知时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_order_id (order_id),
    INDEX idx_payment_no (payment_no),
    INDEX idx_transaction_id (transaction_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付表';
```

#### 6.1.6 退改签表（refund_change）
```sql
CREATE TABLE refund_change (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    order_id BIGINT NOT NULL COMMENT '订单ID',
    user_id INT NOT NULL COMMENT '用户ID',
    type TINYINT NOT NULL COMMENT '类型：1-退票，2-改签',
    reason VARCHAR(255) COMMENT '申请原因',
    status TINYINT DEFAULT 0 COMMENT '状态：0-待审核，1-已通过，2-已拒绝',
    fee DECIMAL(10,2) DEFAULT 0 COMMENT '手续费',
    refund_amount DECIMAL(10,2) COMMENT '退款金额',
    new_ticket_id INT COMMENT '改签后的票务ID（改签时）',
    new_seat_id INT COMMENT '改签后的座位ID（改签时）',
    audit_user_id INT COMMENT '审核人ID',
    audit_time DATETIME COMMENT '审核时间',
    audit_remark VARCHAR(255) COMMENT '审核备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_order_id (order_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='退改签表';
```

#### 6.1.7 操作日志表（operation_logs）
```sql
CREATE TABLE operation_logs (
    log_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    user_id INT COMMENT '用户ID',
    username VARCHAR(50) COMMENT '用户名',
    operation VARCHAR(50) NOT NULL COMMENT '操作类型',
    method VARCHAR(200) COMMENT '请求方法',
    params TEXT COMMENT '请求参数',
    ip VARCHAR(50) COMMENT 'IP地址',
    location VARCHAR(100) COMMENT '操作地点',
    execute_time INT COMMENT '执行时长（毫秒）',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    INDEX idx_user_id (user_id),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';
```

### 6.2 索引优化策略
- 为高频查询字段添加索引
- 使用复合索引优化多条件查询
- 避免过多索引影响写入性能
- 定期分析慢查询并优化

### 6.3 数据库优化
- 读写分离：主库写，从库读
- 分库分表：订单表按时间分表
- 缓存策略：热点数据使用Redis缓存
- 定期归档：历史订单数据归档

---

## 7. 系统架构

### 7.1 系统分层架构

```
┌─────────────────────────────────────────────┐
│            表现层（Presentation Layer）       │
│         React + Ant Design + Redux          │
└──────────────────┬──────────────────────────┘
                   │ HTTP/HTTPS
┌──────────────────▼──────────────────────────┐
│           控制层（Controller Layer）          │
│      Spring MVC RESTful API + Swagger       │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│            服务层（Service Layer）           │
│     业务逻辑处理 + 事务管理 + 缓存策略        │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│          数据访问层（DAO Layer）              │
│      MyBatis Plus / Spring Data JPA         │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│          数据持久层（Database Layer）         │
│         MySQL + Redis + 对象存储            │
└─────────────────────────────────────────────┘
```

### 7.2 项目目录结构

#### 7.2.1 前端目录结构
```
booking-system-frontend/
├── public/                 # 静态资源
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── api/               # API接口
│   │   ├── user.js
│   │   ├── ticket.js
│   │   └── order.js
│   ├── assets/            # 静态资源（图片、字体等）
│   ├── components/        # 公共组件
│   │   ├── Header/
│   │   ├── Footer/
│   │   └── Loading/
│   ├── pages/             # 页面组件
│   │   ├── Home/
│   │   ├── Login/
│   │   ├── Register/
│   │   ├── TicketList/
│   │   ├── OrderList/
│   │   └── Admin/
│   ├── store/             # Redux状态管理
│   │   ├── slices/
│   │   └── index.js
│   ├── routes/            # 路由配置
│   ├── utils/             # 工具函数
│   │   ├── request.js     # Axios封装
│   │   ├── auth.js        # 认证工具
│   │   └── validator.js   # 验证工具
│   ├── styles/            # 全局样式
│   ├── App.jsx
│   └── main.jsx
├── .env                   # 环境变量
├── package.json
├── vite.config.js
└── README.md
```

#### 7.2.2 后端目录结构
```
booking-system-backend/
├── src/main/java/com/booking/
│   ├── BookingApplication.java        # 启动类
│   ├── config/                        # 配置类
│   │   ├── SecurityConfig.java        # 安全配置
│   │   ├── RedisConfig.java           # Redis配置
│   │   └── WebMvcConfig.java          # MVC配置
│   ├── controller/                    # 控制层
│   │   ├── UserController.java
│   │   ├── TicketController.java
│   │   ├── OrderController.java
│   │   └── AdminController.java
│   ├── service/                       # 服务层
│   │   ├── IUserService.java
│   │   ├── impl/
│   │   │   └── UserServiceImpl.java
│   │   ├── ITicketService.java
│   │   └── IOrderService.java
│   ├── mapper/                        # 数据访问层
│   │   ├── UserMapper.java
│   │   ├── TicketMapper.java
│   │   └── OrderMapper.java
│   ├── entity/                        # 实体类
│   │   ├── User.java
│   │   ├── Ticket.java
│   │   └── Order.java
│   ├── dto/                           # 数据传输对象
│   │   ├── LoginDTO.java
│   │   └── OrderDTO.java
│   ├── vo/                            # 视图对象
│   │   ├── UserVO.java
│   │   └── OrderVO.java
│   ├── common/                        # 公共类
│   │   ├── Result.java                # 统一响应
│   │   ├── ResultCode.java            # 响应码
│   │   └── PageResult.java            # 分页结果
│   ├── exception/                     # 异常处理
│   │   ├── GlobalExceptionHandler.java
│   │   └── BusinessException.java
│   ├── interceptor/                   # 拦截器
│   │   └── JwtInterceptor.java
│   ├── annotation/                    # 自定义注解
│   │   └── RequireLogin.java
│   └── utils/                         # 工具类
│       ├── JwtUtil.java
│       ├── RedisUtil.java
│       └── PasswordUtil.java
├── src/main/resources/
│   ├── mapper/                        # MyBatis XML
│   ├── application.yml                # 配置文件
│   ├── application-dev.yml            # 开发环境
│   ├── application-prod.yml           # 生产环境
│   └── db/
│       └── schema.sql                 # 数据库脚本
├── src/test/                          # 测试代码
├── pom.xml                            # Maven配置
└── README.md
```

### 7.3 部署架构

```
                    ┌──────────────┐
                    │   用户浏览器  │
                    └───────┬──────┘
                            │ HTTPS
                    ┌───────▼──────┐
                    │   Nginx      │
                    │  反向代理+CDN │
                    └───┬───────┬──┘
                        │       │
        静态资源 ◄──────┘       └──────▶ API请求
                                        │
                            ┌───────────▼────────────┐
                            │  Spring Boot 应用集群  │
                            │  (负载均衡)            │
                            └───┬────────────────┬───┘
                                │                │
                    ┌───────────▼─┐        ┌────▼────────┐
                    │   MySQL     │        │   Redis     │
                    │  (主从复制)  │        │  (集群)     │
                    └─────────────┘        └─────────────┘
```

---

## 8. 项目实施计划

### 8.1 开发阶段划分

**第一阶段：需求分析与设计（1-2周）**
- 需求调研与分析
- 数据库设计
- 接口设计
- UI原型设计

**第二阶段：基础功能开发（3-4周）**
- 用户注册登录
- 票务查询展示
- 订单创建
- 基础管理功能

**第三阶段：核心功能开发（4-5周）**
- 支付集成
- 退改签功能
- 权限管理
- 数据统计

**第四阶段：测试与优化（2-3周）**
- 单元测试
- 集成测试
- 性能优化
- 安全加固

**第五阶段：部署上线（1周）**
- 服务器部署
- 域名配置
- 监控告警
- 上线验证

### 8.2 风险与对策

| 风险 | 对策 |
|-----|------|
| 并发超卖 | 使用分布式锁、乐观锁、库存扣减队列 |
| 支付安全 | HTTPS加密、签名验证、异步回调 |
| 系统性能 | 缓存、数据库优化、负载均衡 |
| 数据丢失 | 定期备份、主从复制、事务保证 |

---

## 9. 总结

本网上订票系统是一个典型的B2C电子商务应用，涵盖了用户管理、商品管理（票务）、订单处理、支付集成等核心业务模块。通过采用前后端分离的架构，结合React和Spring Boot技术栈，可以构建一个高性能、高可用、易扩展的现代化Web应用系统。

系统的核心技术要点包括：
- **前端**：React组件化开发、Redux状态管理、Ant Design UI框架
- **后端**：Spring Boot微服务、MyBatis数据持久化、Spring Security安全认证
- **数据库**：MySQL关系型数据库、Redis缓存
- **架构**：前后端分离、RESTful API、分层架构
- **安全**：JWT身份认证、密码加密、接口权限控制
- **性能**：缓存策略、数据库优化、并发控制

本文档为系统开发提供了完整的需求分析和技术方案，可作为后续详细设计和编码实现的依据。

---

## 附录

### A. 参考资料
- [Spring Boot官方文档](https://spring.io/projects/spring-boot)
- [React官方文档](https://react.dev/)
- [MyBatis Plus文档](https://baomidou.com/)
- [Ant Design文档](https://ant.design/)
- [MySQL 8.0参考手册](https://dev.mysql.com/doc/refman/8.0/en/)
- [Redis官方文档](https://redis.io/documentation)

### B. 联系方式
- 项目负责人：[待定]
- 技术支持：[待定]
- 邮箱：[待定]

---

**文档版本**：v1.0  
**最后更新**：2025-11-03  
**文档状态**：初稿

