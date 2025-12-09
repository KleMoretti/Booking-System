package com.booking.mapper;

import com.booking.entity.TicketChange;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

/**
 * 票务变更记录Mapper接口
 */
@Mapper
public interface TicketChangeMapper {
    int insert(TicketChange record);
    int update(TicketChange record);
    TicketChange findById(@Param("changeId") Long changeId);
    List<TicketChange> findByOrderId(@Param("orderId") Long orderId);
}

