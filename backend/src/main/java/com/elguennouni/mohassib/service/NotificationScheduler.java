package com.elguennouni.mohassib.service;

import com.elguennouni.mohassib.entity.NotificationType;
import com.elguennouni.mohassib.repository.CompanyRepository;
import com.elguennouni.mohassib.repository.InvoiceRepository;
import com.elguennouni.mohassib.repository.PayrollRepository;
import com.elguennouni.mohassib.repository.TVADeclarationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;

/**
 * Periodically inspects each tenant's state and emits notifications.
 *
 * Each scheduler builds a deterministic dedupeKey so re-running the same job
 * within the {@code NotificationService} dedupe window is a no-op. This keeps
 * us safe against missed cron ticks and post-restart catch-up runs.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationScheduler {

    private final CompanyRepository companyRepository;
    private final InvoiceRepository invoiceRepository;
    private final PayrollRepository payrollRepository;
    private final TVADeclarationRepository tvaDeclarationRepository;
    private final NotificationService notificationService;

    /**
     * Each weekday at 08:00: per company, surface overdue invoices and
     * invoices coming due within the next 3 days.
     */
    @Scheduled(cron = "0 0 8 * * MON-FRI")
    @Transactional
    public void invoiceAlerts() {
        LocalDate today = LocalDate.now();
        LocalDate inThreeDays = today.plusDays(3);

        for (Object[] row : companyRepository.findAllIdAndUserId()) {
            Long companyId = (Long) row[0];
            Long userId = (Long) row[1];

            long overdue = invoiceRepository.countOverdue(companyId);
            if (overdue > 0) {
                String dedupeKey = "OVERDUE_INVOICES:" + today;
                notificationService.create(
                        companyId,
                        userId,
                        NotificationType.OVERDUE_INVOICES,
                        "Factures en retard",
                        overdue == 1
                                ? "Une facture est en retard de paiement."
                                : overdue + " factures sont en retard de paiement.",
                        "/factures",
                        dedupeKey
                );
            }

            long dueSoon = invoiceRepository.countDueBetween(companyId, today, inThreeDays);
            if (dueSoon > 0) {
                String dedupeKey = "INVOICE_DUE_SOON:" + today;
                notificationService.create(
                        companyId,
                        userId,
                        NotificationType.INVOICE_DUE_SOON,
                        "Echeances proches",
                        dueSoon == 1
                                ? "Une facture arrive a echeance dans les 3 prochains jours."
                                : dueSoon + " factures arrivent a echeance dans les 3 prochains jours.",
                        "/factures",
                        dedupeKey
                );
            }
        }
    }

    /**
     * Around the 25th of each month at 09:00: remind tenants to file the
     * previous month's TVA declaration if they haven't already.
     */
    @Scheduled(cron = "0 0 9 25-28 * *")
    @Transactional
    public void tvaDeclarationReminder() {
        YearMonth previous = YearMonth.now().minusMonths(1);
        int year = previous.getYear();
        int month = previous.getMonthValue();

        for (Object[] row : companyRepository.findAllIdAndUserId()) {
            Long companyId = (Long) row[0];
            Long userId = (Long) row[1];

            boolean alreadyFiled = tvaDeclarationRepository
                    .findByCompanyIdAndMonthAndYear(companyId, month, year).isPresent();
            if (alreadyFiled) continue;

            String dedupeKey = "TVA_DECLARATION_REMINDER:" + year + "-" + month;
            notificationService.create(
                    companyId,
                    userId,
                    NotificationType.TVA_DECLARATION_REMINDER,
                    "Declaration TVA a effectuer",
                    "La declaration TVA de " + frenchMonth(month) + " " + year +
                            " n'a pas encore ete generee.",
                    "/tva",
                    dedupeKey
            );
        }
    }

    /**
     * On the 1st of each month at 09:00: remind tenants to process the
     * previous month's payroll if they haven't already.
     */
    @Scheduled(cron = "0 0 9 1 * *")
    @Transactional
    public void payrollReminder() {
        YearMonth previous = YearMonth.now().minusMonths(1);
        int year = previous.getYear();
        int month = previous.getMonthValue();

        for (Object[] row : companyRepository.findAllIdAndUserId()) {
            Long companyId = (Long) row[0];
            Long userId = (Long) row[1];

            boolean alreadyProcessed = payrollRepository
                    .existsByCompanyIdAndMonthAndYear(companyId, month, year);
            if (alreadyProcessed) continue;

            String dedupeKey = "PAYROLL_REMINDER:" + year + "-" + month;
            notificationService.create(
                    companyId,
                    userId,
                    NotificationType.PAYROLL_REMINDER,
                    "Paie mensuelle a traiter",
                    "La paie de " + frenchMonth(month) + " " + year +
                            " n'a pas encore ete preparee.",
                    "/paie",
                    dedupeKey
            );
        }
    }

    private static String frenchMonth(int month) {
        return switch (month) {
            case 1 -> "janvier";
            case 2 -> "fevrier";
            case 3 -> "mars";
            case 4 -> "avril";
            case 5 -> "mai";
            case 6 -> "juin";
            case 7 -> "juillet";
            case 8 -> "aout";
            case 9 -> "septembre";
            case 10 -> "octobre";
            case 11 -> "novembre";
            case 12 -> "decembre";
            default -> String.valueOf(month);
        };
    }
}
