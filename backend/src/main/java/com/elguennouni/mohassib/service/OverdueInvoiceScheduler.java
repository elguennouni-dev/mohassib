package com.elguennouni.mohassib.service;

import com.elguennouni.mohassib.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class OverdueInvoiceScheduler {

    private final InvoiceRepository invoiceRepository;

    /**
     * Tous les jours a 01h00, on bascule en OVERDUE les factures envoyees
     * et non payees dont la date d'echeance est depassee.
     */
    @Scheduled(cron = "0 0 1 * * *")
    @Transactional
    public void flagOverdueInvoices() {
        LocalDate today = LocalDate.now();
        int updated = invoiceRepository.flagOverdueAsOf(today);
        if (updated > 0) {
            log.info("Marquage automatique de {} facture(s) en retard (date du jour : {}).", updated, today);
        }
    }
}
