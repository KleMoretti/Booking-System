import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Layout } from 'antd'
import store from './store'
import AppRoutes from './routes'
import Header from './components/Header'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import { onRenderCallback, enableProfiler } from './utils/profiler'

const { Content } = Layout

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ErrorBoundary>
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
        </ErrorBoundary>
      </BrowserRouter>
    </Provider>
  )
}

export default App
