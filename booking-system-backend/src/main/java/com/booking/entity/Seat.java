package com.booking.entity;

import java.time.LocalDateTime;

/**
 * 座位实体类
 */
public class Seat {
    private Integer seatId;
    private Integer tripId;
    private String seatNumber;
    private Byte seatStatus;
    private LocalDateTime lockExpireTime;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    public Integer getSeatId() {
        return seatId;
    }

    public void setSeatId(Integer seatId) {
        this.seatId = seatId;
    }

    public Integer getTripId() {
        return tripId;
    }

    public void setTripId(Integer tripId) {
        this.tripId = tripId;
    }

    public String getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(String seatNumber) {
        this.seatNumber = seatNumber;
    }

    public Byte getSeatStatus() {
        return seatStatus;
    }

    public void setSeatStatus(Byte seatStatus) {
        this.seatStatus = seatStatus;
    }

    public LocalDateTime getLockExpireTime() {
        return lockExpireTime;
    }

    public void setLockExpireTime(LocalDateTime lockExpireTime) {
        this.lockExpireTime = lockExpireTime;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public LocalDateTime getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }
}
