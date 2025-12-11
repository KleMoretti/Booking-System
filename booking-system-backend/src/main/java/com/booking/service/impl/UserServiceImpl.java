package com.booking.service.impl;

import com.booking.dto.LoginDTO;
import com.booking.dto.RegisterDTO;
import com.booking.entity.BalanceChange;
import com.booking.entity.User;
import com.booking.mapper.BalanceChangeMapper;
import com.booking.mapper.UserMapper;
import com.booking.service.IUserService;
import com.booking.utils.JwtUtil;
import com.booking.utils.PasswordUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * 用户服务实现类
 */
@Service
public class UserServiceImpl implements IUserService {

    @Resource
    private UserMapper userMapper;

    @Resource
    private BalanceChangeMapper balanceChangeMapper;

    @Resource
    private JwtUtil jwtUtil;

    @Override
    public Map<String, Object> login(LoginDTO loginDTO) {
        User user = userMapper.selectByUsername(loginDTO.getUsername());

        if (user == null) {
            throw new IllegalArgumentException("用户不存在");
        }

        if (user.getIsDeleted() == 1) {
            throw new IllegalArgumentException("用户已被删除");
        }

        if (!PasswordUtil.matches(loginDTO.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("密码错误");
        }

        // 生成Token
        String token = jwtUtil.generateToken(user.getUserId(), user.getUsername());

        // 隐藏密码
        user.setPassword(null);

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("user", user);

        return result;
    }

    @Override
    @Transactional
    public void register(RegisterDTO registerDTO) {
        // 检查用户名是否存在
        User existUser = userMapper.selectByUsername(registerDTO.getUsername());
        if (existUser != null) {
            throw new IllegalArgumentException("用户名已存在");
        }

        // 检查邮箱是否存在
        if (registerDTO.getEmail() != null && !registerDTO.getEmail().isEmpty()) {
            User existEmail = userMapper.selectByEmail(registerDTO.getEmail());
            if (existEmail != null) {
                throw new IllegalArgumentException("邮箱已被使用");
            }
        }

        // 检查手机号是否存在
        if (registerDTO.getPhone() != null && !registerDTO.getPhone().isEmpty()) {
            User existPhone = userMapper.selectByPhone(registerDTO.getPhone());
            if (existPhone != null) {
                throw new IllegalArgumentException("手机号已被使用");
            }
        }

        // 创建新用户
        User user = new User();
        user.setUsername(registerDTO.getUsername());
        user.setPassword(PasswordUtil.encode(registerDTO.getPassword()));
        user.setEmail(registerDTO.getEmail());
        user.setPhone(registerDTO.getPhone());
        user.setUserType((byte) 0); // 普通用户
        user.setBalance(BigDecimal.ZERO); // 初始余额为0
        user.setIsDeleted((byte) 0);

        userMapper.insert(user);
    }

    @Override
    public User getUserById(Integer userId) {
        User user = userMapper.selectById(userId);
        if (user != null) {
            user.setPassword(null); // 隐藏密码
        }
        return user;
    }

    @Override
    public User getUserByUsername(String username) {
        User user = userMapper.selectByUsername(username);
        if (user != null) {
            user.setPassword(null); // 隐藏密码
        }
        return user;
    }

    @Override
    @Transactional
    public void updateUser(User user) {
        if (user.getUserId() == null) {
            throw new IllegalArgumentException("用户ID不能为空");
        }

        User existUser = userMapper.selectById(user.getUserId());
        if (existUser == null) {
            throw new IllegalArgumentException("用户不存在");
        }

        // 不允许修改用户名、密码、余额等敏感字段
        user.setUsername(null);
        user.setPassword(null);
        user.setBalance(null);
        user.setUserType(null);

        userMapper.updateById(user);
    }

    @Override
    @Transactional
    public void changePassword(Integer userId, String oldPassword, String newPassword) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new IllegalArgumentException("用户不存在");
        }

        if (!PasswordUtil.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("原密码错误");
        }

        user.setPassword(PasswordUtil.encode(newPassword));
        userMapper.updateById(user);
    }

    @Override
    @Transactional
    public void recharge(Integer userId, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("充值金额必须大于0");
        }

        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new IllegalArgumentException("用户不存在");
        }

        BigDecimal oldBalance = user.getBalance();
        BigDecimal newBalance = oldBalance.add(amount);

        // 更新余额
        user.setBalance(newBalance);
        userMapper.updateById(user);

        // 记录余额变动
        BalanceChange balanceChange = new BalanceChange();
        balanceChange.setUserId(userId);
        balanceChange.setChangeAmount(amount);
        balanceChange.setBalanceBefore(oldBalance);
        balanceChange.setBalanceAfter(newBalance);
        balanceChange.setChangeType((byte) 0); // 0=充值
        balanceChange.setNote("用户充值");

        balanceChangeMapper.insert(balanceChange);
    }
}

