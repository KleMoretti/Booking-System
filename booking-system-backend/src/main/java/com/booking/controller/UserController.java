package com.booking.controller;

import com.booking.common.Result;
import com.booking.dto.LoginDTO;
import com.booking.dto.RegisterDTO;
import com.booking.dto.UpdateProfileDTO;
import com.booking.entity.BalanceChange;
import com.booking.entity.User;
import com.booking.mapper.BalanceChangeMapper;
import com.booking.service.IUserService;
import com.booking.utils.JwtUtil;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 用户控制器
 */
@RestController
@RequestMapping("/user")
public class UserController {

    @Resource
    private IUserService userService;

    @Resource
    private JwtUtil jwtUtil;

    @Resource
    private BalanceChangeMapper balanceChangeMapper;

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@Valid @RequestBody LoginDTO loginDTO) {
        try {
            Map<String, Object> data = userService.login(loginDTO);
            return Result.success(data);
        } catch (IllegalArgumentException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            return Result.error("登录失败：" + e.getMessage());
        }
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public Result<Void> register(@Valid @RequestBody RegisterDTO registerDTO) {
        try {
            userService.register(registerDTO);
            return Result.success("注册成功", null);
        } catch (IllegalArgumentException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            return Result.error("注册失败：" + e.getMessage());
        }
    }

    /**
     * 获取用户信息
     */
    @GetMapping("/profile")
    public Result<User> getProfile(@RequestHeader(value = "Authorization", required = false) String token) {
        try {
            if (token == null || token.isEmpty()) {
                return Result.error("请先登录");
            }
            
            String jwt = token.replace("Bearer ", "");
            Integer userId = jwtUtil.getUserIdFromToken(jwt);
            User user = userService.getUserById(userId);

            if (user == null) {
                return Result.error("用户不存在");
            }
            
            return Result.success(user);
        } catch (IllegalArgumentException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            return Result.error("获取用户信息失败：" + e.getMessage());
        }
    }

    /**
     * 更新用户信息
     */
    @PutMapping("/profile")
    public Result<User> updateProfile(
            @RequestHeader(value = "Authorization", required = false) String token,
            @Valid @RequestBody UpdateProfileDTO dto) {
        try {
            if (token == null || token.isEmpty()) {
                return Result.error("请先登录");
            }
            
            String jwt = token.replace("Bearer ", "");
            Integer userId = jwtUtil.getUserIdFromToken(jwt);
            
            // 使用新的 updateProfile 方法
            userService.updateProfile(userId, dto);
            
            // 返回更新后的用户信息
            User updatedUser = userService.getUserById(userId);
            return Result.success("更新成功", updatedUser);
        } catch (IllegalArgumentException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            return Result.error("更新失败：" + e.getMessage());
        }
    }

    /**
     * 修改密码
     */
    @PutMapping("/password")
    public Result<Void> changePassword(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestBody Map<String, String> passwordData) {
        try {
            if (token == null || token.isEmpty()) {
                return Result.error("请先登录");
            }
            
            String jwt = token.replace("Bearer ", "");
            Integer userId = jwtUtil.getUserIdFromToken(jwt);
            
            String oldPassword = passwordData.get("oldPassword");
            String newPassword = passwordData.get("newPassword");
            
            userService.changePassword(userId, oldPassword, newPassword);

            return Result.success("密码修改成功", null);
        } catch (IllegalArgumentException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            return Result.error("密码修改失败：" + e.getMessage());
        }
    }

    /**
     * 充值
     */
    @PostMapping("/recharge")
    public Result<Void> recharge(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestBody Map<String, Object> data) {
        try {
            if (token == null || token.isEmpty()) {
                return Result.error("请先登录");
            }
            
            String jwt = token.replace("Bearer ", "");
            Integer userId = jwtUtil.getUserIdFromToken(jwt);

            java.math.BigDecimal amount = new java.math.BigDecimal(data.get("amount").toString());
            userService.recharge(userId, amount);

            return Result.success("充值成功", null);
        } catch (IllegalArgumentException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            return Result.error("充值失败：" + e.getMessage());
        }
    }

    @PostMapping("/balance/recharge")
    public Result<Void> rechargeBalance(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestBody Map<String, Object> data) {
        return recharge(token, data);
    }

    @GetMapping("/balance/history")
    public Result<List<Map<String, Object>>> getBalanceHistory(
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            if (token == null || token.isEmpty()) {
                return Result.error("请先登录");
            }
            
            String jwt = token.replace("Bearer ", "");
            Integer userId = jwtUtil.getUserIdFromToken(jwt);

            List<BalanceChange> records = balanceChangeMapper.findByUserId(userId);
            List<Map<String, Object>> data = records.stream().map(record -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", record.getRecordId());
                map.put("createdAt", record.getCreateTime());
                map.put("amount", record.getChangeAmount());
                map.put("balance", record.getBalanceAfter());
                map.put("description", record.getNote());
                map.put("type", convertChangeType(record.getChangeType()));
                return map;
            }).collect(Collectors.toList());

            return Result.success(data);
        } catch (IllegalArgumentException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            return Result.error("获取余额历史失败：" + e.getMessage());
        }
    }

    /**
     * 登出
     */
    @PostMapping("/logout")
    public Result<Void> logout() {
        // JWT是无状态的，登出主要由前端处理（删除token）
        return Result.success("登出成功", null);
    }

    private String convertChangeType(Byte changeType) {
        if (changeType == null) {
            return "UNKNOWN";
        }
        switch (changeType) {
            case 0:
                return "RECHARGE";
            case 1:
                return "PAYMENT";
            case 2:
                return "REFUND";
            case 3:
                return "CHANGE";
            default:
                return "UNKNOWN";
        }
    }
}

