package com.booking.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.List;

/**
 * 创建订单DTO
 */
public class CreateOrderDTO {
    
    @NotNull(message = "车次ID不能为空")
    private Integer tripId;
    
    @NotNull(message = "乘客信息不能为空")
    private List<PassengerInfo> passengers;
    
    // 乘客信息
    public static class PassengerInfo {
        @NotBlank(message = "乘客姓名不能为空")
        private String name;
        
        @NotBlank(message = "身份证号不能为空")
        private String idCard;
        
        private Integer seatId; // 指定座位ID（可选）

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getIdCard() {
            return idCard;
        }

        public void setIdCard(String idCard) {
            this.idCard = idCard;
        }

        public Integer getSeatId() {
            return seatId;
        }

        public void setSeatId(Integer seatId) {
            this.seatId = seatId;
        }
    }

    public Integer getTripId() {
        return tripId;
    }

    public void setTripId(Integer tripId) {
        this.tripId = tripId;
    }

    public List<PassengerInfo> getPassengers() {
        return passengers;
    }

    public void setPassengers(List<PassengerInfo> passengers) {
        this.passengers = passengers;
    }
}
