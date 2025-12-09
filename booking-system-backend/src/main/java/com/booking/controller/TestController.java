package com.booking.controller;

import com.booking.common.Result;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 测试控制器 - 用于验证后端是否正常运行
 */
@RestController
@RequestMapping("/test")
public class TestController {

    @GetMapping("/hello")
    public Result<String> hello() {
        return Result.success("Hello, Booking System is running!");
    }

    @GetMapping("/info")
    public Result<Map<String, Object>> info() {
        Map<String, Object> data = new HashMap<>();
        data.put("application", "Booking System");
        data.put("version", "1.0.0");
        data.put("serverTime", LocalDateTime.now());
        data.put("status", "running");
        return Result.success(data);
    }

    @GetMapping("/health")
    public Result<String> health() {
        return Result.success("OK");
    }
}
