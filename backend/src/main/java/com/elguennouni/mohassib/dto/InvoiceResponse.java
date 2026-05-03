package com.elguennouni.mohassib.dto;

import com.elguennouni.mohassib.entity.Invoice;
import com.elguennouni.mohassib.entity.InvoicePayment;
import com.elguennouni.mohassib.entity.InvoiceStatus;
import com.elguennouni.mohassib.entity.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

public record InvoiceResponse(
        Long id,
        String invoiceNumber,
        Long clientId,
        String clientName,
        String clientEmail,
        LocalDate invoiceDate,
        LocalDate dueDate,
        String paymentTerms,
        String notes,
        BigDecimal netAmount,
        BigDecimal tvaAmount,
        BigDecimal totalAmount,
        BigDecimal paidAmount,
        BigDecimal outstandingAmount,
        InvoiceStatus status,
        PaymentStatus paymentStatus,
        LocalDateTime sentDate,
        List<InvoiceLineItemResponse> lineItems,
        List<InvoicePaymentResponse> payments,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static InvoiceResponse from(Invoice i) {
        return from(i, null, BigDecimal.ZERO, Collections.emptyList());
    }

    public static InvoiceResponse from(Invoice i, String clientEmail) {
        return from(i, clientEmail, BigDecimal.ZERO, Collections.emptyList());
    }

    public static InvoiceResponse from(
            Invoice i,
            String clientEmail,
            BigDecimal paidAmount,
            List<InvoicePayment> payments
    ) {
        BigDecimal paid = paidAmount != null ? paidAmount : BigDecimal.ZERO;
        BigDecimal outstanding = i.getTotalAmount().subtract(paid);

        List<InvoiceLineItemResponse> lines = i.getLineItems().stream()
                .map(InvoiceLineItemResponse::from)
                .toList();

        List<InvoicePaymentResponse> paymentDtos = payments.stream()
                .map(InvoicePaymentResponse::from)
                .toList();

        return new InvoiceResponse(
                i.getId(),
                i.getInvoiceNumber(),
                i.getClientId(),
                i.getClientName(),
                clientEmail,
                i.getInvoiceDate(),
                i.getDueDate(),
                i.getPaymentTerms(),
                i.getNotes(),
                i.getNetAmount(),
                i.getTvaAmount(),
                i.getTotalAmount(),
                paid,
                outstanding,
                i.getStatus(),
                i.getPaymentStatus(),
                i.getSentDate(),
                lines,
                paymentDtos,
                i.getCreatedAt(),
                i.getUpdatedAt()
        );
    }
}
