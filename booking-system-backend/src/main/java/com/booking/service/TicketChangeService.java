package com.booking.service;

import com.booking.entity.TicketChange;

public interface TicketChangeService {
    /**
     * 提交退票/改签申请
     */
    TicketChange submitChange(TicketChange change);

    /**
     * 处理退票/改签（更新状态、退款、改签座位等）
     */
    void processChange(Long changeId, boolean approved);
}

