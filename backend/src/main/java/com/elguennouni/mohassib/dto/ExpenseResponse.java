package com.elguennouni.mohassib.dto;

import com.elguennouni.mohassib.entity.Expense;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ExpenseResponse(
        Long id,
        LocalDate expenseDate,
        String vendorName,
        String category,
        BigDecimal baseAmount,
        BigDecimal tvaRate,
        BigDecimal tvaAmount,
        BigDecimal totalAmount,
        String referenceNumber,
        String description,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static ExpenseResponse from(Expense e) {
        return new ExpenseResponse(
                e.getId(),
                e.getExpenseDate(),
                e.getVendorName(),
                e.getCategory(),
                e.getBaseAmount(),
                e.getTvaRate(),
                e.getTvaAmount(),
                e.getTotalAmount(),
                e.getReferenceNumber(),
                e.getDescription(),
                e.getCreatedAt(),
                e.getUpdatedAt()
        );
    }
}
