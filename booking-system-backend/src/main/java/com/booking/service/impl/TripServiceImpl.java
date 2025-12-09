package com.booking.service.impl;

import com.booking.entity.Trip;
import com.booking.mapper.TripMapper;
import com.booking.service.TripService;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TripServiceImpl implements TripService {

    @Resource
    private TripMapper tripMapper;

    @Override
    public List<Trip> searchTrips(Integer departureStationId, Integer arrivalStationId, LocalDateTime departureFrom, LocalDateTime departureTo) {
        return tripMapper.searchTrips(departureStationId, arrivalStationId, departureFrom, departureTo);
    }

    @Override
    public Trip getById(Integer tripId) {
        return tripMapper.findById(tripId);
    }

    @Override
    public List<Trip> getAllTrips() {
        return tripMapper.searchTrips(null, null, null, null);
    }

    @Override
    public void addTrip(Trip trip) {
        tripMapper.insert(trip);
    }

    @Override
    public void updateTrip(Trip trip) {
        tripMapper.update(trip);
    }
}

