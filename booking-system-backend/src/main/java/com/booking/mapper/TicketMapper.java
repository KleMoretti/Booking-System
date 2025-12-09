package com.booking.mapper;

import com.booking.entity.Ticket;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

/**
 * 车票Mapper接口
 */
@Mapper
public interface TicketMapper {
    int insert(Ticket ticket);
    int update(Ticket ticket);
    Ticket findById(@Param("ticketId") Long ticketId);
    List<Ticket> findByOrderId(@Param("orderId") Long orderId);
    List<Ticket> findByTripId(@Param("tripId") Integer tripId);
}
