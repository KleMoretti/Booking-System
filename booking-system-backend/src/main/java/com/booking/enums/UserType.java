package com.booking.enums;

/**
 * 用户类型枚举
 */
public enum UserType {
    NORMAL(0, "普通用户"),
    ADMIN(1, "管理员");
    
    private final Integer code;
    private final String desc;
    
    UserType(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }
    
    public Integer getCode() {
        return code;
    }
    
    public String getDesc() {
        return desc;
    }
}

