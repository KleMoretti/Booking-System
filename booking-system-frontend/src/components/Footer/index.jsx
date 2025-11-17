// 页面底部组件
import { Layout } from 'antd'
import './style.css'

const { Footer: AntFooter } = Layout

function Footer() {
  const year = new Date().getFullYear()

  return (
    <AntFooter className="app-footer">
      <div className="app-footer-main">
        <span>© {year} 火车票预订系统</span>
        <span className="footer-divider">|</span>
        <span>课程设计示例项目</span>
      </div>
    </AntFooter>
  )
}

export default Footer
