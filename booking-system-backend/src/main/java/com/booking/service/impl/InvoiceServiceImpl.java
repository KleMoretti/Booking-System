package com.booking.service.impl;

import com.booking.entity.Invoice;
import com.booking.entity.Order;
import com.booking.mapper.InvoiceMapper;
import com.booking.mapper.OrderMapper;
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
}
