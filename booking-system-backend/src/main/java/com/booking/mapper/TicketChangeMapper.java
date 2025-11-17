package com.booking.mapper;

import com.booking.entity.TicketChange;
import java.util.List;

/**
 * 票务变更记录Mapper接口
 */
public interface TicketChangeMapper {
    int insert(TicketChange record);
    int update(TicketChange record);
    TicketChange findById(Long changeId);
    List<TicketChange> findByOrderId(Long orderId);
}

