package com.elguennouni.mohassib.service;

import com.elguennouni.mohassib.entity.Expense;
import com.elguennouni.mohassib.entity.Invoice;
import com.elguennouni.mohassib.entity.InvoiceLineItem;
import com.elguennouni.mohassib.entity.TVAEntry;
import com.elguennouni.mohassib.entity.TVAEntrySourceType;
import com.elguennouni.mohassib.entity.TVAEntryType;
import com.elguennouni.mohassib.repository.TVAEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Encapsulates writes to the tva_entries table. Other services (Invoice, Expense)
 * call into this when their domain events should be reflected as TVA entries.
 */
@Service
@RequiredArgsConstructor
public class TVAEntryService {

    private final TVAEntryRepository tvaEntryRepository;

    /**
     * Creates one entry per (invoice, TVA rate) when an invoice is sent.
     * Lines at the same rate are aggregated to keep the entry count low.
     */
    @Transactional
    public void recordSalesForInvoice(Invoice invoice) {
        // First, clean any pre-existing entries for this invoice (defensive).
        tvaEntryRepository.deleteBySourceTypeAndSourceId(TVAEntrySourceType.INVOICE, invoice.getId());

        // Aggregate by rate using a stable scale-2 rate as the key.
        Map<BigDecimal, BigDecimal[]> byRate = new LinkedHashMap<>();
        for (InvoiceLineItem line : invoice.getLineItems()) {
            BigDecimal rate = line.getTvaRate().setScale(2, RoundingMode.HALF_UP).stripTrailingZeros();
            BigDecimal rateKey = rate.compareTo(BigDecimal.ZERO) == 0 ? BigDecimal.ZERO : rate;
            BigDecimal[] sums = byRate.computeIfAbsent(rateKey, k -> new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
            sums[0] = sums[0].add(line.getLineSubtotal());
            sums[1] = sums[1].add(line.getLineTva());
        }

        for (Map.Entry<BigDecimal, BigDecimal[]> entry : byRate.entrySet()) {
            TVAEntry record = TVAEntry.builder()
                    .companyId(invoice.getCompanyId())
                    .type(TVAEntryType.SALES)
                    .sourceType(TVAEntrySourceType.INVOICE)
                    .sourceId(invoice.getId())
                    .entryDate(invoice.getInvoiceDate())
                    .baseAmount(entry.getValue()[0].setScale(2, RoundingMode.HALF_UP))
                    .tvaRate(entry.getKey().setScale(2, RoundingMode.HALF_UP))
                    .tvaAmount(entry.getValue()[1].setScale(2, RoundingMode.HALF_UP))
                    .description("Facture " + invoice.getInvoiceNumber() + " - " + invoice.getClientName())
                    .build();
            tvaEntryRepository.save(record);
        }
    }

    @Transactional
    public void removeForInvoice(Long invoiceId) {
        tvaEntryRepository.deleteBySourceTypeAndSourceId(TVAEntrySourceType.INVOICE, invoiceId);
    }

    @Transactional
    public void recordExpense(Expense expense) {
        tvaEntryRepository.deleteBySourceTypeAndSourceId(TVAEntrySourceType.EXPENSE, expense.getId());

        TVAEntry record = TVAEntry.builder()
                .companyId(expense.getCompanyId())
                .type(TVAEntryType.EXPENSES)
                .sourceType(TVAEntrySourceType.EXPENSE)
                .sourceId(expense.getId())
                .entryDate(expense.getExpenseDate())
                .baseAmount(expense.getBaseAmount())
                .tvaRate(expense.getTvaRate())
                .tvaAmount(expense.getTvaAmount())
                .description(buildExpenseDescription(expense))
                .build();
        tvaEntryRepository.save(record);
    }

    @Transactional
    public void removeForExpense(Long expenseId) {
        tvaEntryRepository.deleteBySourceTypeAndSourceId(TVAEntrySourceType.EXPENSE, expenseId);
    }

    @Transactional(readOnly = true)
    public List<TVAEntry> findForCompanyInRange(Long companyId, java.time.LocalDate from, java.time.LocalDate to) {
        return tvaEntryRepository.findByCompanyIdAndDateRange(companyId, from, to);
    }

    private static String buildExpenseDescription(Expense expense) {
        StringBuilder sb = new StringBuilder("Dépense");
        if (expense.getVendorName() != null && !expense.getVendorName().isBlank()) {
            sb.append(" — ").append(expense.getVendorName());
        }
        if (expense.getCategory() != null && !expense.getCategory().isBlank()) {
            sb.append(" (").append(expense.getCategory()).append(")");
        }
        return sb.toString();
    }
}
