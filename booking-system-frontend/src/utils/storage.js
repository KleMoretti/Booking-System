// 本地存储工具

/**
 * 获取localStorage中的数据
 */
export const getStorage = (key) => {
  try {
    return localStorage.getItem(key)
  } catch (error) {
    console.error('读取localStorage失败：', error)
    return null
  }
}

/**
 * 设置localStorage中的数据
 */
export const setStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('写入localStorage失败：', error)
  }
}

/**
 * 移除localStorage中的数据
 */
export const removeStorage = (key) => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('删除localStorage失败：', error)
  }
}

/**
 * 清空localStorage
 */
export const clearStorage = () => {
  try {
    localStorage.clear()
  } catch (error) {
    console.error('清空localStorage失败：', error)
  }
}
