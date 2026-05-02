package com.elguennouni.mohassib.service;

import com.elguennouni.mohassib.entity.Client;
import com.elguennouni.mohassib.entity.Company;
import com.elguennouni.mohassib.entity.Invoice;
import com.elguennouni.mohassib.entity.InvoiceLineItem;
import com.elguennouni.mohassib.exception.PdfGenerationException;
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class InvoicePdfService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private static final Color PRIMARY_COLOR = new Color(15, 77, 58);
    private static final Color MUTED_COLOR = new Color(90, 90, 90);
    private static final Color BORDER_COLOR = new Color(226, 223, 217);

    private static final Font TITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, PRIMARY_COLOR);
    private static final Font COMPANY_NAME_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, PRIMARY_COLOR);
    private static final Font H2_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, MUTED_COLOR);
    private static final Font NORMAL_FONT = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
    private static final Font BOLD_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);
    private static final Font SMALL_FONT = FontFactory.getFont(FontFactory.HELVETICA, 8, MUTED_COLOR);
    private static final Font TABLE_HEADER_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
    private static final Font TOTAL_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.BLACK);

    public byte[] generate(Invoice invoice, Company company, Client client) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 40f, 40f, 40f, 50f);

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            addHeader(document, company, invoice);
            addClientBlock(document, invoice, client);
            addLineItemsTable(document, invoice);
            addTotals(document, invoice);
            addPaymentTerms(document, invoice);
            addNotes(document, invoice);
            addLegalFooter(document, company);

            document.close();
        } catch (Exception ex) {
            throw new PdfGenerationException("Impossible de generer le PDF de la facture.", ex);
        }

        return baos.toByteArray();
    }

    private void addHeader(Document document, Company company, Invoice invoice) {
        PdfPTable header = new PdfPTable(2);
        header.setWidthPercentage(100);
        try {
            header.setWidths(new float[]{60f, 40f});
        } catch (Exception ex) {
            throw new PdfGenerationException("Erreur de mise en page de l'en-tete.", ex);
        }

        PdfPCell left = noBorderCell();
        left.addElement(new Paragraph(company.getName(), COMPANY_NAME_FONT));
        if (company.getTradeName() != null && !company.getTradeName().isBlank()) {
            left.addElement(new Paragraph(company.getTradeName(), SMALL_FONT));
        }
        left.addElement(spacer());
        left.addElement(new Paragraph("ICE: " + company.getIceNumber(), NORMAL_FONT));
        left.addElement(new Paragraph("RC: " + company.getRcNumber(), NORMAL_FONT));
        left.addElement(new Paragraph("CNSS: " + company.getCnssNumber(), NORMAL_FONT));
        left.addElement(new Paragraph(company.getAddress(), NORMAL_FONT));
        String cityLine = (company.getPostalCode() != null && !company.getPostalCode().isBlank())
                ? company.getPostalCode() + " " + company.getCity()
                : company.getCity();
        left.addElement(new Paragraph(cityLine, NORMAL_FONT));
        left.addElement(new Paragraph("Tel: " + company.getPhone(), NORMAL_FONT));
        left.addElement(new Paragraph("Email: " + company.getEmail(), NORMAL_FONT));

        PdfPCell right = noBorderCell();
        Paragraph title = new Paragraph("FACTURE", TITLE_FONT);
        title.setAlignment(Element.ALIGN_RIGHT);
        right.addElement(title);
        right.addElement(spacer());
        Paragraph num = new Paragraph(invoice.getInvoiceNumber(), BOLD_FONT);
        num.setAlignment(Element.ALIGN_RIGHT);
        right.addElement(num);
        right.addElement(spacer());
        Paragraph date = new Paragraph("Date: " + invoice.getInvoiceDate().format(DATE_FORMAT), NORMAL_FONT);
        date.setAlignment(Element.ALIGN_RIGHT);
        right.addElement(date);
        if (invoice.getDueDate() != null) {
            Paragraph due = new Paragraph("Echeance: " + invoice.getDueDate().format(DATE_FORMAT), NORMAL_FONT);
            due.setAlignment(Element.ALIGN_RIGHT);
            right.addElement(due);
        }

        header.addCell(left);
        header.addCell(right);
        header.setSpacingAfter(20f);
        document.add(header);
    }

    private void addClientBlock(Document document, Invoice invoice, Client client) {
        Paragraph label = new Paragraph("FACTURE A", H2_FONT);
        label.setSpacingAfter(4f);
        document.add(label);

        document.add(new Paragraph(invoice.getClientName(), BOLD_FONT));

        if (client != null) {
            if (client.getAddress() != null && !client.getAddress().isBlank()) {
                document.add(new Paragraph(client.getAddress(), NORMAL_FONT));
            }
            if (client.getCity() != null && !client.getCity().isBlank()) {
                String line = (client.getPostalCode() != null && !client.getPostalCode().isBlank())
                        ? client.getPostalCode() + " " + client.getCity()
                        : client.getCity();
                document.add(new Paragraph(line, NORMAL_FONT));
            }
            if (client.getIceNumber() != null && !client.getIceNumber().isBlank()) {
                document.add(new Paragraph("ICE: " + client.getIceNumber(), NORMAL_FONT));
            }
        }

        Paragraph spacer = new Paragraph(" ", NORMAL_FONT);
        spacer.setSpacingAfter(15f);
        document.add(spacer);
    }

    private void addLineItemsTable(Document document, Invoice invoice) {
        PdfPTable table = new PdfPTable(6);
        table.setWidthPercentage(100);
        try {
            table.setWidths(new float[]{42f, 9f, 14f, 9f, 13f, 13f});
        } catch (Exception ex) {
            throw new PdfGenerationException("Erreur de mise en page du tableau.", ex);
        }

        addHeaderCell(table, "Description", Element.ALIGN_LEFT);
        addHeaderCell(table, "Qte", Element.ALIGN_RIGHT);
        addHeaderCell(table, "Prix HT", Element.ALIGN_RIGHT);
        addHeaderCell(table, "TVA", Element.ALIGN_RIGHT);
        addHeaderCell(table, "Total HT", Element.ALIGN_RIGHT);
        addHeaderCell(table, "Total TTC", Element.ALIGN_RIGHT);

        for (InvoiceLineItem line : invoice.getLineItems()) {
            addBodyCell(table, line.getDescription(), Element.ALIGN_LEFT, false);
            addBodyCell(table, formatQuantity(line.getQuantity()), Element.ALIGN_RIGHT, false);
            addBodyCell(table, formatMoney(line.getUnitPrice()), Element.ALIGN_RIGHT, false);
            addBodyCell(table, formatRate(line.getTvaRate()) + "%", Element.ALIGN_RIGHT, false);
            addBodyCell(table, formatMoney(line.getLineSubtotal()), Element.ALIGN_RIGHT, false);
            addBodyCell(table, formatMoney(line.getLineTotal()), Element.ALIGN_RIGHT, true);
        }

        table.setSpacingAfter(15f);
        document.add(table);
    }

    private void addHeaderCell(PdfPTable table, String text, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, TABLE_HEADER_FONT));
        cell.setBackgroundColor(PRIMARY_COLOR);
        cell.setBorderColor(PRIMARY_COLOR);
        cell.setHorizontalAlignment(alignment);
        cell.setPadding(7f);
        table.addCell(cell);
    }

    private void addBodyCell(PdfPTable table, String text, int alignment, boolean bold) {
        PdfPCell cell = new PdfPCell(new Phrase(text, bold ? BOLD_FONT : NORMAL_FONT));
        cell.setBorderColor(BORDER_COLOR);
        cell.setHorizontalAlignment(alignment);
        cell.setPadding(6f);
        table.addCell(cell);
    }

    private void addTotals(Document document, Invoice invoice) {
        PdfPTable totals = new PdfPTable(2);
        totals.setWidthPercentage(40);
        totals.setHorizontalAlignment(Element.ALIGN_RIGHT);
        try {
            totals.setWidths(new float[]{50f, 50f});
        } catch (Exception ex) {
            throw new PdfGenerationException("Erreur de mise en page des totaux.", ex);
        }

        addTotalRow(totals, "Total HT", formatMoney(invoice.getNetAmount()), false);
        addTotalRow(totals, "Total TVA", formatMoney(invoice.getTvaAmount()), false);
        addTotalRow(totals, "Total TTC", formatMoney(invoice.getTotalAmount()), true);

        totals.setSpacingAfter(20f);
        document.add(totals);
    }

    private void addTotalRow(PdfPTable table, String label, String value, boolean strong) {
        Font font = strong ? TOTAL_FONT : NORMAL_FONT;

        PdfPCell labelCell = new PdfPCell(new Phrase(label, font));
        labelCell.setBorder(strong ? Rectangle.TOP : Rectangle.NO_BORDER);
        labelCell.setBorderColor(BORDER_COLOR);
        labelCell.setPadding(5f);
        labelCell.setHorizontalAlignment(Element.ALIGN_LEFT);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, font));
        valueCell.setBorder(strong ? Rectangle.TOP : Rectangle.NO_BORDER);
        valueCell.setBorderColor(BORDER_COLOR);
        valueCell.setPadding(5f);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(valueCell);
    }

    private void addPaymentTerms(Document document, Invoice invoice) {
        if (invoice.getPaymentTerms() == null || invoice.getPaymentTerms().isBlank()) return;
        Paragraph p = new Paragraph();
        p.add(new Chunk("Conditions de paiement: ", BOLD_FONT));
        p.add(new Chunk(invoice.getPaymentTerms(), NORMAL_FONT));
        p.setSpacingAfter(6f);
        document.add(p);
    }

    private void addNotes(Document document, Invoice invoice) {
        if (invoice.getNotes() == null || invoice.getNotes().isBlank()) return;
        Paragraph p = new Paragraph();
        p.add(new Chunk("Notes: ", BOLD_FONT));
        p.add(new Chunk(invoice.getNotes(), NORMAL_FONT));
        p.setSpacingAfter(20f);
        document.add(p);
    }

    private void addLegalFooter(Document document, Company company) {
        Paragraph footer = new Paragraph(
                "Facture editee par " + company.getName() +
                        " - ICE " + company.getIceNumber() +
                        " - RC " + company.getRcNumber() +
                        " - CNSS " + company.getCnssNumber(),
                SMALL_FONT
        );
        footer.setAlignment(Element.ALIGN_CENTER);
        footer.setSpacingBefore(30f);
        document.add(footer);
    }

    private static PdfPCell noBorderCell() {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(0f);
        return cell;
    }

    private static Paragraph spacer() {
        return new Paragraph(" ", SMALL_FONT);
    }

    private static String formatMoney(BigDecimal value) {
        if (value == null) return "0,00 MAD";
        return moneyFormatter().format(value) + " MAD";
    }

    private static String formatQuantity(BigDecimal value) {
        if (value == null) return "";
        BigDecimal stripped = value.stripTrailingZeros();
        if (stripped.scale() < 0) stripped = stripped.setScale(0);
        return stripped.toPlainString().replace('.', ',');
    }

    private static String formatRate(BigDecimal rate) {
        if (rate == null) return "0";
        BigDecimal stripped = rate.stripTrailingZeros();
        if (stripped.scale() < 0) stripped = stripped.setScale(0);
        return stripped.toPlainString();
    }

    private static DecimalFormat moneyFormatter() {
        DecimalFormatSymbols symbols = new DecimalFormatSymbols(Locale.FRANCE);
        symbols.setDecimalSeparator(',');
        symbols.setGroupingSeparator(' ');
        DecimalFormat fmt = new DecimalFormat("#,##0.00", symbols);
        fmt.setMinimumFractionDigits(2);
        fmt.setMaximumFractionDigits(2);
        return fmt;
    }
}
