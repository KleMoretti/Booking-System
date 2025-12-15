package com.booking.controller;

import com.booking.common.Result;
import com.booking.dto.TripVO;
import com.booking.entity.Seat;
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
    public Result<List<TripVO>> searchTrips(
            @RequestParam Integer fromStationId,
            @RequestParam Integer toStationId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime departureDate) {
        
        LocalDateTime startTime = departureDate.toLocalDate().atStartOfDay();
        LocalDateTime endTime = startTime.plusDays(1);
        
        List<TripVO> trips = tripService.searchTrips(fromStationId, toStationId, startTime, endTime);
        return Result.success(trips);
    }

    /**
     * 获取班次列表
     */
    @GetMapping("/list")
    public Result<List<TripVO>> getTripList() {
        List<TripVO> trips = tripService.getAllTrips();
        return Result.success(trips);
    }

    /**
     * 获取班次详情
     */
    @GetMapping("/{id}")
    public Result<TripVO> getTripById(@PathVariable Integer id) {
        // 用户端查看车次详情，返回简化的视图对象
        List<TripVO> trips = tripService.searchTrips(null, null, null, null);
        TripVO trip = trips.stream()
                .filter(t -> t.getTripId().equals(id))
                .findFirst()
                .orElse(null);
        
        if (trip == null) {
            return Result.error("班次不存在");
        }
        return Result.success(trip);
    }

    /**
     * 获取可用座位
     * @param id 车次ID
     * @param seatType 座位类型（可选，当前系统不区分座位类型，此参数保留用于未来扩展）
     */
    @GetMapping("/{id}/seats")
    public Result<List<Seat>> getAvailableSeats(
            @PathVariable Integer id,
            @RequestParam(required = false) String seatType) {
        // 当前系统不区分座位类型，seatType 参数保留用于未来扩展
        List<Seat> seats = seatService.listAvailableSeats(id);
        return Result.success(seats);
    }
}
