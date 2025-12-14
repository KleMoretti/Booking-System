// 搜索历史管理 Hook
import { useState, useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'

const SEARCH_HISTORY_KEY_PREFIX = 'booking_search_history_'
const MAX_HISTORY_COUNT = 3

export const useSearchHistory = () => {
  const [history, setHistory] = useState([])
  const { userInfo } = useSelector((state) => state.user)
  
  // 获取用户专属的存储key
  const getStorageKey = useCallback(() => {
    const userId = userInfo?.userId || userInfo?.id || 'guest'
    return `${SEARCH_HISTORY_KEY_PREFIX}${userId}`
  }, [userInfo])

  // 从 localStorage 加载历史记录
  useEffect(() => {
    try {
      const key = getStorageKey()
      const saved = localStorage.getItem(key)
      if (saved) {
        setHistory(JSON.parse(saved))
      } else {
        setHistory([])
      }
    } catch (error) {
      console.error('加载搜索历史失败：', error)
    }
  }, [getStorageKey])

  // 保存到 localStorage
  const saveToStorage = useCallback((newHistory) => {
    try {
      const key = getStorageKey()
      localStorage.setItem(key, JSON.stringify(newHistory))
    } catch (error) {
      console.error('保存搜索历史失败：', error)
    }
  }, [getStorageKey])

  // 添加搜索记录
  const addHistory = useCallback((searchItem) => {
    setHistory((prev) => {
      // 检查是否已存在相同的搜索
      const exists = prev.some(
        (item) =>
          item.fromStationId === searchItem.fromStationId &&
          item.toStationId === searchItem.toStationId &&
          item.departureDate === searchItem.departureDate
      )

      if (exists) {
        return prev
      }

      // 添加时间戳
      const newItem = {
        ...searchItem,
        timestamp: Date.now(),
      }

      // 保持最多 MAX_HISTORY_COUNT 条记录
      const newHistory = [newItem, ...prev].slice(0, MAX_HISTORY_COUNT)
      saveToStorage(newHistory)
      return newHistory
    })
  }, [saveToStorage])

  // 删除指定历史记录
  const removeHistory = useCallback((index) => {
    setHistory((prev) => {
      const newHistory = prev.filter((_, i) => i !== index)
      saveToStorage(newHistory)
      return newHistory
    })
  }, [saveToStorage])

  // 清空所有历史记录
  const clearHistory = useCallback(() => {
    setHistory([])
    const key = getStorageKey()
    localStorage.removeItem(key)
  }, [getStorageKey])

  return {
    history,
    addHistory,
    removeHistory,
    clearHistory,
  }
}
