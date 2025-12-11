// 路由配置
import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from '../components/PrivateRoute'
import Loading from '../components/Loading'

// 使用React.lazy进行代码分割
const Home = lazy(() => import('../pages/Home'))
const Login = lazy(() => import('../pages/Login'))
const Register = lazy(() => import('../pages/Register'))
const OrderList = lazy(() => import('../pages/OrderList'))
const TicketList = lazy(() => import('../pages/TicketList'))
const Admin = lazy(() => import('../pages/Admin'))

// 懒加载包装组件
const LazyLoad = ({ children }) => (
  <Suspense fallback={<Loading tip="加载中..." />}>
    {children}
  </Suspense>
)

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route 
        path="/home" 
        element={
          <LazyLoad>
            <Home />
          </LazyLoad>
        } 
      />
      <Route 
        path="/login" 
        element={
          <LazyLoad>
            <Login />
          </LazyLoad>
        } 
      />
      <Route 
        path="/register" 
        element={
          <LazyLoad>
            <Register />
          </LazyLoad>
        } 
      />
      {/* 需要登录的路由 */}
      <Route
        path="/orders"
        element={
          <PrivateRoute>
            <LazyLoad>
              <OrderList />
            </LazyLoad>
          </PrivateRoute>
        }
      />
      <Route
        path="/tickets"
        element={
          <PrivateRoute>
            <LazyLoad>
              <TicketList />
            </LazyLoad>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <LazyLoad>
              <Admin />
            </LazyLoad>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <LazyLoad>
              <Profile />
            </LazyLoad>
          </PrivateRoute>
        }
      />
      {/* 未匹配路由重定向到首页 */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default AppRoutes
