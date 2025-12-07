// 错误边界组件
import React from 'react'
import { Result, Button } from 'antd'
import './style.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/home'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <Result
            status="500"
            title="出错了"
            subTitle="抱歉，页面出现了错误"
            extra={
              <Button type="primary" onClick={this.handleReset}>
                返回首页
              </Button>
            }
          />
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
