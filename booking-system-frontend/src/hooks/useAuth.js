// 自定义认证 Hook
import { useSelector } from 'react-redux'
import { isAuthenticated as checkAuth } from '../utils/auth'
import { USER_TYPE } from '../utils/constants'

export const useAuth = () => {
  const { userInfo, isAuthenticated, loading } = useSelector((state) => state.user)
  
  return {
    userInfo,
    isAuthenticated: isAuthenticated || checkAuth(),
    loading,
    isAdmin: userInfo?.userType === USER_TYPE.ADMIN,
  }
}
