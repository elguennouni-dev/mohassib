package com.elguennouni.mohassib.controller;

import com.elguennouni.mohassib.dto.InvoiceRequest;
import com.elguennouni.mohassib.dto.InvoiceResponse;
import com.elguennouni.mohassib.dto.InvoiceSummaryResponse;
import com.elguennouni.mohassib.dto.PageResponse;
import com.elguennouni.mohassib.entity.InvoiceStatus;
import com.elguennouni.mohassib.exception.CompanyNotFoundException;
import com.elguennouni.mohassib.exception.InvalidTokenException;
import com.elguennouni.mohassib.service.CompanyService;
import com.elguennouni.mohassib.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final CompanyService companyService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InvoiceResponse create(
            @Valid @RequestBody InvoiceRequest request,
            Authentication authentication
    ) {
        return invoiceService.create(currentCompanyId(authentication), request);
    }

    @GetMapping
    public PageResponse<InvoiceSummaryResponse> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) InvoiceStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        return invoiceService.list(currentCompanyId(authentication), search, status, page, size);
    }

    @GetMapping("/{id}")
    public InvoiceResponse get(@PathVariable Long id, Authentication authentication) {
        return invoiceService.get(currentCompanyId(authentication), id);
    }

    @PutMapping("/{id}")
    public InvoiceResponse update(
            @PathVariable Long id,
            @Valid @RequestBody InvoiceRequest request,
            Authentication authentication
    ) {
        return invoiceService.update(currentCompanyId(authentication), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        invoiceService.delete(currentCompanyId(authentication), id);
    }

    @PostMapping("/{id}/send")
    public InvoiceResponse send(@PathVariable Long id, Authentication authentication) {
        return invoiceService.send(currentCompanyId(authentication), id);
    }

    @PostMapping("/{id}/cancel")
    public InvoiceResponse cancel(@PathVariable Long id, Authentication authentication) {
        return invoiceService.cancel(currentCompanyId(authentication), id);
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
