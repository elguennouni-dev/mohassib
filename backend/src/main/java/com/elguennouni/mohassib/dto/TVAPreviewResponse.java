package com.elguennouni.mohassib.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Live preview of the TVA situation for a given month, computed from current
 * TVAEntry rows. Shows breakdowns by rate so the user can sanity-check before
 * generating the official declaration.
 */
public record TVAPreviewResponse(
        Integer month,
        Integer year,
        List<RateBreakdown> salesByRate,
        List<RateBreakdown> expensesByRate,
        BigDecimal salesBase,
        BigDecimal tvaCollected,
        BigDecimal expensesBase,
        BigDecimal tvaDeductible,
        BigDecimal tvaToPay,
        Boolean declarationExists
) {
    public record RateBreakdown(
            BigDecimal tvaRate,
            BigDecimal baseAmount,
            BigDecimal tvaAmount,
            int entryCount
    ) {}
}
