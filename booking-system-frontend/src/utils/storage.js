// 本地存储工具类
export const storage = {
  get(key) {
    const value = localStorage.getItem(key)
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  },
  
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  },
  
  remove(key) {
    localStorage.removeItem(key)
  },
  
  clear() {
    localStorage.clear()
  }
}

