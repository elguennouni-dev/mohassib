package com.elguennouni.mohassib.dto;

import com.elguennouni.mohassib.entity.Payroll;
import com.elguennouni.mohassib.entity.PayrollStatus;
import com.elguennouni.mohassib.entity.SalarySlip;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

public record PayrollResponse(
        Long id,
        Integer month,
        Integer year,
        PayrollStatus status,
        Integer employeeCount,
        BigDecimal totalGrossSalary,
        BigDecimal totalCnssDeduction,
        BigDecimal totalIrDeduction,
        BigDecimal totalOtherDeductions,
        BigDecimal totalNetSalary,
        LocalDateTime processedAt,
        String notes,
        List<SalarySlipResponse> slips,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static PayrollResponse from(Payroll p) {
        return from(p, Collections.emptyList());
    }

    public static PayrollResponse from(Payroll p, List<SalarySlip> slips) {
        List<SalarySlipResponse> slipDtos = slips.stream()
                .map(SalarySlipResponse::from)
                .toList();
        return new PayrollResponse(
                p.getId(),
                p.getMonth(),
                p.getYear(),
                p.getStatus(),
                p.getEmployeeCount(),
                p.getTotalGrossSalary(),
                p.getTotalCnssDeduction(),
                p.getTotalIrDeduction(),
                p.getTotalOtherDeductions(),
                p.getTotalNetSalary(),
                p.getProcessedAt(),
                p.getNotes(),
                slipDtos,
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }
}
