package com.booking.controller;

import com.booking.common.Result;
import com.booking.entity.Seat;
import com.booking.entity.Trip;
import com.booking.service.SeatService;
import com.booking.service.TripService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 班次控制器
 */
@RestController
@RequestMapping("/trip")
public class TripController {

    @Resource
    private TripService tripService;
    
    @Resource
    private SeatService seatService;

    /**
     * 搜索班次
     */
    @GetMapping("/search")
    public Result<List<Trip>> searchTrips(
            @RequestParam Integer fromStationId,
            @RequestParam Integer toStationId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime departureDate) {
        
        LocalDateTime startTime = departureDate.toLocalDate().atStartOfDay();
        LocalDateTime endTime = startTime.plusDays(1);
        
        List<Trip> trips = tripService.searchTrips(fromStationId, toStationId, startTime, endTime);
        return Result.success(trips);
    }

    /**
     * 获取班次列表
     */
    @GetMapping("/list")
    public Result<List<Trip>> getTripList() {
        List<Trip> trips = tripService.getAllTrips();
        return Result.success(trips);
    }

    /**
     * 获取班次详情
     */
    @GetMapping("/{id}")
    public Result<Trip> getTripById(@PathVariable Integer id) {
        Trip trip = tripService.getById(id);
        if (trip == null) {
            return Result.error("班次不存在");
        }
        return Result.success(trip);
    }

    /**
     * 获取可用座位
     */
    @GetMapping("/{id}/seats")
    public Result<List<Seat>> getAvailableSeats(@PathVariable Integer id) {
        List<Seat> seats = seatService.listAvailableSeats(id);
        return Result.success(seats);
    }

    /**
     * 添加班次（管理员功能）
     */
    @PostMapping
    public Result<Void> addTrip(@RequestBody Trip trip) {
        tripService.addTrip(trip);
        return Result.success();
    }

    /**
     * 更新班次（管理员功能）
     */
    @PutMapping("/{id}")
    public Result<Void> updateTrip(@PathVariable Integer id, @RequestBody Trip trip) {
        trip.setTripId(id);
        tripService.updateTrip(trip);
        return Result.success();
    }
}
