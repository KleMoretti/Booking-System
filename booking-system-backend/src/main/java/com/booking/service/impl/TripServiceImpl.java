package com.booking.service.impl;

import com.booking.constant.TripStatus;
import com.booking.dto.TripDTO;
import com.booking.dto.TripManagementVO;
import com.booking.dto.TripVO;
import com.booking.entity.Seat;
import com.booking.entity.Trip;
import com.booking.mapper.SeatMapper;
import com.booking.mapper.TripMapper;
import com.booking.service.OrderService;
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

    @Resource
    private OrderService orderService;

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
        
        // 根据发车时间自动设置状态
        if (trip.getTripStatus() == null) {
            trip.setTripStatus(calculateTripStatus(trip.getDepartureTime(), trip.getArrivalTime()));
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
        // 获取原车次信息
        Trip oldTrip = tripMapper.findById(tripId);
        if (oldTrip == null) {
            throw new IllegalArgumentException("车次不存在");
        }
        
        // 检查是否可编辑
        if (!TripStatus.isEditable(oldTrip.getTripStatus())) {
            throw new IllegalStateException("该车次状态不允许编辑：" + TripStatus.getStatusDesc(oldTrip.getTripStatus()));
        }
        
        Trip trip = new Trip();
        BeanUtils.copyProperties(tripDTO, trip);
        trip.setTripId(tripId);
        
        // 根据时间更新状态（除非已被标记为删除）
        if (oldTrip.getTripStatus() != TripStatus.DELETED) {
            trip.setTripStatus(calculateTripStatus(trip.getDepartureTime(), trip.getArrivalTime()));
        }
        
        tripMapper.update(trip);
        
        // 如果座位数发生变化，需要调整座位
        if (trip.getTotalSeats() != null 
            && !trip.getTotalSeats().equals(oldTrip.getTotalSeats())) {
            adjustSeatsForTrip(tripId, oldTrip.getTotalSeats(), trip.getTotalSeats());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteTrip(Integer tripId) {
        // 软删除前，先对该车次关联的订单进行取消与退款
        orderService.cancelAndRefundByTrip(tripId);

        // 软删除：将车次状态标记为已删除
        Trip trip = tripMapper.findById(tripId);
        if (trip == null) {
            throw new IllegalArgumentException("车次不存在");
        }
        
        // 更新状态为已删除
        trip.setTripStatus(TripStatus.DELETED);
        tripMapper.update(trip);
    }

    @Override
    public void updateTripPrice(Integer tripId, BigDecimal newPrice) {
        // 检查车次是否可编辑
        Trip trip = tripMapper.findById(tripId);
        if (trip == null) {
            throw new IllegalArgumentException("车次不存在");
        }
        
        if (!TripStatus.isEditable(trip.getTripStatus())) {
            throw new IllegalStateException("该车次状态不允许修改票价：" + TripStatus.getStatusDesc(trip.getTripStatus()));
        }
        
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
    
    /**
     * 根据发车和到达时间计算车次状态
     * @param departureTime 发车时间
     * @param arrivalTime 到达时间
     * @return 车次状态
     */
    private Byte calculateTripStatus(LocalDateTime departureTime, LocalDateTime arrivalTime) {
        if (departureTime == null || arrivalTime == null) {
            return TripStatus.PLANNED;
        }
        
        LocalDateTime now = LocalDateTime.now();
        
        // 已到达
        if (now.isAfter(arrivalTime)) {
            return TripStatus.COMPLETED;
        }
        
        // 已发车但未到达
        if (now.isAfter(departureTime)) {
            return TripStatus.IN_PROGRESS;
        }
        
        // 未发车
        return TripStatus.PLANNED;
    }
}

