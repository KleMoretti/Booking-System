// 常用乘客管理 Hook
import { useState, useCallback, useEffect } from 'react'

const PASSENGERS_KEY = 'booking_passengers'
const MAX_PASSENGERS_COUNT = 10

export const usePassengers = () => {
  const [passengers, setPassengers] = useState([])

  // 从 localStorage 加载常用乘客
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PASSENGERS_KEY)
      if (saved) {
        setPassengers(JSON.parse(saved))
      }
    } catch (error) {
      console.error('加载常用乘客失败：', error)
    }
  }, [])

  // 保存到 localStorage
  const saveToStorage = useCallback((newPassengers) => {
    try {
      localStorage.setItem(PASSENGERS_KEY, JSON.stringify(newPassengers))
    } catch (error) {
      console.error('保存常用乘客失败：', error)
    }
  }, [])

  // 添加乘客
  const addPassenger = useCallback((passenger) => {
    setPassengers((prev) => {
      // 检查是否已存在相同身份证号的乘客
      const exists = prev.some((p) => p.idCard === passenger.idCard)
      
      if (exists) {
        // 更新现有乘客
        const newPassengers = prev.map((p) =>
          p.idCard === passenger.idCard ? { ...p, ...passenger } : p
        )
        saveToStorage(newPassengers)
        return newPassengers
      }

      // 添加新乘客，保持最多 MAX_PASSENGERS_COUNT 个
      const newPassenger = {
        ...passenger,
        id: Date.now().toString(),
        createTime: Date.now(),
      }
      const newPassengers = [newPassenger, ...prev].slice(0, MAX_PASSENGERS_COUNT)
      saveToStorage(newPassengers)
      return newPassengers
    })
  }, [saveToStorage])

  // 删除乘客
  const removePassenger = useCallback((id) => {
    setPassengers((prev) => {
      const newPassengers = prev.filter((p) => p.id !== id)
      saveToStorage(newPassengers)
      return newPassengers
    })
  }, [saveToStorage])

  // 更新乘客信息
  const updatePassenger = useCallback((id, updatedInfo) => {
    setPassengers((prev) => {
      const newPassengers = prev.map((p) =>
        p.id === id ? { ...p, ...updatedInfo } : p
      )
      saveToStorage(newPassengers)
      return newPassengers
    })
  }, [saveToStorage])

  // 清空所有乘客
  const clearPassengers = useCallback(() => {
    setPassengers([])
    localStorage.removeItem(PASSENGERS_KEY)
  }, [])

  return {
    passengers,
    addPassenger,
    removePassenger,
    updatePassenger,
    clearPassengers,
  }
}
