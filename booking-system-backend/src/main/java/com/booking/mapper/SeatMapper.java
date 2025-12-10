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
    
    /**
     * 统计可用座位数量
     */
    int countAvailableSeats(@Param("tripId") Integer tripId);
    
    /**
     * 查找一个可用座位（用于自动分配）
     */
    Seat findAvailableSeat(@Param("tripId") Integer tripId);
}
