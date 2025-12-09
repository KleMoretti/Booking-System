package com.booking.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 车次视图对象
 */
public class TripVO {
    @JsonProperty("id")
    private Integer tripId;
    
    @JsonProperty("tripNo")
    private String tripNumber;
    
    @JsonProperty("fromStation")
    private String departureStationName;
    
    @JsonProperty("toStation")
    private String arrivalStationName;
    
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private String duration;
    
    @JsonProperty("seats")
    private SeatInfo seatInfo;
    
    // 内部类：座位信息
    public static class SeatInfo {
        private Integer available;
        private BigDecimal price;
        
        public Integer getAvailable() {
            return available;
        }
        
        public void setAvailable(Integer available) {
            this.available = available;
        }
        
        public BigDecimal getPrice() {
            return price;
        }
        
        public void setPrice(BigDecimal price) {
            this.price = price;
        }
    }
    
    // Getters and Setters
    public Integer getTripId() {
        return tripId;
    }
    
    public void setTripId(Integer tripId) {
        this.tripId = tripId;
    }
    
    public String getTripNumber() {
        return tripNumber;
    }
    
    public void setTripNumber(String tripNumber) {
        this.tripNumber = tripNumber;
    }
    
    public String getDepartureStationName() {
        return departureStationName;
    }
    
    public void setDepartureStationName(String departureStationName) {
        this.departureStationName = departureStationName;
    }
    
    public String getArrivalStationName() {
        return arrivalStationName;
    }
    
    public void setArrivalStationName(String arrivalStationName) {
        this.arrivalStationName = arrivalStationName;
    }
    
    public LocalDateTime getDepartureTime() {
        return departureTime;
    }
    
    public void setDepartureTime(LocalDateTime departureTime) {
        this.departureTime = departureTime;
    }
    
    public LocalDateTime getArrivalTime() {
        return arrivalTime;
    }
    
    public void setArrivalTime(LocalDateTime arrivalTime) {
        this.arrivalTime = arrivalTime;
    }
    
    public String getDuration() {
        return duration;
    }
    
    public void setDuration(String duration) {
        this.duration = duration;
    }
    
    public SeatInfo getSeatInfo() {
        return seatInfo;
    }
    
    public void setSeatInfo(SeatInfo seatInfo) {
        this.seatInfo = seatInfo;
    }
}
