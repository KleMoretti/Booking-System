package com.booking.service;

import com.booking.entity.Invoice;

import java.util.List;
import java.util.Map;

public interface InvoiceService {

    List<Map<String, Object>> listInvoices(Integer userId);

    void applyInvoice(Integer userId,
                      String orderNumber,
                      Byte invoiceType,
                      String invoiceTitle,
                      String taxNumber,
                      String email,
                      String note);

    Invoice getById(Long invoiceId);
}
