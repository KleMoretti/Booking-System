package com.booking.mapper;

import com.booking.entity.Passenger;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 常用联系人Mapper
 */
@Mapper
public interface PassengerMapper {
    int insert(Passenger passenger);

    int update(Passenger passenger);

    Passenger findById(@Param("passengerId") Integer passengerId);

    List<Passenger> findByUserId(@Param("userId") Integer userId);

    Passenger findDefaultByUserId(@Param("userId") Integer userId);

    int deleteLogical(@Param("passengerId") Integer passengerId, @Param("userId") Integer userId);

    int clearDefaultByUserId(@Param("userId") Integer userId);
}
