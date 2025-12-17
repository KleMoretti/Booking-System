package com.booking.constant;

/**
 * 车次状态常量
 */
public class TripStatus {
    /**
     * 计划中：还未发车
     */
    public static final byte PLANNED = 0;
    
    /**
     * 进行中：已发车但未到达
     */
    public static final byte IN_PROGRESS = 1;
    
    /**
     * 已完成：已到达
     */
    public static final byte COMPLETED = 2;
    
    /**
     * 已删除：软删除
     */
    public static final byte DELETED = 3;
    
    /**
     * 判断状态是否可编辑
     * 已删除和已完成的车次不可编辑
     */
    public static boolean isEditable(Byte status) {
        return status != null && status != COMPLETED && status != DELETED;
    }
    
    /**
     * 获取状态描述
     */
    public static String getStatusDesc(Byte status) {
        if (status == null) {
            return "未知";
        }
        switch (status) {
            case PLANNED:
                return "计划中";
            case IN_PROGRESS:
                return "进行中";
            case COMPLETED:
                return "已完成";
            case DELETED:
                return "已删除";
            default:
                return "未知";
        }
    }
}
