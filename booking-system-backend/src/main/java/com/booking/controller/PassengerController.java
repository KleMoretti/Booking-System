package com.booking.controller;

import com.booking.common.Result;
import com.booking.entity.Passenger;
import com.booking.service.PassengerService;
import com.booking.utils.JwtUtil;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;

@RestController
@RequestMapping("/passengers")
public class PassengerController {

    @Resource
    private PassengerService passengerService;

    @Resource
    private JwtUtil jwtUtil;

    @GetMapping
    public Result<List<Passenger>> listPassengers(@RequestHeader(value = "Authorization", required = false) String token) {
        try {
            if (token == null || token.isEmpty()) {
                return Result.error("请先登录");
            }
            String jwt = token.replace("Bearer ", "");
            Integer userId = jwtUtil.getUserIdFromToken(jwt);
            List<Passenger> list = passengerService.listPassengers(userId);
            return Result.success(list);
        } catch (Exception e) {
            return Result.error("获取常用联系人失败：" + e.getMessage());
        }
    }

    @PostMapping
    public Result<Passenger> createPassenger(@RequestHeader(value = "Authorization", required = false) String token,
                                             @RequestBody Passenger passenger) {
        try {
            if (token == null || token.isEmpty()) {
                return Result.error("请先登录");
            }
            String jwt = token.replace("Bearer ", "");
            Integer userId = jwtUtil.getUserIdFromToken(jwt);
            Passenger created = passengerService.createPassenger(userId, passenger);
            return Result.success("添加成功", created);
        } catch (Exception e) {
            return Result.error("添加常用联系人失败：" + e.getMessage());
        }
    }

    @PutMapping("/{passengerId}")
    public Result<Passenger> updatePassenger(@RequestHeader(value = "Authorization", required = false) String token,
                                             @PathVariable Integer passengerId,
                                             @RequestBody Passenger passenger) {
        try {
            if (token == null || token.isEmpty()) {
                return Result.error("请先登录");
            }
            String jwt = token.replace("Bearer ", "");
            Integer userId = jwtUtil.getUserIdFromToken(jwt);
            Passenger updated = passengerService.updatePassenger(userId, passengerId, passenger);
            return Result.success("更新成功", updated);
        } catch (Exception e) {
            return Result.error("更新常用联系人失败：" + e.getMessage());
        }
    }

    @DeleteMapping("/{passengerId}")
    public Result<Void> deletePassenger(@RequestHeader(value = "Authorization", required = false) String token,
                                        @PathVariable Integer passengerId) {
        try {
            if (token == null || token.isEmpty()) {
                return Result.error("请先登录");
            }
            String jwt = token.replace("Bearer ", "");
            Integer userId = jwtUtil.getUserIdFromToken(jwt);
            passengerService.deletePassenger(userId, passengerId);
            return Result.success("删除成功", null);
        } catch (Exception e) {
            return Result.error("删除常用联系人失败：" + e.getMessage());
        }
    }

    @GetMapping("/default")
    public Result<Passenger> getDefaultPassenger(@RequestHeader(value = "Authorization", required = false) String token) {
        try {
            if (token == null || token.isEmpty()) {
                return Result.error("请先登录");
            }
            String jwt = token.replace("Bearer ", "");
            Integer userId = jwtUtil.getUserIdFromToken(jwt);
            Passenger defaultPassenger = passengerService.getDefaultPassenger(userId);
            return Result.success(defaultPassenger);
        } catch (Exception e) {
            return Result.error("获取默认联系人失败：" + e.getMessage());
        }
    }
}
