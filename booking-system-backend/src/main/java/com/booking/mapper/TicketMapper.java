package com.booking.mapper;

import com.booking.entity.Ticket;
import java.util.List;

/**
 * 车票Mapper接口
 */
public interface TicketMapper {
    int insert(Ticket ticket);
    int update(Ticket ticket);
    Ticket findById(Long ticketId);
    List<Ticket> findByOrderId(Long orderId);
    List<Ticket> findByTripId(Integer tripId);
}
