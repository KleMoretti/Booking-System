package com.booking.service.impl;

import com.booking.entity.Seat;
import com.booking.mapper.SeatMapper;
import com.booking.service.SeatService;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

@Service
public class SeatServiceImpl implements SeatService {

    @Resource
    private SeatMapper seatMapper;

    @Override
    public List<Seat> listSeatsByTrip(Integer tripId) {
        return seatMapper.findByTripId(tripId);
    }

    @Override
    public List<Seat> listAvailableSeats(Integer tripId) {
        return seatMapper.findAvailableByTripId(tripId);
    }
}

