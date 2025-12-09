package com.booking.dto;

import javax.validation.constraints.NotNull;

/**
 * 支付数据传输对象
 */
public class PaymentDTO {
    @NotNull(message = "订单ID不能为空")
    private Long orderId;
    
    @NotNull(message = "支付方式不能为空")
    private Byte paymentMethod;

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Byte getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(Byte paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
