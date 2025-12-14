// 管理员路由组件 - 仅管理员可访问
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { message } from 'antd'
import { useEffect, useState } from 'react'

function AdminRoute({ children }) {
  const { userInfo, isAuthenticated } = useSelector((state) => state.user)
  const [hasShownError, setHasShownError] = useState(false)
  
  // 检查是否为管理员（userType: 1 = 管理员）
  const isAdmin = userInfo?.userType === 1
  
  useEffect(() => {
    if (isAuthenticated && !isAdmin && !hasShownError) {
      message.error('权限不足，仅管理员可访问')
      setHasShownError(true)
    }
  }, [isAuthenticated, isAdmin, hasShownError])
  
  if (!isAuthenticated) {
    // 未登录则重定向到登录页
    return <Navigate to="/login" replace />
  }
  
  if (!isAdmin) {
    // 非管理员重定向到首页
    return <Navigate to="/home" replace />
  }
  
  return children
}

export default AdminRoute
