// 发票相关API
import request from '../utils/request'

/**
 * 获取发票列表
 */
export const getInvoiceList = () => {
  return request.get('/invoices')
}

/**
 * 申请发票
 */
export const applyInvoice = (data) => {
  return request.post('/invoices/apply', data)
}

/**
 * 开具发票
 */
export const issueInvoice = (invoiceId) => {
  return request.post(`/invoices/${invoiceId}/issue`)
}

/**
 * 删除发票
 */
export const deleteInvoice = (invoiceId) => {
  return request.delete(`/invoices/${invoiceId}`)
}

/**
 * 下载发票
 */
export const downloadInvoice = (invoiceId) => {
  return request.get(`/invoices/${invoiceId}/download`, { responseType: 'blob' })
}

/**
 * 获取发票抬头列表
 */
export const getInvoiceTitleList = () => {
  return request.get('/invoice-titles')
}

/**
 * 创建发票抬头
 */
export const createInvoiceTitle = (data) => {
  return request.post('/invoice-titles', data)
}

/**
 * 更新发票抬头
 */
export const updateInvoiceTitle = (titleId, data) => {
  return request.put(`/invoice-titles/${titleId}`, data)
}

/**
 * 删除发票抬头
 */
export const deleteInvoiceTitle = (titleId) => {
  return request.delete(`/invoice-titles/${titleId}`)
}

/**
 * 获取默认发票抬头
 */
export const getDefaultInvoiceTitle = () => {
  return request.get('/invoice-titles/default')
}
