package com.elguennouni.mohassib.dto;

import com.elguennouni.mohassib.entity.Payroll;
import com.elguennouni.mohassib.entity.PayrollStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PayrollSummaryResponse(
        Long id,
        Integer month,
        Integer year,
        PayrollStatus status,
        Integer employeeCount,
        BigDecimal totalGrossSalary,
        BigDecimal totalCnssDeduction,
        BigDecimal totalIrDeduction,
        BigDecimal totalNetSalary,
        LocalDateTime processedAt,
        LocalDateTime createdAt
) {
    public static PayrollSummaryResponse from(Payroll p) {
        return new PayrollSummaryResponse(
                p.getId(),
                p.getMonth(),
                p.getYear(),
                p.getStatus(),
                p.getEmployeeCount(),
                p.getTotalGrossSalary(),
                p.getTotalCnssDeduction(),
                p.getTotalIrDeduction(),
                p.getTotalNetSalary(),
                p.getProcessedAt(),
                p.getCreatedAt()
        );
    }
}
