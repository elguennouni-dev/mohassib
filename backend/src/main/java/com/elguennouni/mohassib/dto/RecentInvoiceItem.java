package com.elguennouni.mohassib.dto;

import com.elguennouni.mohassib.entity.Invoice;
import com.elguennouni.mohassib.entity.InvoiceStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RecentInvoiceItem(
        Long id,
        String invoiceNumber,
        String clientName,
        LocalDate invoiceDate,
        BigDecimal totalAmount,
        InvoiceStatus status
) {
    public static RecentInvoiceItem from(Invoice i) {
        return new RecentInvoiceItem(
                i.getId(),
                i.getInvoiceNumber(),
                i.getClientName(),
                i.getInvoiceDate(),
                i.getTotalAmount(),
                i.getStatus()
        );
    }
}
