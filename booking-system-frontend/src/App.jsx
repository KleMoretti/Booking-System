import React, { useEffect, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Provider, useSelector, useDispatch } from 'react-redux'
import { Layout } from 'antd'
import store from './store'
import AppRoutes from './routes'
import Header from './components/Header'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import CompleteProfileModal from './components/CompleteProfileModal'
import { getUserProfile } from './store/slices/userSlice'
import { isAuthenticated as checkAuth } from './utils/auth'
import { onRenderCallback, enableProfiler } from './utils/profiler'

const { Content } = Layout

// 内部组件，用于检查用户信息
function AppContent() {
  const dispatch = useDispatch()
  const { userInfo, isAuthenticated } = useSelector((state) => state.user)
  const [showCompleteModal, setShowCompleteModal] = useState(false)

  // App 启动时，如果有 token 则获取用户信息
  useEffect(() => {
    const hasToken = checkAuth()
    if (hasToken && !userInfo) {
      // 有 token 但没有用户信息，尝试获取
      dispatch(getUserProfile()).catch(() => {
        // 获取失败，可能 token 已过期
        console.log('获取用户信息失败，token 可能已过期')
      })
    }
  }, [dispatch, userInfo])

  useEffect(() => {
    // 当用户登录且信息不完整时，显示弹窗
    if (isAuthenticated && userInfo) {
      // 注意：后端返回的字段是 idCardNo，不是 idCard
      const isProfileIncomplete = !userInfo.realName || !userInfo.idCardNo
      setShowCompleteModal(isProfileIncomplete)
    } else {
      setShowCompleteModal(false)
    }
  }, [isAuthenticated, userInfo])

  const handleCompleteProfile = () => {
    setShowCompleteModal(false)
  }

  return (
    <>
      <Layout className="app-root-layout">
        <Header />
        <Content className="app-content-wrapper">
          {enableProfiler ? (
            <React.Profiler id="app-routes" onRender={onRenderCallback}>
              <AppRoutes />
            </React.Profiler>
          ) : (
            <AppRoutes />
          )}
        </Content>
        <Footer />
      </Layout>
      
      {/* 完善个人信息弹窗 */}
      <CompleteProfileModal 
        visible={showCompleteModal} 
        onComplete={handleCompleteProfile}
      />
    </>
  )
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </BrowserRouter>
    </Provider>
  )
}

export default App
