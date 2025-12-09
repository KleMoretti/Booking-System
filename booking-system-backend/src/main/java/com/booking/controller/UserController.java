package com.booking.controller;

import com.booking.common.Result;
import com.booking.dto.LoginDTO;
import com.booking.dto.RegisterDTO;
import com.booking.entity.User;
import com.booking.mapper.UserMapper;
import com.booking.utils.JwtUtil;
import com.booking.utils.PasswordUtil;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;

/**
 * 用户控制器
 */
@RestController
@RequestMapping("/user")
public class UserController {

    @Resource
    private UserMapper userMapper;
    
    @Resource
    private JwtUtil jwtUtil;

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@Valid @RequestBody LoginDTO loginDTO) {
        User user = userMapper.selectByUsername(loginDTO.getUsername());
        
        if (user == null) {
            return Result.error("用户不存在");
        }
        
        if (!PasswordUtil.matches(loginDTO.getPassword(), user.getPassword())) {
            return Result.error("密码错误");
        }
        
        // 生成Token
        String token = jwtUtil.generateToken(user.getUserId(), user.getUsername());
        
        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("user", user);
        
        return Result.success(data);
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public Result<Void> register(@Valid @RequestBody RegisterDTO registerDTO) {
        // 检查用户名是否存在
        User existUser = userMapper.selectByUsername(registerDTO.getUsername());
        if (existUser != null) {
            return Result.error("用户名已存在");
        }
        
        // 检查邮箱是否存在
        if (registerDTO.getEmail() != null) {
            User existEmail = userMapper.selectByEmail(registerDTO.getEmail());
            if (existEmail != null) {
                return Result.error("邮箱已被使用");
            }
        }
        
        // 检查手机号是否存在
        if (registerDTO.getPhone() != null) {
            User existPhone = userMapper.selectByPhone(registerDTO.getPhone());
            if (existPhone != null) {
                return Result.error("手机号已被使用");
            }
        }
        
        // 创建新用户
        User user = new User();
        user.setUsername(registerDTO.getUsername());
        user.setPassword(PasswordUtil.encode(registerDTO.getPassword()));
        user.setEmail(registerDTO.getEmail());
        user.setPhone(registerDTO.getPhone());
        user.setUserType((byte) 0); // 普通用户
        user.setBalance(new java.math.BigDecimal("0.00")); // 初始余额
        user.setIsDeleted((byte) 0); // 设置为未删除
        
        userMapper.insert(user);
        
        return Result.success();
    }

    /**
     * 获取用户信息
     */
    @GetMapping("/profile")
    public Result<User> getProfile(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.replace("Bearer ", "");
            Integer userId = jwtUtil.getUserIdFromToken(jwt);
            User user = userMapper.selectById(userId);
            
            if (user == null) {
                return Result.error("用户不存在");
            }
            
            // 隐藏密码
            user.setPassword(null);
            
            return Result.success(user);
        } catch (Exception e) {
            return Result.error("Token无效");
        }
    }

    /**
     * 更新用户信息
     */
    @PutMapping("/profile")
    public Result<Void> updateProfile(
            @RequestHeader("Authorization") String token,
            @RequestBody User user) {
        try {
            String jwt = token.replace("Bearer ", "");
            Integer userId = jwtUtil.getUserIdFromToken(jwt);
            
            user.setUserId(userId);
            userMapper.updateById(user);
            
            return Result.success();
        } catch (Exception e) {
            return Result.error("Token无效");
        }
    }

    /**
     * 修改密码
     */
    @PutMapping("/password")
    public Result<Void> changePassword(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> passwordData) {
        try {
            String jwt = token.replace("Bearer ", "");
            Integer userId = jwtUtil.getUserIdFromToken(jwt);
            
            User user = userMapper.selectById(userId);
            if (user == null) {
                return Result.error("用户不存在");
            }
            
            String oldPassword = passwordData.get("oldPassword");
            String newPassword = passwordData.get("newPassword");
            
            if (!PasswordUtil.matches(oldPassword, user.getPassword())) {
                return Result.error("原密码错误");
            }
            
            user.setPassword(PasswordUtil.encode(newPassword));
            userMapper.updateById(user);
            
            return Result.success();
        } catch (Exception e) {
            return Result.error("Token无效");
        }
    }

    /**
     * 登出
     */
    @PostMapping("/logout")
    public Result<Void> logout() {
        // JWT是无状态的，登出主要由前端处理（删除token）
        return Result.success();
    }
}

