package com.booking.service;

import java.math.BigDecimal;

public interface BalanceService {
    /**
     * 用户充值
     */
    void recharge(Integer userId, BigDecimal amount);

    /**
     * 用户消费（支付订单）
     * @param note 说明信息
     */
    void consume(Integer userId, BigDecimal amount, String note);

    /**
     * 退款到账户余额
     * @param note 说明信息（订单号等）
     */
    void refund(Integer userId, BigDecimal amount, String note);
}

