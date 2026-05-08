package com.elguennouni.mohassib.controller;

import com.elguennouni.mohassib.dto.CreatePayrollRequest;
import com.elguennouni.mohassib.dto.PayrollResponse;
import com.elguennouni.mohassib.dto.PayrollSummaryResponse;
import com.elguennouni.mohassib.exception.CompanyNotFoundException;
import com.elguennouni.mohassib.exception.InvalidTokenException;
import com.elguennouni.mohassib.service.CompanyService;
import com.elguennouni.mohassib.service.PayrollService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;
    private final CompanyService companyService;

    @GetMapping("/payroll")
    public List<PayrollSummaryResponse> list(
            @RequestParam(required = false) Integer year,
            Authentication authentication
    ) {
        return payrollService.list(currentCompanyId(authentication), year);
    }

    @PostMapping("/payroll")
    @ResponseStatus(HttpStatus.CREATED)
    public PayrollResponse create(
            @Valid @RequestBody CreatePayrollRequest request,
            Authentication authentication
    ) {
        return payrollService.createDraft(currentCompanyId(authentication), request);
    }

    @GetMapping("/payroll/{id}")
    public PayrollResponse get(@PathVariable Long id, Authentication authentication) {
        return payrollService.get(currentCompanyId(authentication), id);
    }

    @PostMapping("/payroll/{id}/process")
    public PayrollResponse process(@PathVariable Long id, Authentication authentication) {
        return payrollService.process(currentCompanyId(authentication), id);
    }

    @DeleteMapping("/payroll/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        payrollService.delete(currentCompanyId(authentication), id);
    }

    @GetMapping("/salary-slips/{id}/pdf")
    public ResponseEntity<byte[]> getSlipPdf(@PathVariable Long id, Authentication authentication) {
        PayrollService.SalarySlipPdf pdf = payrollService.generateSlipPdf(currentCompanyId(authentication), id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + pdf.filename() + "\"")
                .body(pdf.bytes());
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
