package com.booking.dto;

import com.alibaba.excel.annotation.ExcelProperty;

import java.math.BigDecimal;

/**
 * Excel 导入的车次 DTO
 */
public class TripExcelDTO {

    @ExcelProperty(value = "车次号", index = 0)
    private String tripNumber;

    @ExcelProperty(value = "车辆信息", index = 1)
    private String vehicleInfo;

    @ExcelProperty(value = "总座位数", index = 2)
    private Integer totalSeats;

    @ExcelProperty(value = "出发站", index = 3)
    private String departureStationName;

    @ExcelProperty(value = "到达站", index = 4)
    private String arrivalStationName;

    @ExcelProperty(value = "出发日期", index = 5)
    private String departureDate;

    @ExcelProperty(value = "出发时间", index = 6)
    private String departureTime;

    @ExcelProperty(value = "到达日期", index = 7)
    private String arrivalDate;

    @ExcelProperty(value = "到达时间", index = 8)
    private String arrivalTime;

    @ExcelProperty(value = "基础票价", index = 9)
    private BigDecimal basePrice;

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

    public Integer getTotalSeats() {
        return totalSeats;
    }

    public void setTotalSeats(Integer totalSeats) {
        this.totalSeats = totalSeats;
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

    public String getDepartureDate() {
        return departureDate;
    }

    public void setDepartureDate(String departureDate) {
        this.departureDate = departureDate;
    }

    public String getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(String departureTime) {
        this.departureTime = departureTime;
    }

    public String getArrivalDate() {
        return arrivalDate;
    }

    public void setArrivalDate(String arrivalDate) {
        this.arrivalDate = arrivalDate;
    }

    public String getArrivalTime() {
        return arrivalTime;
    }

    public void setArrivalTime(String arrivalTime) {
        this.arrivalTime = arrivalTime;
    }

    public BigDecimal getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(BigDecimal basePrice) {
        this.basePrice = basePrice;
    }
}
