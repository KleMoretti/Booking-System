package com.booking.entity;

import java.time.LocalDateTime;
import java.math.BigDecimal;

/**
 * 票务变更记录实体
 */
public class TicketChange {
    private Long changeId;
    private Byte changeType;
    private Long ticketId;
    private Long orderId;
    private Integer targetTripId;
    private Integer targetSeatId;
    private BigDecimal changeFee;
    private BigDecimal refundAmount;
    private Byte processStatus;
    private LocalDateTime requestTime;
    private LocalDateTime processTime;
    private String note;

    public Long getChangeId() {
        return changeId;
    }

    public void setChangeId(Long changeId) {
        this.changeId = changeId;
    }

    public Byte getChangeType() {
        return changeType;
    }

    public void setChangeType(Byte changeType) {
        this.changeType = changeType;
    }

    public Long getTicketId() {
        return ticketId;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Integer getTargetTripId() {
        return targetTripId;
    }

    public void setTargetTripId(Integer targetTripId) {
        this.targetTripId = targetTripId;
    }

    public Integer getTargetSeatId() {
        return targetSeatId;
    }

    public void setTargetSeatId(Integer targetSeatId) {
        this.targetSeatId = targetSeatId;
    }

    public BigDecimal getChangeFee() {
        return changeFee;
    }

    public void setChangeFee(BigDecimal changeFee) {
        this.changeFee = changeFee;
    }

    public BigDecimal getRefundAmount() {
        return refundAmount;
    }

    public void setRefundAmount(BigDecimal refundAmount) {
        this.refundAmount = refundAmount;
    }

    public Byte getProcessStatus() {
        return processStatus;
    }

    public void setProcessStatus(Byte processStatus) {
        this.processStatus = processStatus;
    }

    public LocalDateTime getRequestTime() {
        return requestTime;
    }

    public void setRequestTime(LocalDateTime requestTime) {
        this.requestTime = requestTime;
    }

    public LocalDateTime getProcessTime() {
        return processTime;
    }

    public void setProcessTime(LocalDateTime processTime) {
        this.processTime = processTime;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
