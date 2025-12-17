package com.booking.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

/**
 * 车次管理视图对象（前端专用格式）
 */
public class TripManagementVO {
    
    @JsonProperty("id")
    private Integer tripId;
    
    @JsonProperty("tripNumber")
    private String tripNumber;
    
    @JsonProperty("trainType")
    private String vehicleInfo;
    
    @JsonProperty("departureStation")
    private String departureStationName;
    
    @JsonProperty("arrivalStation")
    private String arrivalStationName;
    
    @JsonProperty("date")
    private String date;
    
    @JsonProperty("arrivalDate")
    private String arrivalDate;
    
    @JsonProperty("departureTime")
    private String departureTime;
    
    @JsonProperty("arrivalTime")
    private String arrivalTime;
    
    @JsonProperty("duration")
    private String duration;
    
    @JsonProperty("status")
    private Integer status;
    
    @JsonProperty("statusText")
    private String statusText;
    
    @JsonProperty("seats")
    private SeatInfo seats;
    
    // 内部类：座位信息
    public static class SeatInfo {
        @JsonProperty("available")
        private Integer available;
        
        @JsonProperty("total")
        private Integer total;
        
        @JsonProperty("price")
        private BigDecimal price;

        public Integer getAvailable() {
            return available;
        }

        public void setAvailable(Integer available) {
            this.available = available;
        }

        public Integer getTotal() {
            return total;
        }

        public void setTotal(Integer total) {
            this.total = total;
        }

        public BigDecimal getPrice() {
            return price;
        }

        public void setPrice(BigDecimal price) {
            this.price = price;
        }
    }

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

    public String getVehicleInfo() {
        return vehicleInfo;
    }

    public void setVehicleInfo(String vehicleInfo) {
        this.vehicleInfo = vehicleInfo;
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

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getArrivalDate() {
        return arrivalDate;
    }

    public void setArrivalDate(String arrivalDate) {
        this.arrivalDate = arrivalDate;
    }

    public String getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(String departureTime) {
        this.departureTime = departureTime;
    }

    public String getArrivalTime() {
        return arrivalTime;
    }

    public void setArrivalTime(String arrivalTime) {
        this.arrivalTime = arrivalTime;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public SeatInfo getSeats() {
        return seats;
    }

    public void setSeats(SeatInfo seats) {
        this.seats = seats;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getStatusText() {
        return statusText;
    }

    public void setStatusText(String statusText) {
        this.statusText = statusText;
    }
}
