package com.elguennouni.mohassib.dto;

import com.elguennouni.mohassib.entity.SalarySlip;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SalarySlipResponse(
        Long id,
        Long payrollId,
        Long employeeId,
        String employeeFirstName,
        String employeeLastName,
        String employeeEmail,
        String employeeCinNumber,
        String employeeCnssNumber,
        String employeePosition,
        BigDecimal baseSalary,
        BigDecimal bonuses,
        BigDecimal allowances,
        BigDecimal grossSalary,
        BigDecimal cnssDeduction,
        BigDecimal irDeduction,
        BigDecimal otherDeductions,
        BigDecimal totalDeductions,
        BigDecimal netSalary,
        LocalDateTime sentAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static SalarySlipResponse from(SalarySlip s) {
        return new SalarySlipResponse(
                s.getId(),
                s.getPayrollId(),
                s.getEmployeeId(),
                s.getEmployeeFirstName(),
                s.getEmployeeLastName(),
                s.getEmployeeEmail(),
                s.getEmployeeCinNumber(),
                s.getEmployeeCnssNumber(),
                s.getEmployeePosition(),
                s.getBaseSalary(),
                s.getBonuses(),
                s.getAllowances(),
                s.getGrossSalary(),
                s.getCnssDeduction(),
                s.getIrDeduction(),
                s.getOtherDeductions(),
                s.getTotalDeductions(),
                s.getNetSalary(),
                s.getSentAt(),
                s.getCreatedAt(),
                s.getUpdatedAt()
        );
    }
}
