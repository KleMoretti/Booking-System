package com.booking.service;

import com.booking.entity.Seat;

import java.util.List;

public interface SeatService {
    List<Seat> listSeatsByTrip(Integer tripId);
    List<Seat> listAvailableSeats(Integer tripId);
}

