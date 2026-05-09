package com.elguennouni.mohassib.service;

import com.elguennouni.mohassib.entity.Company;
import com.elguennouni.mohassib.entity.Invoice;
import com.elguennouni.mohassib.entity.Payroll;
import com.elguennouni.mohassib.entity.SalarySlip;
import com.elguennouni.mohassib.exception.EmailSendingException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class EmailService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final String fromName;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${spring.mail.username}") String fromAddress,
            @Value("${mohassib.mail.from-name:Mohassib}") String fromName
    ) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
        this.fromName = fromName;
    }

    public void sendInvoiceEmail(
            Invoice invoice,
            Company company,
            byte[] pdf,
            String recipientEmail,
            String customSubject,
            String customMessage
    ) {
        sendWithAttachment(
                invoice,
                company,
                pdf,
                recipientEmail,
                buildSubject(invoice, company, customSubject),
                buildBody(invoice, company, customMessage)
        );
    }

    public void sendSalarySlipEmail(
            SalarySlip slip,
            Payroll payroll,
            Company company,
            byte[] pdf,
            String recipientEmail
    ) {
        String filename = "bulletin-" + payroll.getYear() + "-"
                + String.format("%02d", payroll.getMonth()) + "-"
                + slip.getEmployeeLastName().toLowerCase().replaceAll("\\s+", "-")
                + ".pdf";
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress, fromName);
            helper.setReplyTo(company.getEmail());
            helper.setTo(recipientEmail);
            helper.setSubject(buildSalarySlipSubject(slip, payroll));
            helper.setText(buildSalarySlipBody(slip, payroll, company), true);
            helper.addAttachment(filename, new ByteArrayResource(pdf));

            mailSender.send(message);
        } catch (MessagingException | UnsupportedEncodingException | MailException ex) {
            throw new EmailSendingException(
                    "L'envoi du bulletin de paie a echoue pour " + slip.getEmployeeFirstName()
                            + " " + slip.getEmployeeLastName() + ".",
                    ex
            );
        }
    }

    private String buildSalarySlipSubject(SalarySlip slip, Payroll payroll) {
        return "Bulletin de paie " + formatPeriod(payroll.getMonth(), payroll.getYear());
    }

    private String buildSalarySlipBody(SalarySlip slip, Payroll payroll, Company company) {
        return """
                <div style="font-family: Arial, sans-serif; font-size: 14px; color: #1a1a1a; line-height: 1.5;">
                  <p>Bonjour %s,</p>
                  <p>Veuillez trouver ci-joint votre bulletin de paie pour la periode <strong>%s</strong>.</p>
                  <p>Salaire net : <strong>%s</strong></p>
                  <p>Pour toute question, n'hesitez pas a nous contacter.</p>
                  <p>Cordialement,<br>
                  <strong>%s</strong><br>
                  %s</p>
                </div>
                """.formatted(
                        escape(slip.getEmployeeFirstName()),
                        formatPeriod(payroll.getMonth(), payroll.getYear()),
                        formatMoney(slip.getNetSalary()),
                        escape(company.getName()),
                        escape(company.getEmail())
                );
    }

    private static final String[] MONTH_NAMES_FR = {
            "janvier", "fevrier", "mars", "avril", "mai", "juin",
            "juillet", "aout", "septembre", "octobre", "novembre", "decembre"
    };

    private static String formatPeriod(int month, int year) {
        String name = (month >= 1 && month <= 12) ? MONTH_NAMES_FR[month - 1] : String.valueOf(month);
        return name + " " + year;
    }

    public void sendInvoiceReminderEmail(
            Invoice invoice,
            Company company,
            byte[] pdf,
            BigDecimal outstandingAmount,
            String recipientEmail,
            String customSubject,
            String customMessage
    ) {
        sendWithAttachment(
                invoice,
                company,
                pdf,
                recipientEmail,
                buildReminderSubject(invoice, customSubject),
                buildReminderBody(invoice, company, outstandingAmount, customMessage)
        );
    }

    private void sendWithAttachment(
            Invoice invoice,
            Company company,
            byte[] pdf,
            String recipientEmail,
            String subject,
            String htmlBody
    ) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress, fromName);
            helper.setReplyTo(company.getEmail());
            helper.setTo(recipientEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            helper.addAttachment(invoice.getInvoiceNumber() + ".pdf", new ByteArrayResource(pdf));

            mailSender.send(message);
        } catch (MessagingException | UnsupportedEncodingException | MailException ex) {
            throw new EmailSendingException(
                    "L'envoi de l'email a echoue. Verifiez l'adresse du destinataire et reessayez.",
                    ex
            );
        }
    }

    private String buildSubject(Invoice invoice, Company company, String custom) {
        if (custom != null && !custom.isBlank()) {
            return custom.trim();
        }
        return "Facture " + invoice.getInvoiceNumber() + " - " + company.getName();
    }

    private String buildBody(Invoice invoice, Company company, String custom) {
        if (custom != null && !custom.isBlank()) {
            return "<div style=\"font-family: Arial, sans-serif; font-size: 14px; color: #1a1a1a;\">"
                    + escapeAndBreak(custom)
                    + "<p style=\"margin-top:24px; color:#5a5a5a; font-size:12px;\">Facture en piece jointe : <strong>"
                    + invoice.getInvoiceNumber()
                    + "</strong></p>"
                    + "</div>";
        }
        return defaultBody(invoice, company);
    }

    private String buildReminderSubject(Invoice invoice, String custom) {
        if (custom != null && !custom.isBlank()) {
            return custom.trim();
        }
        return "Relance : facture " + invoice.getInvoiceNumber();
    }

    private String buildReminderBody(Invoice invoice, Company company, BigDecimal outstandingAmount, String custom) {
        if (custom != null && !custom.isBlank()) {
            return "<div style=\"font-family: Arial, sans-serif; font-size: 14px; color: #1a1a1a;\">"
                    + escapeAndBreak(custom)
                    + "<p style=\"margin-top:24px; color:#5a5a5a; font-size:12px;\">Facture en piece jointe : <strong>"
                    + invoice.getInvoiceNumber()
                    + "</strong></p>"
                    + "</div>";
        }
        return defaultReminderBody(invoice, company, outstandingAmount);
    }

    private String defaultReminderBody(Invoice invoice, Company company, BigDecimal outstandingAmount) {
        long daysOverdue = invoice.getDueDate() != null
                ? java.time.temporal.ChronoUnit.DAYS.between(invoice.getDueDate(), java.time.LocalDate.now())
                : 0L;
        String overdueLine = daysOverdue > 0
                ? "<p>Cette facture est en retard de <strong>" + daysOverdue + " jour" + (daysOverdue > 1 ? "s" : "") + "</strong>.</p>"
                : "";
        String dueLine = invoice.getDueDate() != null
                ? "<p>Echeance initiale : <strong>" + invoice.getDueDate().format(DATE_FORMAT) + "</strong></p>"
                : "";
        BigDecimal amountToShow = outstandingAmount != null ? outstandingAmount : invoice.getTotalAmount();

        return """
                <div style="font-family: Arial, sans-serif; font-size: 14px; color: #1a1a1a; line-height: 1.5;">
                  <p>Bonjour,</p>
                  <p>Sauf erreur de notre part, la facture <strong>%s</strong> emise le %s pour un montant de <strong>%s</strong> n'a pas encore ete entierement reglee.</p>
                  <p>Reste a payer : <strong>%s</strong></p>
                  %s
                  %s
                  <p>Nous vous remercions de bien vouloir effectuer le reglement dans les meilleurs delais.</p>
                  <p>Cordialement,<br>
                  <strong>%s</strong><br>
                  %s | %s</p>
                </div>
                """.formatted(
                        escape(invoice.getInvoiceNumber()),
                        invoice.getInvoiceDate().format(DATE_FORMAT),
                        formatMoney(invoice.getTotalAmount()),
                        formatMoney(amountToShow),
                        dueLine,
                        overdueLine,
                        escape(company.getName()),
                        escape(company.getEmail()),
                        escape(company.getPhone())
                );
    }

    private String defaultBody(Invoice invoice, Company company) {
        String dueLine = invoice.getDueDate() != null
                ? "<p>Echeance de paiement : <strong>" + invoice.getDueDate().format(DATE_FORMAT) + "</strong></p>"
                : "";
        String paymentTermsLine = (invoice.getPaymentTerms() != null && !invoice.getPaymentTerms().isBlank())
                ? "<p>Conditions de paiement : " + escape(invoice.getPaymentTerms()) + "</p>"
                : "";

        return """
                <div style="font-family: Arial, sans-serif; font-size: 14px; color: #1a1a1a; line-height: 1.5;">
                  <p>Bonjour,</p>
                  <p>Veuillez trouver ci-joint la facture <strong>%s</strong> d'un montant de <strong>%s</strong>.</p>
                  %s
                  %s
                  <p>Cordialement,<br>
                  <strong>%s</strong><br>
                  %s | %s</p>
                </div>
                """.formatted(
                        escape(invoice.getInvoiceNumber()),
                        formatMoney(invoice.getTotalAmount()),
                        dueLine,
                        paymentTermsLine,
                        escape(company.getName()),
                        escape(company.getEmail()),
                        escape(company.getPhone())
                );
    }

    private static String formatMoney(BigDecimal value) {
        if (value == null) return "0,00 MAD";
        DecimalFormatSymbols symbols = new DecimalFormatSymbols(Locale.FRANCE);
        symbols.setDecimalSeparator(',');
        symbols.setGroupingSeparator(' ');
        DecimalFormat fmt = new DecimalFormat("#,##0.00", symbols);
        return fmt.format(value) + " MAD";
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }

    private static String escapeAndBreak(String s) {
        return "<p>" + escape(s).replace("\n", "<br>") + "</p>";
    }
}
