package com.elguennouni.mohassib.service;

import com.elguennouni.mohassib.entity.Company;
import com.elguennouni.mohassib.entity.Invoice;
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
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress, fromName);
            helper.setReplyTo(company.getEmail());
            helper.setTo(recipientEmail);
            helper.setSubject(buildSubject(invoice, company, customSubject));
            helper.setText(buildBody(invoice, company, customMessage), true);
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
