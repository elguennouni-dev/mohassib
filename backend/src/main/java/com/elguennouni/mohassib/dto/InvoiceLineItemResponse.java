package com.elguennouni.mohassib.dto;

import com.elguennouni.mohassib.entity.InvoiceLineItem;

import java.math.BigDecimal;

public record InvoiceLineItemResponse(
        Long id,
        Integer lineNumber,
        String description,
        BigDecimal quantity,
        BigDecimal unitPrice,
        BigDecimal tvaRate,
        BigDecimal lineSubtotal,
        BigDecimal lineTva,
        BigDecimal lineTotal
) {
    public static InvoiceLineItemResponse from(InvoiceLineItem line) {
        return new InvoiceLineItemResponse(
                line.getId(),
                line.getLineNumber(),
                line.getDescription(),
                line.getQuantity(),
                line.getUnitPrice(),
                line.getTvaRate(),
                line.getLineSubtotal(),
                line.getLineTva(),
                line.getLineTotal()
        );
    }
}
