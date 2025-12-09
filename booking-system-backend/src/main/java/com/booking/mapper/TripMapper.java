package com.booking.mapper;

import com.booking.dto.TripVO;
import com.booking.entity.Trip;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 班次Mapper接口
 */
@Mapper
public interface TripMapper {
    int insert(Trip trip);
    int update(Trip trip);
    Trip findById(@Param("tripId") Integer tripId);
    List<TripVO> searchTrips(@Param("departureStationId") Integer departureStationId, 
                             @Param("arrivalStationId") Integer arrivalStationId, 
                             @Param("departureTimeFrom") LocalDateTime departureTimeFrom, 
                             @Param("departureTimeTo") LocalDateTime departureTimeTo);
}

