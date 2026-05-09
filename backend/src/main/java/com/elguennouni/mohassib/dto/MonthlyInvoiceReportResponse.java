package com.elguennouni.mohassib.dto;

import java.math.BigDecimal;
import java.util.List;

public record MonthlyInvoiceReportResponse(
        int year,
        List<MonthBucket> months,
        BigDecimal totalRevenue,
        BigDecimal totalTva,
        long totalInvoiceCount,
        long paidInvoiceCount,
        BigDecimal paidAmount,
        long outstandingInvoiceCount,
        BigDecimal outstandingAmount
) {
    public record MonthBucket(
            int month,
            long invoiceCount,
            BigDecimal revenue,
            BigDecimal tva,
            long paidCount,
            BigDecimal paidAmount
    ) {}
}
