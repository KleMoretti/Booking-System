// 页面头部标题组件
import { Typography, Breadcrumb } from 'antd'
import { HomeOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import './style.css'

const { Title } = Typography

function PageHeader({ title, subtitle, breadcrumb = [] }) {
  const breadcrumbItems = [
    {
      title: (
        <Link to="/home">
          <HomeOutlined />
        </Link>
      ),
    },
    ...breadcrumb.map((item) => ({
      title: item.link ? <Link to={item.link}>{item.title}</Link> : item.title,
    })),
  ]

  return (
    <div className="page-header-component">
      {breadcrumb.length > 0 && (
        <Breadcrumb items={breadcrumbItems} className="page-breadcrumb" />
      )}
      <div className="page-header-content">
        <Title level={2} className="page-header-title">
          {title}
        </Title>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>
    </div>
  )
}

export default PageHeader
