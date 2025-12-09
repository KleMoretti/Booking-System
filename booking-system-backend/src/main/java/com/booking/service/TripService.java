package com.booking.service;

import com.booking.dto.TripVO;
import com.booking.entity.Trip;

import java.time.LocalDateTime;
import java.util.List;

public interface TripService {
    List<TripVO> searchTrips(Integer departureStationId, Integer arrivalStationId, LocalDateTime departureTimeFrom, LocalDateTime departureTimeTo);
    Trip getById(Integer tripId);
    List<TripVO> getAllTrips();
    void addTrip(Trip trip);
    void updateTrip(Trip trip);
}

