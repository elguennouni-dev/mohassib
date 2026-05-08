package com.elguennouni.mohassib.dto;

import com.elguennouni.mohassib.entity.TVADeclaration;
import com.elguennouni.mohassib.entity.TVADeclarationStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TVADeclarationResponse(
        Long id,
        Integer month,
        Integer year,
        BigDecimal salesBase,
        BigDecimal tvaCollected,
        BigDecimal expensesBase,
        BigDecimal tvaDeductible,
        BigDecimal tvaToPay,
        TVADeclarationStatus status,
        LocalDate submissionDate,
        LocalDate paymentDate,
        String referenceNumber,
        String notes,
        LocalDateTime generatedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static TVADeclarationResponse from(TVADeclaration d) {
        return new TVADeclarationResponse(
                d.getId(),
                d.getMonth(),
                d.getYear(),
                d.getSalesBase(),
                d.getTvaCollected(),
                d.getExpensesBase(),
                d.getTvaDeductible(),
                d.getTvaToPay(),
                d.getStatus(),
                d.getSubmissionDate(),
                d.getPaymentDate(),
                d.getReferenceNumber(),
                d.getNotes(),
                d.getGeneratedAt(),
                d.getCreatedAt(),
                d.getUpdatedAt()
        );
    }
}
