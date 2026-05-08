package com.elguennouni.mohassib.dto;

import java.math.BigDecimal;

/** Pure result of a payroll calculation for a single employee. */
public record SalaryBreakdown(
        BigDecimal baseSalary,
        BigDecimal bonuses,
        BigDecimal allowances,
        BigDecimal grossSalary,
        BigDecimal cnssDeduction,
        BigDecimal irDeduction,
        BigDecimal otherDeductions,
        BigDecimal totalDeductions,
        BigDecimal netSalary
) {}
