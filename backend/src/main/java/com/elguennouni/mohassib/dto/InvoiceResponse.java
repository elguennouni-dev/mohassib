package com.elguennouni.mohassib.dto;

import com.elguennouni.mohassib.entity.Invoice;
import com.elguennouni.mohassib.entity.InvoiceStatus;
import com.elguennouni.mohassib.entity.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record InvoiceResponse(
        Long id,
        String invoiceNumber,
        Long clientId,
        String clientName,
        LocalDate invoiceDate,
        LocalDate dueDate,
        String paymentTerms,
        String notes,
        BigDecimal netAmount,
        BigDecimal tvaAmount,
        BigDecimal totalAmount,
        InvoiceStatus status,
        PaymentStatus paymentStatus,
        LocalDateTime sentDate,
        List<InvoiceLineItemResponse> lineItems,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static InvoiceResponse from(Invoice i) {
        List<InvoiceLineItemResponse> lines = i.getLineItems().stream()
                .map(InvoiceLineItemResponse::from)
                .toList();
        return new InvoiceResponse(
                i.getId(),
                i.getInvoiceNumber(),
                i.getClientId(),
                i.getClientName(),
                i.getInvoiceDate(),
                i.getDueDate(),
                i.getPaymentTerms(),
                i.getNotes(),
                i.getNetAmount(),
                i.getTvaAmount(),
                i.getTotalAmount(),
                i.getStatus(),
                i.getPaymentStatus(),
                i.getSentDate(),
                lines,
                i.getCreatedAt(),
                i.getUpdatedAt()
        );
    }
}
