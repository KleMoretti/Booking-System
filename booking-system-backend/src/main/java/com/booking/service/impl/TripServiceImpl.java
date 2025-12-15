package com.booking.service.impl;

import com.booking.dto.TripDTO;
import com.booking.dto.TripManagementVO;
import com.booking.dto.TripVO;
import com.booking.entity.Seat;
import com.booking.entity.Trip;
import com.booking.mapper.SeatMapper;
import com.booking.mapper.TripMapper;
import com.booking.service.TripService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
public class TripServiceImpl implements TripService {

    @Resource
    private TripMapper tripMapper;
    
    @Resource
    private SeatMapper seatMapper;

    @Override
    public List<TripVO> searchTrips(Integer departureStationId, Integer arrivalStationId, LocalDateTime departureTimeFrom, LocalDateTime departureTimeTo) {
        // 用户端查询时，发车时间已过的班次不再返回
        if (departureTimeFrom != null || departureTimeTo != null) {
            LocalDateTime now = LocalDateTime.now();
            // 如果查询区间完全早于当前时间，则直接返回空列表
            if (departureTimeTo != null && !departureTimeTo.isAfter(now)) {
                return Collections.emptyList();
            }
            // 如果开始时间早于当前时间，则从当前时间开始查询
            if (departureTimeFrom == null || departureTimeFrom.isBefore(now)) {
                departureTimeFrom = now;
            }
        }
        return tripMapper.searchTrips(departureStationId, arrivalStationId, departureTimeFrom, departureTimeTo);
    }

    @Override
    public Trip getById(Integer tripId) {
        return tripMapper.findById(tripId);
    }

    @Override
    public List<TripVO> getAllTrips() {
        return tripMapper.searchTrips(null, null, null, null);
    }

    @Override
    public List<TripManagementVO> getTripList(String tripNumber, String departureDate, String departureStation, String arrivalStation, String sortBy, String sortOrder, Integer offset, Integer pageSize) {
        return tripMapper.getTripList(tripNumber, departureDate, departureStation, arrivalStation, sortBy, sortOrder, offset, pageSize);
    }

    @Override
    public Long countTrips(String tripNumber, String departureDate, String departureStation, String arrivalStation) {
        return tripMapper.countTrips(tripNumber, departureDate, departureStation, arrivalStation);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addTrip(TripDTO tripDTO) {
        Trip trip = new Trip();
        BeanUtils.copyProperties(tripDTO, trip);
        
        // 设置默认状态为计划中
        if (trip.getTripStatus() == null) {
            trip.setTripStatus((byte) 0);
        }
        
        tripMapper.insert(trip);
        
        // 创建座位
        if (trip.getTripId() != null && trip.getTotalSeats() != null && trip.getTotalSeats() > 0) {
            createSeatsForTrip(trip.getTripId(), trip.getTotalSeats());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateTrip(Integer tripId, TripDTO tripDTO) {
        Trip trip = new Trip();
        BeanUtils.copyProperties(tripDTO, trip);
        trip.setTripId(tripId);
        
        // 获取原车次信息
        Trip oldTrip = tripMapper.findById(tripId);
        
        tripMapper.update(trip);
        
        // 如果座位数发生变化，需要调整座位
        if (oldTrip != null && trip.getTotalSeats() != null 
            && !trip.getTotalSeats().equals(oldTrip.getTotalSeats())) {
            adjustSeatsForTrip(tripId, oldTrip.getTotalSeats(), trip.getTotalSeats());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteTrip(Integer tripId) {
        // 删除车次相关的座位
        seatMapper.deleteByTripId(tripId);
        // 删除车次
        tripMapper.delete(tripId);
    }

    @Override
    public void updateTripPrice(Integer tripId, BigDecimal newPrice) {
        tripMapper.updatePrice(tripId, newPrice);
    }
    
    /**
     * 为新车次创建座位
     */
    private void createSeatsForTrip(Integer tripId, Integer totalSeats) {
        if (tripId == null || totalSeats == null || totalSeats <= 0) {
            return;
        }

        // 按与初始化脚本相同的规则生成座位号，例如：1车01A
        for (int i = 1; i <= totalSeats; i++) {
            Seat seat = new Seat();
            seat.setTripId(tripId);
            seat.setSeatNumber(generateSeatNumber(i));
            seat.setSeatStatus((byte) 0); // 可售
            seatMapper.insert(seat);
        }
    }
    
    /**
     * 调整车次的座位数量
     */
    private void adjustSeatsForTrip(Integer tripId, Integer oldTotal, Integer newTotal) {
        // TODO: 实现座位调整逻辑
        // 如果新座位数大于旧座位数，创建新座位
        // 如果新座位数小于旧座位数，删除多余座位（只删除未售出的）
    }

    /**
     * 生成座位号，规则与 insert_trip_data.sql 中的存储过程 generate_seats 保持一致
     * 例如：1车01A、1车01B ...
     */
    private String generateSeatNumber(int index) {
        // 每个车厢 100 个座位，每排 5 个座位（A-E）
        int seatsPerCar = 100;
        int seatsPerRow = 5;

        int carNum = (index - 1) / seatsPerCar + 1;          // 车厢号，从 1 开始
        int indexInCar = (index - 1) % seatsPerCar;           // 当前车厢内的序号 0..99
        int rowNum = indexInCar / seatsPerRow + 1;            // 排号，从 1 开始
        int seatIndexInRow = indexInCar % seatsPerRow;        // 本排中的第几个座位 0..4
        char seatLetter = (char) ('A' + seatIndexInRow);      // A-E

        return carNum + "车" + String.format("%02d", rowNum) + seatLetter;
    }
}

