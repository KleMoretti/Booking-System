package com.booking.service;

import com.booking.vo.FinancialReportVO;

import java.time.LocalDate;

public interface FinancialReportService {
    FinancialReportVO getFinancialReport(LocalDate startDate, LocalDate endDate, String reportType);
}
