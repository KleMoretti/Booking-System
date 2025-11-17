package com.booking.mapper;

import com.booking.entity.Trip;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 班次Mapper接口
 */
public interface TripMapper {
    int insert(Trip trip);
    int update(Trip trip);
    Trip findById(Integer tripId);
    List<Trip> searchTrips(Integer departureStationId, Integer arrivalStationId, LocalDateTime departureTimeFrom, LocalDateTime departureTimeTo);
}

