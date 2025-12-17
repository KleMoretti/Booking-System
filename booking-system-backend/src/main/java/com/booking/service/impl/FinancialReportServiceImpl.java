package com.booking.service.impl;

import com.booking.dto.FinancialReportDTO;
import com.booking.dto.FinancialSummaryDTO;
import com.booking.entity.BalanceChange;
import com.booking.mapper.BalanceChangeMapper;
import com.booking.service.FinancialReportService;
import com.booking.vo.FinancialReportVO;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

@Service
public class FinancialReportServiceImpl implements FinancialReportService {

    @Resource
    private BalanceChangeMapper balanceChangeMapper;

    @Override
    public FinancialReportVO getFinancialReport(LocalDate startDate, LocalDate endDate, String reportType) {
        if (startDate == null || endDate == null || endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("日期范围不合法");
        }
        if (reportType == null || reportType.trim().isEmpty()) {
            reportType = "daily";
        }

        LocalDateTime startTime = startDate.atStartOfDay();
        LocalDateTime endTime = endDate.plusDays(1).atStartOfDay();

        List<BalanceChange> changes = balanceChangeMapper.findByTimeRange(startTime, endTime);

        Map<LocalDate, PeriodStats> statsMap = new TreeMap<>();
        Map<LocalDate, Set<String>> periodOrderNumbers = new HashMap<>();
        Map<LocalDate, Set<String>> periodRefundOrderNumbers = new HashMap<>();

        for (BalanceChange change : changes) {
            if (change == null || change.getChangeType() == null || change.getCreateTime() == null) {
                continue;
            }

            LocalDate date = change.getCreateTime().toLocalDate();
            LocalDate periodDate = adjustDateForReportType(date, reportType);

            PeriodStats stats = statsMap.computeIfAbsent(periodDate, d -> new PeriodStats());
            Set<String> orderSet = periodOrderNumbers.computeIfAbsent(periodDate, d -> new HashSet<>());
            Set<String> refundSet = periodRefundOrderNumbers.computeIfAbsent(periodDate, d -> new HashSet<>());

            BigDecimal amount = change.getChangeAmount();
            if (amount == null) {
                amount = BigDecimal.ZERO;
            }
            byte type = change.getChangeType();
            String note = change.getNote();
            if (note == null) {
                note = "";
            }

            if (type == 1) {
                BigDecimal value = amount.abs();
                stats.totalSales = stats.totalSales.add(value);

                if (note.startsWith("支付订单")) {
                    String orderNumber = note.substring("支付订单".length());
                    if (!orderNumber.isEmpty()) {
                        orderSet.add(orderNumber);
                    }
                }
            } else if (type == 2) {
                BigDecimal value = amount.abs();
                stats.totalRefund = stats.totalRefund.add(value);

                if (note.startsWith("退票订单")) {
                    int prefixLen = "退票订单".length();
                    int commaIndex = note.indexOf("，", prefixLen);
                    String orderNumber;
                    if (commaIndex > prefixLen) {
                        orderNumber = note.substring(prefixLen, commaIndex);
                    } else {
                        orderNumber = note.substring(prefixLen);
                    }
                    if (!orderNumber.isEmpty()) {
                        refundSet.add(orderNumber);
                    }
                } else if (note.startsWith("车次取消自动退款，订单")) {
                    String prefix = "车次取消自动退款，订单";
                    String orderNumber = note.substring(prefix.length());
                    if (!orderNumber.isEmpty()) {
                        refundSet.add(orderNumber);
                    }
                }
            }
        }

        List<FinancialReportDTO> details = new ArrayList<>();
        FinancialSummaryDTO summary = new FinancialSummaryDTO();
        summary.setTotalSales(BigDecimal.ZERO);
        summary.setTotalRefund(BigDecimal.ZERO);
        summary.setNetIncome(BigDecimal.ZERO);
        summary.setOrderCount(0);
        summary.setRefundCount(0);

        for (Map.Entry<LocalDate, PeriodStats> entry : statsMap.entrySet()) {
            LocalDate periodDate = entry.getKey();
            PeriodStats stats = entry.getValue();

            Set<String> orderNumbers = periodOrderNumbers.getOrDefault(periodDate, Collections.emptySet());
            Set<String> refundNumbers = periodRefundOrderNumbers.getOrDefault(periodDate, Collections.emptySet());

            FinancialReportDTO dto = new FinancialReportDTO();
            dto.setDate(periodDate);
            dto.setSales(stats.totalSales);
            dto.setRefund(stats.totalRefund);
            dto.setNetIncome(stats.totalSales.subtract(stats.totalRefund));
            dto.setOrderCount(orderNumbers.size());
            dto.setRefundCount(refundNumbers.size());

            details.add(dto);

            summary.setTotalSales(summary.getTotalSales().add(dto.getSales()));
            summary.setTotalRefund(summary.getTotalRefund().add(dto.getRefund()));
            summary.setNetIncome(summary.getNetIncome().add(dto.getNetIncome()));
            summary.setOrderCount(summary.getOrderCount() + dto.getOrderCount());
            summary.setRefundCount(summary.getRefundCount() + dto.getRefundCount());
        }

        details.sort(Comparator.comparing(FinancialReportDTO::getDate));

        for (int i = 0; i < details.size(); i++) {
            FinancialReportDTO current = details.get(i);
            if (i == 0) {
                current.setGrowth(null);
                continue;
            }
            FinancialReportDTO previous = details.get(i - 1);
            BigDecimal prevIncome = previous.getNetIncome();
            BigDecimal currIncome = current.getNetIncome();
            if (prevIncome == null || prevIncome.compareTo(BigDecimal.ZERO) == 0 || currIncome == null) {
                current.setGrowth(null);
            } else {
                BigDecimal diff = currIncome.subtract(prevIncome);
                BigDecimal percent = diff.multiply(BigDecimal.valueOf(100))
                        .divide(prevIncome, 4, RoundingMode.HALF_UP);
                current.setGrowth(percent);
            }
        }

        FinancialReportVO vo = new FinancialReportVO();
        vo.setSummary(summary);
        vo.setDetails(details);
        return vo;
    }

    private LocalDate adjustDateForReportType(LocalDate date, String reportType) {
        if ("weekly".equalsIgnoreCase(reportType)) {
            WeekFields weekFields = WeekFields.of(Locale.getDefault());
            return date.with(weekFields.dayOfWeek(), 1);
        } else if ("monthly".equalsIgnoreCase(reportType)) {
            return date.withDayOfMonth(1);
        }
        return date;
    }

    private static class PeriodStats {
        private BigDecimal totalSales = BigDecimal.ZERO;
        private BigDecimal totalRefund = BigDecimal.ZERO;
    }
}
