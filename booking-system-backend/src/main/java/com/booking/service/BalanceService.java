package com.booking.service;

import java.math.BigDecimal;

public interface BalanceService {
    /**
     * 用户充值
     */
    void recharge(Integer userId, BigDecimal amount);

    /**
     * 用户消费（支付订单）
     */
    void consume(Integer userId, BigDecimal amount);

    /**
     * 退款到账户余额
     */
    void refund(Integer userId, BigDecimal amount);
}

