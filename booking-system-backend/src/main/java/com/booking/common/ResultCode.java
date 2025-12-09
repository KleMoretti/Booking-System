package com.booking.common;

/**
 * 响应状态码
 */
public enum ResultCode {
    SUCCESS(200, "操作成功"),
    ERROR(500, "操作失败"),
    UNAUTHORIZED(401, "未授权"),
    FORBIDDEN(403, "禁止访问"),
    NOT_FOUND(404, "资源不存在"),
    PARAMS_ERROR(400, "参数错误"),
    USER_NOT_FOUND(1001, "用户不存在"),
    USER_ALREADY_EXISTS(1002, "用户已存在"),
    PASSWORD_ERROR(1003, "密码错误"),
    LOGIN_EXPIRED(1004, "登录过期"),
    ORDER_NOT_FOUND(2001, "订单不存在"),
    ORDER_CANNOT_CANCEL(2002, "订单不可取消"),
    SEAT_NOT_AVAILABLE(3001, "座位不可用"),
    SEAT_ALREADY_BOOKED(3002, "座位已被预订"),
    TRIP_NOT_FOUND(4001, "班次不存在"),
    PAYMENT_FAILED(5001, "支付失败"),
    BALANCE_NOT_ENOUGH(5002, "余额不足");

    private final Integer code;
    private final String message;

    ResultCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }

    public Integer getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
