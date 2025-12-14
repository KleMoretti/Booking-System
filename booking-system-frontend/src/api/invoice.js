// 发票相关API
import request from '../utils/request'

/**
 * 获取发票列表
 */
export const getInvoiceList = () => {
  return request.get('/api/invoices')
}

/**
 * 申请发票
 */
export const applyInvoice = (data) => {
  return request.post('/api/invoices/apply', data)
}

/**
 * 下载发票
 */
export const downloadInvoice = (invoiceId) => {
  return request.get(`/api/invoices/${invoiceId}/download`, { responseType: 'blob' })
}

/**
 * 获取发票抬头列表
 */
export const getInvoiceTitleList = () => {
  return request.get('/api/invoice-titles')
}

/**
 * 创建发票抬头
 */
export const createInvoiceTitle = (data) => {
  return request.post('/api/invoice-titles', data)
}

/**
 * 更新发票抬头
 */
export const updateInvoiceTitle = (titleId, data) => {
  return request.put(`/api/invoice-titles/${titleId}`, data)
}

/**
 * 删除发票抬头
 */
export const deleteInvoiceTitle = (titleId) => {
  return request.delete(`/api/invoice-titles/${titleId}`)
}

/**
 * 获取默认发票抬头
 */
export const getDefaultInvoiceTitle = () => {
  return request.get('/api/invoice-titles/default')
}
