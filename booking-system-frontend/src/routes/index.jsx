// 路由配置
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import OrderList from '../pages/OrderList'
import TicketList from '../pages/TicketList'
import Admin from '../pages/Admin'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/orders" element={<OrderList />} />
      <Route path="/tickets" element={<TicketList />} />
      <Route path="/admin" element={<Admin />} />
      {/* 未匹配路由重定向到首页 */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default AppRoutes
