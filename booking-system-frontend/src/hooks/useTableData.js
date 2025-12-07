// 表格数据加载 Hook
import { useState, useCallback, useEffect } from 'react'
import { PAGINATION } from '../utils/constants'

/**
 * 通用表格数据加载 Hook
 * @param {Function} fetchDataFn - 获取数据的异步函数
 * @param {Object} initialParams - 初始参数
 * @returns {Object} { data, loading, pagination, refresh, setParams }
 */
export const useTableData = (fetchDataFn, initialParams = {}) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: PAGINATION.DEFAULT_PAGE,
    pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
    total: 0,
  })
  const [params, setParams] = useState(initialParams)

  const fetchData = useCallback(async (page, pageSize, extraParams = {}) => {
    setLoading(true)
    try {
      const response = await fetchDataFn({
        page,
        pageSize,
        ...params,
        ...extraParams,
      })
      
      if (response.data) {
        setData(response.data.list || response.data)
        setPagination(prev => ({
          ...prev,
          current: page,
          pageSize,
          total: response.data.total || (response.data.list || response.data).length,
        }))
      }
    } catch (error) {
      console.error('获取数据失败：', error)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [fetchDataFn, params])

  const handleTableChange = useCallback((newPagination, filters, sorter) => {
    fetchData(newPagination.current, newPagination.pageSize)
  }, [fetchData])

  const refresh = useCallback(() => {
    fetchData(pagination.current, pagination.pageSize)
  }, [fetchData, pagination.current, pagination.pageSize])

  useEffect(() => {
    fetchData(PAGINATION.DEFAULT_PAGE, PAGINATION.DEFAULT_PAGE_SIZE)
  }, [fetchData])

  return {
    data,
    loading,
    pagination,
    handleTableChange,
    refresh,
    setParams,
  }
}
