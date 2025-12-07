// React Profiler 性能分析工具
import React from 'react'

export const onRenderCallback = (
  id, // 发生提交的 Profiler 树的 "id"
  phase, // "mount" （如果组件树刚加载） 或者 "update" （如果它重新渲染了）之一
  actualDuration, // 本次更新在渲染 Profiler 和它的子代上花费的时间
  baseDuration, // 在没有 memoization 的情况下完成子树渲染所需的时间
  startTime, // 本次更新中 React 开始渲染的时间
  commitTime, // 本次更新中 React committed 的时间
  interactions // 属于本次更新的 interactions 的集合
) => {
  // 只在开发环境下记录性能数据
  if (process.env.NODE_ENV === 'development') {
    const performanceData = {
      componentId: id,
      phase,
      actualDuration: `${actualDuration.toFixed(2)}ms`,
      baseDuration: `${baseDuration.toFixed(2)}ms`,
      startTime,
      commitTime,
      renderTime: `${(commitTime - startTime).toFixed(2)}ms`,
    }

    // 标记渲染时间过长的组件
    if (actualDuration > 16) {
      console.warn(`⚠️ 组件 "${id}" 渲染耗时过长:`, performanceData)
    } else if (actualDuration > 5) {
      console.log(`📊 组件 "${id}" 性能数据:`, performanceData)
    }

    // 可以将数据发送到分析服务器
    // sendToAnalytics(performanceData)
  }
}

// 性能监控开关
export const enableProfiler = process.env.NODE_ENV === 'development'

// 包装组件以添加性能监控
export const withProfiler = (Component, id) => {
  if (!enableProfiler) return Component

  return (props) => (
    <React.Profiler id={id} onRender={onRenderCallback}>
      <Component {...props} />
    </React.Profiler>
  )
}

// 性能优化建议
export const performanceRecommendations = {
  checkRenderFrequency: (componentName, renderCount, timeWindow = 1000) => {
    // 检查组件渲染频率
    if (renderCount > 10) {
      console.warn(`⚠️ 组件 "${componentName}" 在 ${timeWindow}ms 内渲染了 ${renderCount} 次，考虑优化`)
    }
  },

  checkPropChanges: (componentName, prevProps, nextProps) => {
    // 检查哪些 props 导致了重新渲染
    const changedProps = Object.keys(nextProps).filter(
      key => prevProps[key] !== nextProps[key]
    )
    if (changedProps.length > 0) {
      console.log(`📝 组件 "${componentName}" 因以下 props 变化而重新渲染:`, changedProps)
    }
  },

  measureAsyncOperations: async (operationName, asyncFn) => {
    // 测量异步操作的执行时间
    const startTime = performance.now()
    try {
      const result = await asyncFn()
      const endTime = performance.now()
      const duration = endTime - startTime
      
      if (duration > 1000) {
        console.warn(`⚠️ 异步操作 "${operationName}" 耗时 ${duration.toFixed(2)}ms`)
      }
      
      return result
    } catch (error) {
      const endTime = performance.now()
      console.error(`❌ 异步操作 "${operationName}" 失败，耗时 ${(endTime - startTime).toFixed(2)}ms`, error)
      throw error
    }
  }
}

export default {
  onRenderCallback,
  enableProfiler,
  withProfiler,
  performanceRecommendations
}
