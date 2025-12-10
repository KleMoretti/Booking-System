package com.booking.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 订单视图对象
 */
public class OrderVO {
    private Long orderId;
    private String orderNumber;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private Integer orderStatus;
    private String orderStatusText;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime payTime;
    
    // 车次信息
    private String tripNumber;
    private String departureStation;
    private String arrivalStation;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime departureTime;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime arrivalTime;
    
    // 车票列表
    private List<TicketInfo> tickets;
    
    public static class TicketInfo {
        private Long ticketId;
        private String passengerName;
        private String passengerIdCard;
        private String seatNumber;
        private BigDecimal price;
        private Integer ticketStatus;
        private String ticketStatusText;

        public Long getTicketId() {
            return ticketId;
        }

        public void setTicketId(Long ticketId) {
            this.ticketId = ticketId;
        }

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

        public String getSeatNumber() {
            return seatNumber;
        }

        public void setSeatNumber(String seatNumber) {
            this.seatNumber = seatNumber;
        }

        public BigDecimal getPrice() {
            return price;
        }

        public void setPrice(BigDecimal price) {
            this.price = price;
        }

        public Integer getTicketStatus() {
            return ticketStatus;
        }

        public void setTicketStatus(Integer ticketStatus) {
            this.ticketStatus = ticketStatus;
            // 设置状态文本
            if (ticketStatus != null) {
                switch (ticketStatus) {
                    case 0:
                        this.ticketStatusText = "未使用";
                        break;
                    case 1:
                        this.ticketStatusText = "已使用";
                        break;
                    case 2:
                        this.ticketStatusText = "已退票";
                        break;
                    default:
                        this.ticketStatusText = "未知";
                }
            }
        }

        public String getTicketStatusText() {
            return ticketStatusText;
        }

        public void setTicketStatusText(String ticketStatusText) {
            this.ticketStatusText = ticketStatusText;
        }
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(BigDecimal paidAmount) {
        this.paidAmount = paidAmount;
    }

    public Integer getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(Integer orderStatus) {
        this.orderStatus = orderStatus;
        // 设置状态文本
        if (orderStatus != null) {
            switch (orderStatus) {
                case 0:
                    this.orderStatusText = "待支付";
                    break;
                case 1:
                    this.orderStatusText = "已支付";
                    break;
                case 2:
                    this.orderStatusText = "已取消";
                    break;
                default:
                    this.orderStatusText = "未知";
            }
        }
    }

    public String getOrderStatusText() {
        return orderStatusText;
    }

    public void setOrderStatusText(String orderStatusText) {
        this.orderStatusText = orderStatusText;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public LocalDateTime getPayTime() {
        return payTime;
    }

    public void setPayTime(LocalDateTime payTime) {
        this.payTime = payTime;
    }

    public String getTripNumber() {
        return tripNumber;
    }

    public void setTripNumber(String tripNumber) {
        this.tripNumber = tripNumber;
    }

    public String getDepartureStation() {
        return departureStation;
    }

    public void setDepartureStation(String departureStation) {
        this.departureStation = departureStation;
    }

    public String getArrivalStation() {
        return arrivalStation;
    }

    public void setArrivalStation(String arrivalStation) {
        this.arrivalStation = arrivalStation;
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

    public List<TicketInfo> getTickets() {
        return tickets;
    }

    public void setTickets(List<TicketInfo> tickets) {
        this.tickets = tickets;
    }
}
