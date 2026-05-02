package com.elguennouni.mohassib.dto;

import com.elguennouni.mohassib.entity.Invoice;
import com.elguennouni.mohassib.entity.InvoiceStatus;
import com.elguennouni.mohassib.entity.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record InvoiceSummaryResponse(
        Long id,
        String invoiceNumber,
        Long clientId,
        String clientName,
        LocalDate invoiceDate,
        LocalDate dueDate,
        BigDecimal totalAmount,
        InvoiceStatus status,
        PaymentStatus paymentStatus
) {
    public static InvoiceSummaryResponse from(Invoice i) {
        return new InvoiceSummaryResponse(
                i.getId(),
                i.getInvoiceNumber(),
                i.getClientId(),
                i.getClientName(),
                i.getInvoiceDate(),
                i.getDueDate(),
                i.getTotalAmount(),
                i.getStatus(),
                i.getPaymentStatus()
        );
    }
}
