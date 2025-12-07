// 私有路由组件 - 需要登录才能访问
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { isAuthenticated } from '../../utils/auth'

function PrivateRoute({ children }) {
  const location = useLocation()
  const { isAuthenticated: isAuth } = useSelector((state) => state.user)
  
  // 检查是否已登录
  const hasAuth = isAuth || isAuthenticated()
  
  if (!hasAuth) {
    // 未登录则重定向到登录页，并记录当前位置
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  
  return children
}

export default PrivateRoute
