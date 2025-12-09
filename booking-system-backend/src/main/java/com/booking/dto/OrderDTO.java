package com.booking.dto;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.List;

/**
 * 订单数据传输对象
 */
public class OrderDTO {
    @NotNull(message = "班次ID不能为空")
    private Integer tripId;
    
    @NotEmpty(message = "座位ID列表不能为空")
    private List<Integer> seatIds;
    
    @NotEmpty(message = "乘客信息不能为空")
    private List<PassengerInfo> passengers;

    public static class PassengerInfo {
        private String passengerName;
        private String passengerIdCard;

        public String getPassengerName() {
            return passengerName;
        }

        public void setPassengerName(String passengerName) {
            this.passengerName = passengerName;
        }

        public String getPassengerIdCard() {
            return passengerIdCard;
        }

        public void setPassengerIdCard(String passengerIdCard) {
            this.passengerIdCard = passengerIdCard;
        }
    }

    public Integer getTripId() {
        return tripId;
    }

    public void setTripId(Integer tripId) {
        this.tripId = tripId;
    }

    public List<Integer> getSeatIds() {
        return seatIds;
    }

    public void setSeatIds(List<Integer> seatIds) {
        this.seatIds = seatIds;
    }

    public List<PassengerInfo> getPassengers() {
        return passengers;
    }

    public void setPassengers(List<PassengerInfo> passengers) {
        this.passengers = passengers;
    }
}
