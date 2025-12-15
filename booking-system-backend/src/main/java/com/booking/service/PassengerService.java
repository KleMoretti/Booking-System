package com.booking.service;

import com.booking.entity.Passenger;

import java.util.List;

/**
 * 常用联系人服务
 */
public interface PassengerService {

    List<Passenger> listPassengers(Integer userId);

    Passenger createPassenger(Integer userId, Passenger passenger);

    Passenger updatePassenger(Integer userId, Integer passengerId, Passenger passenger);

    void deletePassenger(Integer userId, Integer passengerId);

    Passenger getDefaultPassenger(Integer userId);
}
