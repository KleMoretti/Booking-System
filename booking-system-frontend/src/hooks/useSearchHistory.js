// 搜索历史管理 Hook
import { useState, useCallback, useEffect } from 'react'

const SEARCH_HISTORY_KEY = 'booking_search_history'
const MAX_HISTORY_COUNT = 4

export const useSearchHistory = () => {
  const [history, setHistory] = useState([])

  // 从 localStorage 加载历史记录
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SEARCH_HISTORY_KEY)
      if (saved) {
        setHistory(JSON.parse(saved))
      }
    } catch (error) {
      console.error('加载搜索历史失败：', error)
    }
  }, [])

  // 保存到 localStorage
  const saveToStorage = useCallback((newHistory) => {
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory))
    } catch (error) {
      console.error('保存搜索历史失败：', error)
    }
  }, [])

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
    localStorage.removeItem(SEARCH_HISTORY_KEY)
  }, [])

  return {
    history,
    addHistory,
    removeHistory,
    clearHistory,
  }
}
