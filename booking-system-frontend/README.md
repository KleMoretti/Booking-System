# 火车票预订系统 - 前端

基于 React 18 + Vite + Ant Design 构建的现代化火车票预订系统前端应用。

## 技术栈

- **React 18** - 前端框架
- **Vite** - 构建工具
- **Ant Design 5** - UI 组件库
- **Redux Toolkit** - 状态管理
- **React Router 6** - 路由管理
- **Axios** - HTTP 客户端
- **Day.js** - 日期处理

## 项目结构

```
src/
├── api/              # API 接口封装
├── assets/           # 静态资源
├── components/       # 公共组件
│   ├── Header/       # 页头组件
│   ├── Footer/       # 页脚组件
│   ├── Loading/      # 加载组件
│   └── PrivateRoute/ # 路由保护组件
├── pages/            # 页面组件
│   ├── Home/         # 首页
│   ├── Login/        # 登录页
│   ├── Register/     # 注册页
│   ├── TicketList/   # 车票列表
│   ├── OrderList/    # 订单列表
│   └── Admin/        # 管理后台
├── routes/           # 路由配置
├── store/            # Redux 状态管理
│   └── slices/       # 状态切片
├── styles/           # 全局样式
├── utils/            # 工具函数
│   ├── request.js    # Axios 封装
│   ├── auth.js       # 认证工具
│   ├── storage.js    # 本地存储
│   ├── validator.js  # 表单验证
│   └── constants.js  # 常量定义
├── App.jsx           # 应用入口
└── main.jsx          # 主文件

## 功能特性

- ✅ 用户注册/登录
- ✅ 车票查询
- ✅ 在线订票
- ✅ 订单管理
- ✅ 支付功能
- ✅ 管理后台
- ✅ 响应式设计
- ✅ 路由保护

## 开发指南

### 安装依赖

```bash
npm install
```

### 环境配置

复制 `.env.example` 为 `.env` 并配置环境变量：

```bash
cp .env.example .env
```

配置后端 API 地址：

```
VITE_API_BASE_URL=http://localhost:8080/api
```

### 运行开发环境

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 代码检查

```bash
npm run lint
```

## 主要页面

- **/home** - 首页，提供车次查询功能
- **/login** - 用户登录
- **/register** - 用户注册
- **/tickets** - 车票列表（需登录）
- **/orders** - 我的订单（需登录）
- **/admin** - 管理后台（需登录）

## 开发规范

- 使用 ESLint 进行代码检查
- 遵循 React Hooks 规范
- 使用函数式组件
- 统一使用 Arrow Function
- 合理使用 Redux 管理全局状态

