package com.booking.dto;

import lombok.Data;

/**
 * 退票请求DTO
 */
@Data
public class RefundOrderDTO {
    /**
     * 退票原因
     */
    private String reason;
}
