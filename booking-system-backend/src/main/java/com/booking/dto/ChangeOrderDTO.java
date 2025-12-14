package com.booking.dto;

import lombok.Data;

/**
 * 改签请求DTO
 */
@Data
public class ChangeOrderDTO {
    /**
     * 新车次ID
     */
    private Integer newTripId;
    
    /**
     * 新车次号
     */
    private String newTripNo;
    
    /**
     * 新出发日期
     */
    private String newDepartureDate;
    
    /**
     * 新出发时间
     */
    private String newDepartureTime;
    
    /**
     * 改签原因
     */
    private String reason;
}
