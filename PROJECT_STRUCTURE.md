# 网上订票系统 - 项目结构说明

## 项目概述
本项目已按照README.md中的需求分析完整生成了前后端项目的目录结构和基础文件。

## 项目结构

```
Booking-System/
├── README.md                          # 需求分析文档
├── PROJECT_STRUCTURE.md              # 本文件
├── .gitignore                        # Git忽略配置
├── LICENSE                           # 许可证
│
├── booking-system-frontend/          # 前端项目
│   ├── public/
│   │   ├── index.html               # HTML入口
│   │   └── favicon.ico              # 网站图标
│   ├── src/
│   │   ├── api/                     # API接口
│   │   │   ├── user.js
│   │   │   ├── ticket.js
│   │   │   ├── order.js
│   │   │   ├── admin.js
│   │   │   └── payment.js
│   │   ├── assets/                  # 静态资源
│   │   ├── components/              # 公共组件
│   │   │   ├── Header/
│   │   │   │   ├── index.jsx
│   │   │   │   └── style.css
│   │   │   ├── Footer/
│   │   │   │   ├── index.jsx
│   │   │   │   └── style.css
│   │   │   └── Loading/
│   │   │       ├── index.jsx
│   │   │       └── style.css
│   │   ├── pages/                   # 页面组件
│   │   │   ├── Home/
│   │   │   │   ├── index.jsx
│   │   │   │   └── style.css
│   │   │   ├── Login/
│   │   │   │   ├── index.jsx
│   │   │   │   └── style.css
│   │   │   ├── Register/
│   │   │   │   ├── index.jsx
│   │   │   │   └── style.css
│   │   │   ├── TicketList/
│   │   │   │   ├── index.jsx
│   │   │   │   └── style.css
│   │   │   ├── OrderList/
│   │   │   │   ├── index.jsx
│   │   │   │   └── style.css
│   │   │   └── Admin/
│   │   │       ├── index.jsx
│   │   │       └── style.css
│   │   ├── store/                   # Redux状态管理
│   │   │   ├── index.js
│   │   │   └── slices/
│   │   │       ├── userSlice.js
│   │   │       ├── ticketSlice.js
│   │   │       └── orderSlice.js
│   │   ├── routes/                  # 路由配置
│   │   │   └── index.jsx
│   │   ├── utils/                   # 工具函数
│   │   │   ├── request.js           # Axios封装
│   │   │   ├── auth.js              # 认证工具
│   │   │   ├── validator.js         # 验证工具
│   │   │   ├── constants.js         # 常量定义
│   │   │   └── storage.js           # 本地存储
│   │   ├── styles/                  # 全局样式
│   │   │   └── index.css
│   │   ├── App.jsx                  # 根组件
│   │   └── main.jsx                 # 入口文件
│   ├── .gitignore
│   ├── .eslintrc.cjs                # ESLint配置
│   ├── package.json                 # 依赖配置
│   ├── vite.config.js               # Vite配置
│   └── README.md                    # 前端说明
│
└── booking-system-backend/           # 后端项目
    ├── src/
    │   ├── main/
    │   │   ├── java/com/booking/
    │   │   │   ├── BookingApplication.java      # 启动类
    │   │   │   ├── config/                      # 配置类
    │   │   │   │   ├── SecurityConfig.java
    │   │   │   │   ├── RedisConfig.java
    │   │   │   │   ├── WebMvcConfig.java
    │   │   │   │   ├── MyBatisPlusConfig.java
    │   │   │   │   └── CorsConfig.java
    │   │   │   ├── controller/                  # 控制层
    │   │   │   │   ├── UserController.java
    │   │   │   │   ├── TicketController.java
    │   │   │   │   ├── OrderController.java
    │   │   │   │   ├── AdminController.java
    │   │   │   │   ├── PaymentController.java
    │   │   │   │   └── SeatController.java
    │   │   │   ├── service/                     # 服务层
    │   │   │   │   ├── IUserService.java
    │   │   │   │   ├── ITicketService.java
    │   │   │   │   ├── IOrderService.java
    │   │   │   │   ├── IPaymentService.java
    │   │   │   │   ├── ISeatService.java
    │   │   │   │   └── impl/
    │   │   │   │       ├── UserServiceImpl.java
    │   │   │   │       ├── TicketServiceImpl.java
    │   │   │   │       ├── OrderServiceImpl.java
    │   │   │   │       ├── PaymentServiceImpl.java
    │   │   │   │       └── SeatServiceImpl.java
    │   │   │   ├── mapper/                      # 数据访问层
    │   │   │   │   ├── UserMapper.java
    │   │   │   │   ├── TicketMapper.java
    │   │   │   │   ├── OrderMapper.java
    │   │   │   │   ├── PaymentMapper.java
    │   │   │   │   └── SeatMapper.java
    │   │   │   ├── entity/                      # 实体类
    │   │   │   │   ├── User.java
    │   │   │   │   ├── Ticket.java
    │   │   │   │   ├── Order.java
    │   │   │   │   ├── Seat.java
    │   │   │   │   ├── Payment.java
    │   │   │   │   ├── RefundChange.java
    │   │   │   │   └── OperationLog.java
    │   │   │   ├── dto/                         # 数据传输对象
    │   │   │   │   ├── LoginDTO.java
    │   │   │   │   ├── RegisterDTO.java
    │   │   │   │   ├── OrderDTO.java
    │   │   │   │   ├── PaymentDTO.java
    │   │   │   │   └── TicketQueryDTO.java
    │   │   │   ├── vo/                          # 视图对象
    │   │   │   │   ├── UserVO.java
    │   │   │   │   ├── OrderVO.java
    │   │   │   │   ├── TicketVO.java
    │   │   │   │   ├── PaymentVO.java
    │   │   │   │   └── SeatVO.java
    │   │   │   ├── common/                      # 公共类
    │   │   │   │   ├── Result.java
    │   │   │   │   ├── ResultCode.java
    │   │   │   │   └── PageResult.java
    │   │   │   ├── exception/                   # 异常处理
    │   │   │   │   ├── GlobalExceptionHandler.java
    │   │   │   │   └── BusinessException.java
    │   │   │   ├── interceptor/                 # 拦截器
    │   │   │   │   └── JwtInterceptor.java
    │   │   │   ├── annotation/                  # 自定义注解
    │   │   │   │   └── RequireLogin.java
    │   │   │   ├── enums/                       # 枚举类
    │   │   │   │   ├── OrderStatus.java
    │   │   │   │   └── UserType.java
    │   │   │   └── utils/                       # 工具类
    │   │   │       ├── JwtUtil.java
    │   │   │       ├── RedisUtil.java
    │   │   │       └── PasswordUtil.java
    │   │   └── resources/
    │   │       ├── mapper/                      # MyBatis XML
    │   │       │   ├── UserMapper.xml
    │   │       │   ├── TicketMapper.xml
    │   │       │   ├── OrderMapper.xml
    │   │       │   ├── PaymentMapper.xml
    │   │       │   └── SeatMapper.xml
    │   │       ├── db/
    │   │       │   └── schema.sql               # 数据库脚本
    │   │       ├── application.yml              # 主配置文件
    │   │       ├── application-dev.yml          # 开发环境配置
    │   │       ├── application-prod.yml         # 生产环境配置
    │   │       ├── logback-spring.xml           # 日志配置
    │   │       └── banner.txt                   # 启动Banner
    │   └── test/                                # 测试代码
    │       └── java/com/booking/
    │           ├── BookingApplicationTests.java
    │           ├── service/
    │           │   └── UserServiceTest.java
    │           └── controller/
    │               └── UserControllerTest.java
    ├── .gitignore
    ├── pom.xml                                  # Maven配置
    └── README.md                                # 后端说明
```

## 技术栈

### 前端
- **框架**: React 18.x
- **构建工具**: Vite
- **状态管理**: Redux Toolkit
- **路由**: React Router v6
- **UI组件**: Ant Design 5.x
- **HTTP客户端**: Axios
- **工具库**: Day.js, Lodash

### 后端
- **框架**: Spring Boot 2.7.x
- **JDK**: Java 21
- **ORM**: MyBatis Plus
- **数据库**: MySQL 8.0
- **缓存**: Redis 6.x
- **安全**: Spring Security + JWT
- **API文档**: SpringDoc OpenAPI (Swagger 3)
- **工具库**: Lombok, Hutool

## 下一步操作

### 前端项目
1. 安装依赖：
   ```bash
   cd booking-system-frontend
   npm install
   ```

2. 启动开发服务器：
   ```bash
   npm run dev
   ```

3. 访问：http://localhost:3000

### 后端项目
1. 配置数据库：
   - 修改 `application-dev.yml` 中的数据库连接信息
   - 执行 `src/main/resources/db/schema.sql` 创建数据库表

2. 配置Redis：
   - 确保本地Redis服务已启动
   - 修改 `application.yml` 中的Redis配置（如需要）

3. 运行项目：
   ```bash
   cd booking-system-backend
   mvn spring-boot:run
   ```

4. 访问Swagger文档：http://localhost:8080/api/swagger-ui.html

## 文件说明

### 前端主要文件
- **src/main.jsx**: 应用入口，挂载React应用
- **src/App.jsx**: 根组件，配置路由和全局Provider
- **src/store/index.js**: Redux Store配置
- **src/utils/request.js**: Axios请求封装，包含拦截器
- **src/utils/auth.js**: 认证相关工具（token管理等）
- **src/routes/index.jsx**: 路由配置文件

### 后端主要文件
- **BookingApplication.java**: Spring Boot启动类
- **config/**: 各种配置类（安全、Redis、跨域等）
- **controller/**: RESTful API接口
- **service/**: 业务逻辑层
- **mapper/**: 数据访问层
- **entity/**: 数据库实体类
- **dto/**: 数据传输对象（用于接收前端参数）
- **vo/**: 视图对象（用于返回给前端）
- **common/**: 通用类（统一响应、分页等）
- **utils/**: 工具类（JWT、加密等）

## 注意事项

1. **环境要求**
   - Node.js >= 16.x
   - JDK 21
   - Maven >= 3.6
   - MySQL >= 8.0
   - Redis >= 6.0

2. **开发建议**
   - 前端开发时注意使用ESLint进行代码检查
   - 后端开发时使用Lombok简化代码
   - 及时提交代码到Git仓库

3. **安全注意**
   - 生产环境需修改JWT密钥
   - 数据库密码不要提交到代码库
   - 使用.gitignore忽略敏感配置文件

## 已完成的工作

✅ README需求分析文档（包含系统分析、数据流图、数据字典等）
✅ 前端React项目完整目录结构
✅ 后端Spring Boot项目完整目录结构
✅ 所有基础文件已创建（空文件或基础框架）
✅ 数据库建表脚本（schema.sql）
✅ Maven配置文件（pom.xml）
✅ 前端构建配置（vite.config.js, package.json）
✅ 配置文件（application.yml, .env等）
✅ Git忽略配置（.gitignore）

## 待完善的内容

- [ ] 实现各Controller的API接口
- [ ] 实现Service层的业务逻辑
- [ ] 实现Mapper层的SQL语句
- [ ] 完善实体类的字段和注解
- [ ] 实现前端各页面组件
- [ ] 实现前端API调用
- [ ] 配置Redux状态管理
- [ ] 实现路由守卫和权限控制
- [ ] 编写单元测试和集成测试
- [ ] 完善异常处理和日志记录

现在所有文件框架已经搭建完成，可以开始填充具体的业务逻辑代码了！

