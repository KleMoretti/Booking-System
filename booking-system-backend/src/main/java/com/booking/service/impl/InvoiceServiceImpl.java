package com.booking.service.impl;

import com.booking.entity.Invoice;
import com.booking.entity.Order;
import com.booking.entity.User;
import com.booking.mapper.InvoiceMapper;
import com.booking.mapper.OrderMapper;
import com.booking.mapper.UserMapper;
import com.booking.service.InvoiceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class InvoiceServiceImpl implements InvoiceService {

    @Resource
    private InvoiceMapper invoiceMapper;

    @Resource
    private OrderMapper orderMapper;

    @Resource
    private UserMapper userMapper;

    @Override
    public List<Map<String, Object>> listInvoices(Integer userId) {
        List<Invoice> invoices = invoiceMapper.findByUserId(userId);
        List<Map<String, Object>> result = new ArrayList<>();
        if (invoices == null || invoices.isEmpty()) {
            return result;
        }
        for (Invoice invoice : invoices) {
            Map<String, Object> map = new HashMap<>();
            map.put("invoiceId", invoice.getInvoiceId());
            if (invoice.getOrderId() != null) {
                Order order = orderMapper.findById(invoice.getOrderId());
                if (order != null) {
                    map.put("orderNumber", order.getOrderNumber());
                }
            }
            map.put("invoiceTitle", invoice.getInvoiceTitle());
            map.put("invoiceType", invoice.getInvoiceType());
            map.put("invoiceAmount", invoice.getInvoiceAmount());
            map.put("invoiceStatus", invoice.getInvoiceStatus());
            map.put("applyTime", invoice.getApplyTime());
            map.put("invoiceUrl", invoice.getInvoiceUrl());
            result.add(map);
        }
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void applyInvoice(Integer userId,
                             String orderNumber,
                             Byte invoiceType,
                             String invoiceTitle,
                             String taxNumber,
                             String email,
                             String note) {
        Order order = orderMapper.findByOrderNumber(orderNumber);
        if (order == null || !userId.equals(order.getUserId())) {
            throw new IllegalArgumentException("订单不存在或不属于当前用户");
        }
        BigDecimal amount = order.getPaidAmount();
        if (amount == null) {
            amount = order.getTotalAmount();
        }
        Invoice invoice = new Invoice();
        invoice.setUserId(userId);
        invoice.setOrderId(order.getOrderId());
        invoice.setInvoiceType(invoiceType);
        invoice.setInvoiceTitle(invoiceTitle);
        invoice.setTaxNumber(taxNumber);
        invoice.setInvoiceAmount(amount != null ? amount : BigDecimal.ZERO);
        invoice.setInvoiceStatus((byte) 0);
        invoice.setEmail(email);
        invoice.setApplyTime(LocalDateTime.now());
        invoice.setNote(note);
        invoiceMapper.insert(invoice);
    }

    @Override
    public Invoice getById(Long invoiceId) {
        return invoiceMapper.findById(invoiceId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteInvoice(Integer userId, Long invoiceId) {
        Invoice invoice = invoiceMapper.findById(invoiceId);
        if (invoice == null || !userId.equals(invoice.getUserId())) {
            throw new IllegalArgumentException("发票不存在或无权删除");
        }
        invoiceMapper.delete(invoiceId, userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void issueInvoice(Integer userId, Long invoiceId) {
        // 检查用户是否为管理员
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new IllegalArgumentException("用户不存在");
        }
        if (user.getUserType() == null || user.getUserType() != 1) {
            throw new IllegalArgumentException("无权操作：只有管理员可以开具发票");
        }
        
        // 检查发票是否存在
        Invoice invoice = invoiceMapper.findById(invoiceId);
        if (invoice == null) {
            throw new IllegalArgumentException("发票不存在");
        }
        if (invoice.getInvoiceStatus() != 0) {
            throw new IllegalArgumentException("发票已开具，无需重复操作");
        }
        
        // 生成发票号码
        String invoiceNumber = "INV" + System.currentTimeMillis();
        
        invoice.setInvoiceStatus((byte) 1);
        invoice.setInvoiceNumber(invoiceNumber);
        invoice.setIssueTime(LocalDateTime.now());
        invoiceMapper.update(invoice);
    }

    @Override
    public byte[] generateInvoicePdf(Long invoiceId) throws Exception {
        Invoice invoice = invoiceMapper.findById(invoiceId);
        if (invoice == null) {
            throw new IllegalArgumentException("发票不存在");
        }

        // 获取订单信息
        Order order = orderMapper.findById(invoice.getOrderId());
        if (order == null) {
            throw new IllegalArgumentException("关联订单不存在");
        }

        // 生成简单的PDF内容（这里使用纯文本模拟，实际项目中应使用iText或其他PDF库）
        StringBuilder pdfContent = new StringBuilder();
        pdfContent.append("=== 电子发票 ===").append("\n\n");
        pdfContent.append("发票号码: ").append(invoice.getInvoiceNumber() != null ? invoice.getInvoiceNumber() : "待生成").append("\n");
        pdfContent.append("发票类型: ").append(invoice.getInvoiceType() == 0 ? "电子普通发票" : "增值税专用发票").append("\n");
        pdfContent.append("发票抬头: ").append(invoice.getInvoiceTitle()).append("\n");
        if (invoice.getTaxNumber() != null && !invoice.getTaxNumber().isEmpty()) {
            pdfContent.append("纳税人识别号: ").append(invoice.getTaxNumber()).append("\n");
        }
        pdfContent.append("\n");
        pdfContent.append("订单号: ").append(order.getOrderNumber()).append("\n");
        pdfContent.append("金额: ¥").append(invoice.getInvoiceAmount()).append("\n");
        pdfContent.append("开票日期: ").append(invoice.getApplyTime()).append("\n");
        pdfContent.append("\n");
        pdfContent.append("接收邮箱: ").append(invoice.getEmail()).append("\n");
        if (invoice.getNote() != null && !invoice.getNote().isEmpty()) {
            pdfContent.append("备注: ").append(invoice.getNote()).append("\n");
        }
        pdfContent.append("\n");
        pdfContent.append("=== 此为电子发票 ===").append("\n");

        // 返回文本内容的字节数组（实际应该生成真实的PDF）
        return pdfContent.toString().getBytes("UTF-8");
    }
}
