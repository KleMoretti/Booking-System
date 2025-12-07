// 加载中组件
import React from 'react'
import { Spin } from 'antd'
import './style.css'

function Loading({ tip = '加载中...' }) {
  return (
    <div className="app-loading">
      <Spin size="large" tip={tip} />
    </div>
  )
}

export default React.memo(Loading)
