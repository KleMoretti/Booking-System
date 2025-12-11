package com.booking.service;

import com.booking.dto.LoginDTO;
import com.booking.dto.RegisterDTO;
import com.booking.entity.User;

import java.util.Map;

/**
 * 用户服务接口
 */
public interface IUserService {
    /**
     * 用户登录
     */
    Map<String, Object> login(LoginDTO loginDTO);

    /**
     * 用户注册
     */
    void register(RegisterDTO registerDTO);

    /**
     * 根据ID获取用户信息
     */
    User getUserById(Integer userId);

    /**
     * 根据用户名获取用户信息
     */
    User getUserByUsername(String username);

    /**
     * 更新用户信息
     */
    void updateUser(User user);

    /**
     * 修改密码
     */
    void changePassword(Integer userId, String oldPassword, String newPassword);

    /**
     * 充值
     */
    void recharge(Integer userId, java.math.BigDecimal amount);
}

