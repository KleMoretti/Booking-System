package com.booking.service.impl;

import com.booking.entity.BalanceChange;
import com.booking.entity.User;
import com.booking.mapper.BalanceChangeMapper;
import com.booking.mapper.UserMapper;
import com.booking.service.BalanceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.math.BigDecimal;

@Service
public class BalanceServiceImpl implements BalanceService {

    @Resource
    private UserMapper userMapper;

    @Resource
    private BalanceChangeMapper balanceChangeMapper;

    @Override
    @Transactional
    public void recharge(Integer userId, BigDecimal amount) {
        changeBalance(userId, amount, (byte)0);
    }

    @Override
    @Transactional
    public void consume(Integer userId, BigDecimal amount) {
        changeBalance(userId, amount.negate(), (byte)1);
    }

    @Override
    @Transactional
    public void refund(Integer userId, BigDecimal amount) {
        changeBalance(userId, amount, (byte)2);
    }

    private void changeBalance(Integer userId, BigDecimal delta, byte type) {
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new IllegalArgumentException("用户不存在");
        }
        BigDecimal before = user.getBalance() == null ? BigDecimal.ZERO : user.getBalance();
        BigDecimal after = before.add(delta);
        if (after.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalStateException("余额不足");
        }
        user.setBalance(after);
        userMapper.update(user);

        BalanceChange record = new BalanceChange();
        record.setUserId(userId);
        record.setBalanceBefore(before);
        record.setBalanceAfter(after);
        record.setChangeAmount(delta);
        record.setChangeType(type);
        balanceChangeMapper.insert(record);
    }
}

