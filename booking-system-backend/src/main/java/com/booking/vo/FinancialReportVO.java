package com.booking.vo;

import com.booking.dto.FinancialReportDTO;
import com.booking.dto.FinancialSummaryDTO;
import java.util.List;

/**
 * 财务报表返回VO
 */
public class FinancialReportVO {
    private FinancialSummaryDTO summary;
    private List<FinancialReportDTO> details;

    public FinancialSummaryDTO getSummary() {
        return summary;
    }

    public void setSummary(FinancialSummaryDTO summary) {
        this.summary = summary;
    }

    public List<FinancialReportDTO> getDetails() {
        return details;
    }

    public void setDetails(List<FinancialReportDTO> details) {
        this.details = details;
    }
}
