# 开发文档

## 项目概述

这是一个基于 React 18 + Vite + Ant Design 5 的火车票预订系统前端应用，采用现代化的前端技术栈和最佳实践。

## 技术选型

### 核心技术
- **React 18.3.1** - 采用函数式组件和 Hooks
- **Vite 5.4** - 快速的开发服务器和构建工具
- **Ant Design 5.21** - 企业级 UI 组件库

### 状态管理
- **Redux Toolkit 2.2** - 现代化的 Redux 状态管理
- **React Redux 9.1** - React 绑定

### 路由
- **React Router 6.26** - 声明式路由

### HTTP 请求
- **Axios 1.7** - Promise 基础的 HTTP 客户端

### 工具库
- **Day.js 1.11** - 轻量级日期处理库
- **Lodash 4.17** - 实用工具库
- **Classnames 2.5** - 动态 class 名称处理

## 项目架构

### 目录结构

```
src/
├── api/                    # API 接口层
│   ├── admin.js           # 管理后台接口
│   ├── order.js           # 订单接口
│   ├── payment.js         # 支付接口
│   ├── ticket.js          # 票务接口
│   └── user.js            # 用户接口
│
├── components/            # 公共组件
│   ├── EmptyState/        # 空状态组件
│   ├── ErrorBoundary/     # 错误边界
│   ├── Footer/            # 页脚
│   ├── Header/            # 页头导航
│   ├── Loading/           # 加载中组件
│   ├── PageHeader/        # 页面标题组件
│   └── PrivateRoute/      # 路由守卫
│
├── hooks/                 # 自定义 Hooks
│   └── useAuth.js         # 认证 Hook
│
├── pages/                 # 页面组件
│   ├── Admin/             # 管理后台
│   ├── Home/              # 首页
│   ├── Login/             # 登录页
│   ├── OrderList/         # 订单列表
│   ├── Register/          # 注册页
│   └── TicketList/        # 车票列表
│
├── routes/                # 路由配置
│   └── index.jsx          # 路由定义
│
├── store/                 # Redux 状态管理
│   ├── slices/            # Redux Slices
│   │   ├── orderSlice.js  # 订单状态
│   │   ├── ticketSlice.js # 票务状态
│   │   └── userSlice.js   # 用户状态
│   └── index.js           # Store 配置
│
├── styles/                # 全局样式
│   └── index.css          # 全局 CSS
│
├── utils/                 # 工具函数
│   ├── auth.js            # 认证相关
│   ├── constants.js       # 常量定义
│   ├── format.js          # 格式化工具
│   ├── request.js         # Axios 封装
│   ├── storage.js         # 本地存储
│   └── validator.js       # 表单验证
│
├── App.jsx                # 应用根组件
└── main.jsx               # 应用入口
```

## 核心功能模块

### 1. 用户认证模块

**文件位置**: `src/store/slices/userSlice.js`, `src/utils/auth.js`

**功能**:
- 用户登录/注册
- Token 管理
- 用户信息持久化
- 登录状态检查

**API 接口**:
- POST `/user/login` - 用户登录
- POST `/user/register` - 用户注册
- GET `/user/profile` - 获取用户信息

### 2. 车票搜索模块

**文件位置**: `src/pages/Home`, `src/pages/TicketList`

**功能**:
- 车站选择（支持搜索）
- 日期选择（禁用过去日期）
- 出发站/到达站互换
- 车次列表展示
- 余票信息显示

**API 接口**:
- GET `/station/list` - 获取车站列表
- GET `/trip/search` - 搜索车次
- GET `/trip/:id` - 获取车次详情

### 3. 订单管理模块

**文件位置**: `src/pages/OrderList`, `src/store/slices/orderSlice.js`

**功能**:
- 订单列表展示
- 订单状态管理
- 取消订单
- 支付订单

**API 接口**:
- GET `/order/list` - 获取订单列表
- POST `/order/create` - 创建订单
- POST `/order/:id/cancel` - 取消订单
- POST `/order/:id/pay` - 支付订单

### 4. 管理后台模块

**文件位置**: `src/pages/Admin`

**功能**:
- 数据统计展示
- 用户管理
- 车次管理
- 系统配置

## 开发规范

### 1. 代码风格

- 使用 ES6+ 语法
- 使用函数式组件和 Hooks
- 使用 Arrow Function
- 保持组件单一职责
- 合理拆分组件

### 2. 命名规范

- 组件: PascalCase (如 `UserProfile`)
- 文件: camelCase.jsx (如 `userProfile.jsx`)
- 常量: UPPER_SNAKE_CASE (如 `API_BASE_URL`)
- 函数: camelCase (如 `getUserInfo`)

### 3. 组件开发

```jsx
// 推荐的组件结构
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import './style.css'

function ComponentName({ prop1, prop2 }) {
  // 1. Hooks
  const [state, setState] = useState()
  const dispatch = useDispatch()
  const data = useSelector(state => state.data)

  // 2. Effects
  useEffect(() => {
    // side effects
  }, [])

  // 3. 事件处理函数
  const handleClick = () => {
    // handle logic
  }

  // 4. 渲染
  return (
    <div>
      {/* JSX */}
    </div>
  )
}

export default ComponentName
```

### 4. Redux 使用

```javascript
// 使用 Redux Toolkit 的 createSlice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// 异步操作
export const fetchData = createAsyncThunk(
  'feature/fetchData',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.getData(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Slice
const featureSlice = createSlice({
  name: 'feature',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {
    // 同步 actions
  },
  extraReducers: (builder) => {
    // 异步 actions 处理
    builder
      .addCase(fetchData.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})
```

### 5. API 请求

```javascript
// 使用封装的 request 工具
import request from '../utils/request'

export const getData = (params) => {
  return request({
    url: '/api/data',
    method: 'get',
    params,
  })
}

export const postData = (data) => {
  return request({
    url: '/api/data',
    method: 'post',
    data,
  })
}
```

## 环境配置

### 开发环境

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080/api
```

### 生产环境

```bash
# .env.production
VITE_API_BASE_URL=https://api.example.com
```

## 构建部署

### 本地开发

```bash
npm run dev
```

### 生产构建

```bash
npm run build
```

构建产物在 `dist/` 目录。

### 部署

可以部署到以下平台:
- Nginx
- Apache
- Vercel
- Netlify
- GitHub Pages

## 性能优化

### 1. 代码分割

- 使用 React.lazy 和 Suspense 实现路由懒加载
- 动态导入大型库

### 2. 打包优化

- Vite 自动进行代码分割
- Tree Shaking 移除未使用代码
- 压缩 CSS 和 JS

### 3. 运行时优化

- 使用 React.memo 避免不必要的重渲染
- 使用 useMemo 和 useCallback 缓存计算结果
- 虚拟列表处理大数据量

## 常见问题

### 1. 跨域问题

在 `vite.config.js` 中配置代理:

```javascript
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
}
```

### 2. 样式问题

- 使用 CSS Modules 避免样式冲突
- 遵循 BEM 命名规范
- 使用 Ant Design 的主题定制

### 3. 状态管理

- 全局状态使用 Redux
- 组件内部状态使用 useState
- URL 状态使用 React Router

## 更新日志

### v1.0.0 (2024-11-19)

**功能**:
- ✅ 完成用户认证模块
- ✅ 完成车票搜索模块
- ✅ 完成订单管理模块
- ✅ 完成管理后台基础功能
- ✅ 实现路由保护
- ✅ 实现错误边界
- ✅ 响应式设计

**技术栈**:
- React 18.3.1
- Vite 5.4.10
- Ant Design 5.21.6
- Redux Toolkit 2.2.8
