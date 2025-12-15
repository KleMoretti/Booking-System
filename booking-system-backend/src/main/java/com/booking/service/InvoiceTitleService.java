package com.booking.service;

import com.booking.entity.InvoiceTitle;

import java.util.List;

public interface InvoiceTitleService {

    List<InvoiceTitle> listTitles(Integer userId);

    InvoiceTitle createTitle(Integer userId, InvoiceTitle title);

    InvoiceTitle updateTitle(Integer userId, Integer titleId, InvoiceTitle title);

    void deleteTitle(Integer userId, Integer titleId);

    InvoiceTitle getDefaultTitle(Integer userId);
}
