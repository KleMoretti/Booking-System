package com.booking.mapper;

import com.booking.entity.Seat;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

/**
 * 座位Mapper接口
 */
@Mapper
public interface SeatMapper {
    int insert(Seat seat);
    int update(Seat seat);
    Seat findById(@Param("seatId") Integer seatId);
    List<Seat> findByTripId(@Param("tripId") Integer tripId);
    List<Seat> findAvailableByTripId(@Param("tripId") Integer tripId);
}
