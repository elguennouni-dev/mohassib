package com.elguennouni.mohassib.service;

import com.elguennouni.mohassib.dto.InvoiceResponse;
import com.elguennouni.mohassib.dto.RecordPaymentRequest;
import com.elguennouni.mohassib.entity.Client;
import com.elguennouni.mohassib.entity.Invoice;
import com.elguennouni.mohassib.entity.InvoicePayment;
import com.elguennouni.mohassib.entity.InvoiceStatus;
import com.elguennouni.mohassib.entity.PaymentStatus;
import com.elguennouni.mohassib.exception.InvalidPaymentException;
import com.elguennouni.mohassib.exception.InvoiceNotFoundException;
import com.elguennouni.mohassib.exception.PaymentNotFoundException;
import com.elguennouni.mohassib.repository.ClientRepository;
import com.elguennouni.mohassib.repository.InvoicePaymentRepository;
import com.elguennouni.mohassib.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final InvoiceRepository invoiceRepository;
    private final InvoicePaymentRepository paymentRepository;
    private final ClientRepository clientRepository;

    @Transactional
    public InvoiceResponse recordPayment(Long companyId, Long invoiceId, RecordPaymentRequest request) {
        Invoice invoice = findInvoiceOrThrow(companyId, invoiceId);

        if (invoice.getStatus() == InvoiceStatus.DRAFT) {
            throw new InvalidPaymentException("Impossible d'enregistrer un paiement sur une facture en brouillon.");
        }
        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new InvalidPaymentException("Impossible d'enregistrer un paiement sur une facture annulee.");
        }

        BigDecimal alreadyPaid = paymentRepository.sumAmountByInvoiceId(invoice.getId());
        BigDecimal newTotalPaid = alreadyPaid.add(request.amount());
        if (newTotalPaid.compareTo(invoice.getTotalAmount()) > 0) {
            throw new InvalidPaymentException(
                    "Le montant depasse le restant du. Reste a payer : "
                            + invoice.getTotalAmount().subtract(alreadyPaid)
                            + " MAD."
            );
        }

        InvoicePayment payment = InvoicePayment.builder()
                .invoiceId(invoice.getId())
                .amount(request.amount())
                .paymentMethod(request.paymentMethod())
                .paymentDate(request.paymentDate())
                .referenceNumber(blankToNull(request.referenceNumber()))
                .notes(blankToNull(request.notes()))
                .build();
        paymentRepository.save(payment);

        applyPaymentTotalsToInvoice(invoice, newTotalPaid);

        return buildInvoiceResponse(invoice, companyId, newTotalPaid);
    }

    @Transactional
    public InvoiceResponse deletePayment(Long companyId, Long paymentId) {
        InvoicePayment payment = paymentRepository.findById(paymentId)
                .orElseThrow(PaymentNotFoundException::new);

        Invoice invoice = findInvoiceOrThrow(companyId, payment.getInvoiceId());

        paymentRepository.delete(payment);
        paymentRepository.flush();

        BigDecimal newTotalPaid = paymentRepository.sumAmountByInvoiceId(invoice.getId());
        applyPaymentTotalsToInvoice(invoice, newTotalPaid);

        return buildInvoiceResponse(invoice, companyId, newTotalPaid);
    }

    private void applyPaymentTotalsToInvoice(Invoice invoice, BigDecimal totalPaid) {
        int cmp = totalPaid.compareTo(invoice.getTotalAmount());
        if (cmp >= 0) {
            invoice.setPaymentStatus(PaymentStatus.PAID);
            invoice.setStatus(InvoiceStatus.PAID);
        } else if (totalPaid.signum() > 0) {
            invoice.setPaymentStatus(PaymentStatus.PARTIAL);
            if (invoice.getStatus() == InvoiceStatus.PAID) {
                invoice.setStatus(isOverdue(invoice) ? InvoiceStatus.OVERDUE : InvoiceStatus.SENT);
            }
        } else {
            invoice.setPaymentStatus(PaymentStatus.UNPAID);
            if (invoice.getStatus() == InvoiceStatus.PAID) {
                invoice.setStatus(isOverdue(invoice) ? InvoiceStatus.OVERDUE : InvoiceStatus.SENT);
            }
        }
    }

    private boolean isOverdue(Invoice invoice) {
        return invoice.getDueDate() != null && invoice.getDueDate().isBefore(LocalDate.now());
    }

    private InvoiceResponse buildInvoiceResponse(Invoice invoice, Long companyId, BigDecimal totalPaid) {
        String clientEmail = clientRepository.findByIdAndCompanyId(invoice.getClientId(), companyId)
                .map(Client::getEmail)
                .orElse(null);
        List<InvoicePayment> payments = paymentRepository.findByInvoiceIdOrderByPaymentDateDescIdDesc(invoice.getId());
        return InvoiceResponse.from(invoice, clientEmail, totalPaid, payments);
    }

    private Invoice findInvoiceOrThrow(Long companyId, Long invoiceId) {
        return invoiceRepository.findByIdAndCompanyId(invoiceId, companyId)
                .orElseThrow(InvoiceNotFoundException::new);
    }

    private static String blankToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
