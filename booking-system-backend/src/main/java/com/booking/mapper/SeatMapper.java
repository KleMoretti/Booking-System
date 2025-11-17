package com.booking.mapper;

import com.booking.entity.Seat;
import java.util.List;

/**
 * 座位Mapper接口
 */
public interface SeatMapper {
    int insert(Seat seat);
    int update(Seat seat);
    Seat findById(Integer seatId);
    List<Seat> findByTripId(Integer tripId);
    List<Seat> findAvailableByTripId(Integer tripId);
}
