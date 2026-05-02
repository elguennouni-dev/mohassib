package com.elguennouni.mohassib.service;

import com.elguennouni.mohassib.dto.InvoiceLineItemRequest;
import com.elguennouni.mohassib.dto.InvoiceRequest;
import com.elguennouni.mohassib.dto.InvoiceResponse;
import com.elguennouni.mohassib.dto.InvoiceSummaryResponse;
import com.elguennouni.mohassib.dto.PageResponse;
import com.elguennouni.mohassib.entity.Client;
import com.elguennouni.mohassib.entity.Invoice;
import com.elguennouni.mohassib.entity.InvoiceLineItem;
import com.elguennouni.mohassib.entity.InvoiceStatus;
import com.elguennouni.mohassib.entity.PaymentStatus;
import com.elguennouni.mohassib.exception.ClientNotFoundException;
import com.elguennouni.mohassib.exception.InvalidInvoiceStateException;
import com.elguennouni.mohassib.exception.InvalidTvaRateException;
import com.elguennouni.mohassib.exception.InvoiceNotFoundException;
import com.elguennouni.mohassib.repository.ClientRepository;
import com.elguennouni.mohassib.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private static final List<BigDecimal> ALLOWED_TVA_RATES = List.of(
            new BigDecimal("0"),
            new BigDecimal("7"),
            new BigDecimal("10"),
            new BigDecimal("20")
    );

    private final InvoiceRepository invoiceRepository;
    private final ClientRepository clientRepository;

    @Transactional(readOnly = true)
    public PageResponse<InvoiceSummaryResponse> list(
            Long companyId,
            String search,
            InvoiceStatus status,
            int page,
            int size
    ) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), 100);
        Pageable pageable = PageRequest.of(
                safePage,
                safeSize,
                Sort.by(Sort.Order.desc("invoiceDate"), Sort.Order.desc("id"))
        );

        Page<Invoice> result;
        boolean hasSearch = search != null && !search.isBlank();
        if (status != null && hasSearch) {
            result = invoiceRepository.searchByCompanyIdAndStatus(companyId, status, search.trim(), pageable);
        } else if (status != null) {
            result = invoiceRepository.findByCompanyIdAndStatus(companyId, status, pageable);
        } else if (hasSearch) {
            result = invoiceRepository.searchByCompanyId(companyId, search.trim(), pageable);
        } else {
            result = invoiceRepository.findByCompanyId(companyId, pageable);
        }
        return PageResponse.from(result, InvoiceSummaryResponse::from);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse get(Long companyId, Long invoiceId) {
        return InvoiceResponse.from(findOrThrow(companyId, invoiceId));
    }

    @Transactional
    public InvoiceResponse create(Long companyId, InvoiceRequest request) {
        Client client = clientRepository.findByIdAndCompanyId(request.clientId(), companyId)
                .orElseThrow(ClientNotFoundException::new);

        Invoice invoice = Invoice.builder()
                .companyId(companyId)
                .clientId(client.getId())
                .clientName(client.getName())
                .invoiceNumber(generateInvoiceNumber(companyId, request.invoiceDate().getYear()))
                .invoiceDate(request.invoiceDate())
                .dueDate(request.dueDate())
                .paymentTerms(blankToNull(request.paymentTerms()))
                .notes(blankToNull(request.notes()))
                .netAmount(BigDecimal.ZERO)
                .tvaAmount(BigDecimal.ZERO)
                .totalAmount(BigDecimal.ZERO)
                .status(InvoiceStatus.DRAFT)
                .paymentStatus(PaymentStatus.UNPAID)
                .build();

        applyLineItems(invoice, request.lineItems());
        Invoice saved = invoiceRepository.save(invoice);
        return InvoiceResponse.from(saved);
    }

    @Transactional
    public InvoiceResponse update(Long companyId, Long invoiceId, InvoiceRequest request) {
        Invoice invoice = findOrThrow(companyId, invoiceId);
        if (invoice.getStatus() != InvoiceStatus.DRAFT) {
            throw new InvalidInvoiceStateException("Seules les factures en brouillon peuvent etre modifiees.");
        }

        Client client = clientRepository.findByIdAndCompanyId(request.clientId(), companyId)
                .orElseThrow(ClientNotFoundException::new);

        invoice.setClientId(client.getId());
        invoice.setClientName(client.getName());
        invoice.setInvoiceDate(request.invoiceDate());
        invoice.setDueDate(request.dueDate());
        invoice.setPaymentTerms(blankToNull(request.paymentTerms()));
        invoice.setNotes(blankToNull(request.notes()));

        invoice.clearLineItems();
        applyLineItems(invoice, request.lineItems());

        return InvoiceResponse.from(invoice);
    }

    @Transactional
    public void delete(Long companyId, Long invoiceId) {
        Invoice invoice = findOrThrow(companyId, invoiceId);
        if (invoice.getStatus() != InvoiceStatus.DRAFT) {
            throw new InvalidInvoiceStateException("Seules les factures en brouillon peuvent etre supprimees.");
        }
        invoiceRepository.delete(invoice);
    }

    @Transactional
    public InvoiceResponse send(Long companyId, Long invoiceId) {
        Invoice invoice = findOrThrow(companyId, invoiceId);
        if (invoice.getStatus() != InvoiceStatus.DRAFT) {
            throw new InvalidInvoiceStateException("Seules les factures en brouillon peuvent etre marquees comme envoyees.");
        }
        invoice.setStatus(InvoiceStatus.SENT);
        invoice.setSentDate(LocalDateTime.now());
        return InvoiceResponse.from(invoice);
    }

    @Transactional
    public InvoiceResponse cancel(Long companyId, Long invoiceId) {
        Invoice invoice = findOrThrow(companyId, invoiceId);
        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new InvalidInvoiceStateException("Une facture payee ne peut pas etre annulee.");
        }
        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new InvalidInvoiceStateException("Cette facture est deja annulee.");
        }
        invoice.setStatus(InvoiceStatus.CANCELLED);
        return InvoiceResponse.from(invoice);
    }

    private Invoice findOrThrow(Long companyId, Long invoiceId) {
        return invoiceRepository.findByIdAndCompanyId(invoiceId, companyId)
                .orElseThrow(InvoiceNotFoundException::new);
    }

    private void applyLineItems(Invoice invoice, List<InvoiceLineItemRequest> requests) {
        BigDecimal netTotal = BigDecimal.ZERO;
        BigDecimal tvaTotal = BigDecimal.ZERO;

        int lineIndex = 1;
        for (InvoiceLineItemRequest req : requests) {
            validateTvaRate(req.tvaRate());

            BigDecimal quantity = req.quantity();
            BigDecimal unitPrice = req.unitPrice().setScale(2, RoundingMode.HALF_UP);
            BigDecimal tvaRate = req.tvaRate().setScale(2, RoundingMode.HALF_UP);

            BigDecimal subtotal = quantity.multiply(unitPrice).setScale(2, RoundingMode.HALF_UP);
            BigDecimal lineTva = subtotal
                    .multiply(tvaRate)
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            BigDecimal lineTotal = subtotal.add(lineTva);

            InvoiceLineItem line = InvoiceLineItem.builder()
                    .lineNumber(lineIndex++)
                    .description(req.description().trim())
                    .quantity(quantity)
                    .unitPrice(unitPrice)
                    .tvaRate(tvaRate)
                    .lineSubtotal(subtotal)
                    .lineTva(lineTva)
                    .lineTotal(lineTotal)
                    .build();

            invoice.addLineItem(line);

            netTotal = netTotal.add(subtotal);
            tvaTotal = tvaTotal.add(lineTva);
        }

        invoice.setNetAmount(netTotal);
        invoice.setTvaAmount(tvaTotal);
        invoice.setTotalAmount(netTotal.add(tvaTotal));
    }

    private void validateTvaRate(BigDecimal rate) {
        if (rate == null) {
            throw new InvalidTvaRateException();
        }
        boolean ok = ALLOWED_TVA_RATES.stream().anyMatch(r -> r.compareTo(rate) == 0);
        if (!ok) {
            throw new InvalidTvaRateException();
        }
    }

    private String generateInvoiceNumber(Long companyId, int year) {
        long count = invoiceRepository.countByCompanyIdAndYear(companyId, year);
        return String.format("INV-%d-%05d", year, count + 1);
    }

    private static String blankToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
