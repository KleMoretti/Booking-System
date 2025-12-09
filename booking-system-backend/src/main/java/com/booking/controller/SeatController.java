package com.booking.controller;

import com.booking.common.Result;
import com.booking.entity.Seat;
import com.booking.service.SeatService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;

/**
 * 座位控制器
 */
@RestController
@RequestMapping("/seat")
public class SeatController {
    
    @Resource
    private SeatService seatService;
    
    /**
     * 获取指定车次的所有座位
     */
    @GetMapping("/trip/{tripId}")
    public Result<List<Seat>> getSeatsByTrip(@PathVariable Integer tripId) {
        List<Seat> seats = seatService.listSeatsByTrip(tripId);
        return Result.success(seats);
    }
    
    /**
     * 获取指定车次的可用座位
     */
    @GetMapping("/trip/{tripId}/available")
    public Result<List<Seat>> getAvailableSeats(@PathVariable Integer tripId) {
        List<Seat> seats = seatService.listAvailableSeats(tripId);
        return Result.success(seats);
    }
    
    /**
     * 锁定座位（预订时临时锁定）
     */
    @PostMapping("/lock")
    public Result<Void> lockSeats(@RequestBody List<Integer> seatIds) {
        // TODO: 实现座位锁定逻辑
        // 设置锁定时间（如15分钟），超时自动释放
        return Result.success();
    }
    
    /**
     * 释放座位锁定
     */
    @PostMapping("/unlock")
    public Result<Void> unlockSeats(@RequestBody List<Integer> seatIds) {
        // TODO: 实现座位解锁逻辑
        return Result.success();
    }
}

