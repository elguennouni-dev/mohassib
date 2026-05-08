package com.elguennouni.mohassib.service;

import com.elguennouni.mohassib.entity.Company;
import com.elguennouni.mohassib.entity.TVADeclaration;
import com.elguennouni.mohassib.exception.PdfGenerationException;
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

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;

@Service
public class TVADeclarationPdfService {

    private static final String[] MONTH_NAMES_FR = {
            "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
            "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"
    };

    private static final Color PRIMARY_COLOR = new Color(31, 58, 95);
    private static final Color MUTED_COLOR = new Color(90, 90, 90);
    private static final Color BORDER_COLOR = new Color(226, 223, 217);
    private static final Color SUBTLE_BG = new Color(248, 249, 250);

    private static final Font TITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, PRIMARY_COLOR);
    private static final Font COMPANY_NAME_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, PRIMARY_COLOR);
    private static final Font H2_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, MUTED_COLOR);
    private static final Font NORMAL_FONT = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
    private static final Font BOLD_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);
    private static final Font SMALL_FONT = FontFactory.getFont(FontFactory.HELVETICA, 8, MUTED_COLOR);
    private static final Font TABLE_HEADER_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
    private static final Font TOTAL_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, PRIMARY_COLOR);

    public byte[] generate(TVADeclaration declaration, Company company) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 40f, 40f, 40f, 50f);
        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            addHeader(document, company, declaration);
            addSummaryTable(document, declaration);
            addToPayBlock(document, declaration);
            addLegalFooter(document, company);

            document.close();
        } catch (Exception ex) {
            throw new PdfGenerationException("Impossible de generer le PDF de la declaration TVA.", ex);
        }
        return baos.toByteArray();
    }

    private void addHeader(Document document, Company company, TVADeclaration declaration) {
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
        left.addElement(new Paragraph(" ", SMALL_FONT));
        left.addElement(new Paragraph("ICE: " + company.getIceNumber(), NORMAL_FONT));
        left.addElement(new Paragraph("RC: " + company.getRcNumber(), NORMAL_FONT));
        left.addElement(new Paragraph("CNSS: " + company.getCnssNumber(), NORMAL_FONT));
        left.addElement(new Paragraph(company.getAddress(), NORMAL_FONT));
        String cityLine = (company.getPostalCode() != null && !company.getPostalCode().isBlank())
                ? company.getPostalCode() + " " + company.getCity()
                : company.getCity();
        left.addElement(new Paragraph(cityLine, NORMAL_FONT));

        PdfPCell right = noBorderCell();
        Paragraph title = new Paragraph("DECLARATION TVA", TITLE_FONT);
        title.setAlignment(Element.ALIGN_RIGHT);
        right.addElement(title);
        right.addElement(new Paragraph(" ", SMALL_FONT));
        Paragraph period = new Paragraph(formatPeriod(declaration.getMonth(), declaration.getYear()), BOLD_FONT);
        period.setAlignment(Element.ALIGN_RIGHT);
        right.addElement(period);

        if (declaration.getReferenceNumber() != null && !declaration.getReferenceNumber().isBlank()) {
            Paragraph ref = new Paragraph("Reference: " + declaration.getReferenceNumber(), SMALL_FONT);
            ref.setAlignment(Element.ALIGN_RIGHT);
            right.addElement(ref);
        }

        header.addCell(left);
        header.addCell(right);
        header.setSpacingAfter(20f);
        document.add(header);
    }

    private void addSummaryTable(Document document, TVADeclaration declaration) {
        Paragraph label = new Paragraph("RECAPITULATIF MENSUEL", H2_FONT);
        label.setSpacingAfter(8f);
        document.add(label);

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        try {
            table.setWidths(new float[]{60f, 40f});
        } catch (Exception ex) {
            throw new PdfGenerationException("Erreur de mise en page du tableau.", ex);
        }

        addHeaderCell(table, "Designation", Element.ALIGN_LEFT);
        addHeaderCell(table, "Montant (MAD)", Element.ALIGN_RIGHT);

        // Sales
        addBodyCell(table, "Chiffre d'affaires HT", Element.ALIGN_LEFT, false, null);
        addBodyCell(table, formatMoney(declaration.getSalesBase()), Element.ALIGN_RIGHT, false, null);
        addBodyCell(table, "TVA collectee", Element.ALIGN_LEFT, true, SUBTLE_BG);
        addBodyCell(table, formatMoney(declaration.getTvaCollected()), Element.ALIGN_RIGHT, true, SUBTLE_BG);

        // Expenses
        addBodyCell(table, "Achats / depenses HT", Element.ALIGN_LEFT, false, null);
        addBodyCell(table, formatMoney(declaration.getExpensesBase()), Element.ALIGN_RIGHT, false, null);
        addBodyCell(table, "TVA deductible", Element.ALIGN_LEFT, true, SUBTLE_BG);
        addBodyCell(table, formatMoney(declaration.getTvaDeductible()), Element.ALIGN_RIGHT, true, SUBTLE_BG);

        table.setSpacingAfter(20f);
        document.add(table);
    }

    private void addToPayBlock(Document document, TVADeclaration declaration) {
        BigDecimal toPay = declaration.getTvaToPay() != null ? declaration.getTvaToPay() : BigDecimal.ZERO;
        boolean isCredit = toPay.signum() < 0;

        PdfPTable totals = new PdfPTable(2);
        totals.setWidthPercentage(70);
        totals.setHorizontalAlignment(Element.ALIGN_RIGHT);
        try {
            totals.setWidths(new float[]{55f, 45f});
        } catch (Exception ex) {
            throw new PdfGenerationException("Erreur de mise en page du total.", ex);
        }

        String label = isCredit ? "CREDIT DE TVA EN VOTRE FAVEUR" : "TVA A PAYER";
        BigDecimal absoluteAmount = isCredit ? toPay.negate() : toPay;

        PdfPCell labelCell = new PdfPCell(new Phrase(label, TOTAL_FONT));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setBackgroundColor(SUBTLE_BG);
        labelCell.setPadding(8f);
        labelCell.setHorizontalAlignment(Element.ALIGN_LEFT);
        totals.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(formatMoney(absoluteAmount) + " MAD", TOTAL_FONT));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setBackgroundColor(SUBTLE_BG);
        valueCell.setPadding(8f);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totals.addCell(valueCell);

        totals.setSpacingAfter(20f);
        document.add(totals);
    }

    private void addLegalFooter(Document document, Company company) {
        Paragraph footer = new Paragraph(
                "Declaration etablie par " + company.getName() +
                        " - ICE " + company.getIceNumber() +
                        " - RC " + company.getRcNumber() +
                        " - CNSS " + company.getCnssNumber(),
                SMALL_FONT
        );
        footer.setAlignment(Element.ALIGN_CENTER);
        footer.setSpacingBefore(30f);
        document.add(footer);

        Paragraph note = new Paragraph(
                "Document a verifier et a faire valider avant soumission a la DGI.",
                SMALL_FONT
        );
        note.setAlignment(Element.ALIGN_CENTER);
        document.add(note);
    }

    private void addHeaderCell(PdfPTable table, String text, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, TABLE_HEADER_FONT));
        cell.setBackgroundColor(PRIMARY_COLOR);
        cell.setBorderColor(PRIMARY_COLOR);
        cell.setHorizontalAlignment(alignment);
        cell.setPadding(7f);
        table.addCell(cell);
    }

    private void addBodyCell(PdfPTable table, String text, int alignment, boolean bold, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(text, bold ? BOLD_FONT : NORMAL_FONT));
        cell.setBorderColor(BORDER_COLOR);
        cell.setHorizontalAlignment(alignment);
        cell.setPadding(6f);
        if (bg != null) cell.setBackgroundColor(bg);
        table.addCell(cell);
    }

    private static PdfPCell noBorderCell() {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(0f);
        return cell;
    }

    private static String formatPeriod(int month, int year) {
        String name = (month >= 1 && month <= 12) ? MONTH_NAMES_FR[month - 1] : String.valueOf(month);
        return name + " " + year;
    }

    private static String formatMoney(BigDecimal value) {
        if (value == null) return "0,00";
        DecimalFormatSymbols symbols = new DecimalFormatSymbols(Locale.FRANCE);
        symbols.setDecimalSeparator(',');
        symbols.setGroupingSeparator(' ');
        DecimalFormat fmt = new DecimalFormat("#,##0.00", symbols);
        return fmt.format(value);
    }
}
