package com.booking.service.impl;

import com.booking.entity.InvoiceTitle;
import com.booking.mapper.InvoiceTitleMapper;
import com.booking.service.InvoiceTitleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.List;

@Service
public class InvoiceTitleServiceImpl implements InvoiceTitleService {

    @Resource
    private InvoiceTitleMapper invoiceTitleMapper;

    @Override
    public List<InvoiceTitle> listTitles(Integer userId) {
        return invoiceTitleMapper.findByUserId(userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public InvoiceTitle createTitle(Integer userId, InvoiceTitle title) {
        title.setTitleId(null);
        title.setUserId(userId);
        if (title.getIsDefault() != null && title.getIsDefault() == 1) {
            invoiceTitleMapper.clearDefaultByUserId(userId);
        } else if (title.getIsDefault() == null) {
            title.setIsDefault((byte) 0);
        }
        invoiceTitleMapper.insert(title);
        return invoiceTitleMapper.findById(title.getTitleId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public InvoiceTitle updateTitle(Integer userId, Integer titleId, InvoiceTitle title) {
        title.setTitleId(titleId);
        title.setUserId(userId);
        if (title.getIsDefault() != null && title.getIsDefault() == 1) {
            invoiceTitleMapper.clearDefaultByUserId(userId);
        }
        invoiceTitleMapper.update(title);
        return invoiceTitleMapper.findById(titleId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteTitle(Integer userId, Integer titleId) {
        invoiceTitleMapper.deleteLogical(titleId, userId);
    }

    @Override
    public InvoiceTitle getDefaultTitle(Integer userId) {
        return invoiceTitleMapper.findDefaultByUserId(userId);
    }
}
