package com.booking.service;

import com.booking.entity.Trip;

import java.time.LocalDateTime;
import java.util.List;

public interface TripService {
    List<Trip> searchTrips(Integer departureStationId, Integer arrivalStationId, LocalDateTime departureFrom, LocalDateTime departureTo);
    Trip getById(Integer tripId);
    List<Trip> getAllTrips();
    void addTrip(Trip trip);
    void updateTrip(Trip trip);
}

