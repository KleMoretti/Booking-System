package com.booking.service.impl;

import com.booking.entity.Passenger;
import com.booking.mapper.PassengerMapper;
import com.booking.service.PassengerService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.List;

/**
 * 常用联系人服务实现
 */
@Service
public class PassengerServiceImpl implements PassengerService {

    @Resource
    private PassengerMapper passengerMapper;

    @Override
    public List<Passenger> listPassengers(Integer userId) {
        return passengerMapper.findByUserId(userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Passenger createPassenger(Integer userId, Passenger passenger) {
        passenger.setPassengerId(null);
        passenger.setUserId(userId);
        if (passenger.getIsDefault() != null && passenger.getIsDefault().equals(1)) {
            passengerMapper.clearDefaultByUserId(userId);
        } else if (passenger.getIsDefault() == null) {
            passenger.setIsDefault(0);
        }
        passengerMapper.insert(passenger);
        return passengerMapper.findById(passenger.getPassengerId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Passenger updatePassenger(Integer userId, Integer passengerId, Passenger passenger) {
        passenger.setPassengerId(passengerId);
        passenger.setUserId(userId);
        if (passenger.getIsDefault() != null && passenger.getIsDefault().equals(1)) {
            passengerMapper.clearDefaultByUserId(userId);
        }
        passengerMapper.update(passenger);
        return passengerMapper.findById(passengerId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deletePassenger(Integer userId, Integer passengerId) {
        passengerMapper.deleteLogical(passengerId, userId);
    }

    @Override
    public Passenger getDefaultPassenger(Integer userId) {
        return passengerMapper.findDefaultByUserId(userId);
    }
}
