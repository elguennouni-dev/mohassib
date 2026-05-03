package com.elguennouni.mohassib.dto;

import com.elguennouni.mohassib.entity.InvoicePayment;
import com.elguennouni.mohassib.entity.PaymentMethod;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record InvoicePaymentResponse(
        Long id,
        Long invoiceId,
        BigDecimal amount,
        PaymentMethod paymentMethod,
        LocalDate paymentDate,
        String referenceNumber,
        String notes,
        LocalDateTime recordedAt
) {
    public static InvoicePaymentResponse from(InvoicePayment p) {
        return new InvoicePaymentResponse(
                p.getId(),
                p.getInvoiceId(),
                p.getAmount(),
                p.getPaymentMethod(),
                p.getPaymentDate(),
                p.getReferenceNumber(),
                p.getNotes(),
                p.getRecordedAt()
        );
    }
}
