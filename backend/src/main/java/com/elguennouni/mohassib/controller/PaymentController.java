package com.elguennouni.mohassib.controller;

import com.elguennouni.mohassib.dto.InvoiceResponse;
import com.elguennouni.mohassib.dto.RecordPaymentRequest;
import com.elguennouni.mohassib.exception.CompanyNotFoundException;
import com.elguennouni.mohassib.exception.InvalidTokenException;
import com.elguennouni.mohassib.service.CompanyService;
import com.elguennouni.mohassib.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final CompanyService companyService;

    @PostMapping("/invoices/{invoiceId}/payments")
    @ResponseStatus(HttpStatus.CREATED)
    public InvoiceResponse recordPayment(
            @PathVariable Long invoiceId,
            @Valid @RequestBody RecordPaymentRequest request,
            Authentication authentication
    ) {
        return paymentService.recordPayment(currentCompanyId(authentication), invoiceId, request);
    }

    @DeleteMapping("/payments/{id}")
    public InvoiceResponse deletePayment(@PathVariable Long id, Authentication authentication) {
        return paymentService.deletePayment(currentCompanyId(authentication), id);
    }

    private Long currentCompanyId(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new InvalidTokenException();
        }
        Long userId = (Long) authentication.getPrincipal();
        return companyService.findByUserId(userId)
                .orElseThrow(CompanyNotFoundException::new)
                .getId();
    }
}
