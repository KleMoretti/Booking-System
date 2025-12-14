// 主题管理Context
import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

const THEME_KEY = 'app_theme'
const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // 从localStorage读取保存的主题
    const savedTheme = localStorage.getItem(THEME_KEY)
    return savedTheme || THEME.LIGHT
  })

  // 切换主题（使用View Transitions API实现平滑过渡）
  const toggleTheme = () => {
    // 检查浏览器是否支持View Transitions API
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setTheme(prevTheme => {
          const newTheme = prevTheme === THEME.LIGHT ? THEME.DARK : THEME.LIGHT
          return newTheme
        })
      })
    } else {
      // 降级方案
      setTheme(prevTheme => {
        const newTheme = prevTheme === THEME.LIGHT ? THEME.DARK : THEME.LIGHT
        return newTheme
      })
    }
  }

  // 设置指定主题
  const setLightTheme = () => setTheme(THEME.LIGHT)
  const setDarkTheme = () => setTheme(THEME.DARK)

  // 保存主题到localStorage并应用到document
  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme)
    document.documentElement.setAttribute('data-theme', theme)
    
    // 也添加到body上，方便某些组件使用
    document.body.setAttribute('data-theme', theme)
  }, [theme])

  const value = {
    theme,
    isDark: theme === THEME.DARK,
    isLight: theme === THEME.LIGHT,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// 自定义Hook
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export { THEME }
