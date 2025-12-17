package com.booking.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class FinancialReportDTO {
    private LocalDate date;
    private BigDecimal sales;
    private BigDecimal refund;
    private BigDecimal netIncome;
    private Integer orderCount;
    private Integer refundCount;
    private BigDecimal growth;

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public BigDecimal getSales() {
        return sales;
    }

    public void setSales(BigDecimal sales) {
        this.sales = sales;
    }

    public BigDecimal getRefund() {
        return refund;
    }

    public void setRefund(BigDecimal refund) {
        this.refund = refund;
    }

    public BigDecimal getNetIncome() {
        return netIncome;
    }

    public void setNetIncome(BigDecimal netIncome) {
        this.netIncome = netIncome;
    }

    public Integer getOrderCount() {
        return orderCount;
    }

    public void setOrderCount(Integer orderCount) {
        this.orderCount = orderCount;
    }

    public Integer getRefundCount() {
        return refundCount;
    }

    public void setRefundCount(Integer refundCount) {
        this.refundCount = refundCount;
    }

    public BigDecimal getGrowth() {
        return growth;
    }

    public void setGrowth(BigDecimal growth) {
        this.growth = growth;
    }
}

