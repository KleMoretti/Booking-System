package com.booking.service;

import com.booking.dto.TripDTO;
import com.booking.dto.TripManagementVO;
import com.booking.dto.TripVO;
import com.booking.entity.Trip;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface TripService {
    // 用户端查询
    List<TripVO> searchTrips(Integer departureStationId, Integer arrivalStationId, LocalDateTime departureTimeFrom, LocalDateTime departureTimeTo);
    Trip getById(Integer tripId);
    List<TripVO> getAllTrips();
    
    // 管理端车次管理
    List<TripManagementVO> getTripList(String tripNumber, String departureDate, String departureStation, String arrivalStation, String sortBy, String sortOrder, Integer offset, Integer pageSize);
    Long countTrips(String tripNumber, String departureDate, String departureStation, String arrivalStation);
    void addTrip(TripDTO tripDTO);
    void updateTrip(Integer tripId, TripDTO tripDTO);
    void deleteTrip(Integer tripId);
    void updateTripPrice(Integer tripId, BigDecimal newPrice);
}

