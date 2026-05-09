package com.elguennouni.mohassib.dto;

import java.math.BigDecimal;
import java.util.List;

public record AnnualPayrollReportResponse(
        int year,
        List<MonthBucket> months,
        BigDecimal totalGross,
        BigDecimal totalCnss,
        BigDecimal totalIr,
        BigDecimal totalNet,
        long totalEmployeeMonths
) {
    public record MonthBucket(
            int month,
            int employeeCount,
            BigDecimal gross,
            BigDecimal cnss,
            BigDecimal ir,
            BigDecimal net,
            String status,
            boolean exists
    ) {}
}
