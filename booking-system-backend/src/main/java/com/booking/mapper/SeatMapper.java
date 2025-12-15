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
    
    /**
     * 根据车次ID删除所有座位
     */
    int deleteByTripId(@Param("tripId") Integer tripId);
    
    /**
     * 释放过期的锁定座位
     * 将状态为1（锁定）且 lock_expire_time 已过期的座位状态改为0（可用）
     */
    int releaseExpiredLockedSeats();
}
