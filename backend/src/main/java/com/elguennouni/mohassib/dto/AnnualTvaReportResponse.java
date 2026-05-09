package com.elguennouni.mohassib.dto;

import java.math.BigDecimal;
import java.util.List;

public record AnnualTvaReportResponse(
        int year,
        List<MonthBucket> months,
        BigDecimal totalSalesBase,
        BigDecimal totalTvaCollected,
        BigDecimal totalExpensesBase,
        BigDecimal totalTvaDeductible,
        BigDecimal totalTvaToPay
) {
    public record MonthBucket(
            int month,
            BigDecimal salesBase,
            BigDecimal tvaCollected,
            BigDecimal expensesBase,
            BigDecimal tvaDeductible,
            BigDecimal tvaToPay,
            String declarationStatus,
            boolean declared
    ) {}
}
