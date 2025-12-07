// 防抖 Hook
import { useState, useEffect } from 'react'

/**
 * 防抖 Hook
 * @param {any} value - 需要防抖的值
 * @param {number} delay - 延迟时间(ms)
 * @returns {any} 防抖后的值
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * 防抖回调 Hook
 * @param {Function} callback - 回调函数
 * @param {number} delay - 延迟时间(ms)
 * @param {Array} deps - 依赖数组
 * @returns {Function} 防抖后的回调函数
 */
export const useDebouncedCallback = (callback, delay = 500, deps = []) => {
  const [timer, setTimer] = useState(null)

  return (...args) => {
    if (timer) {
      clearTimeout(timer)
    }

    const newTimer = setTimeout(() => {
      callback(...args)
    }, delay)

    setTimer(newTimer)
  }
}
