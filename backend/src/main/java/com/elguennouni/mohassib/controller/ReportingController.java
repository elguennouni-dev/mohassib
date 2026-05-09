package com.elguennouni.mohassib.controller;

import com.elguennouni.mohassib.dto.AnnualPayrollReportResponse;
import com.elguennouni.mohassib.dto.AnnualTvaReportResponse;
import com.elguennouni.mohassib.dto.DashboardKpisResponse;
import com.elguennouni.mohassib.dto.MonthlyInvoiceReportResponse;
import com.elguennouni.mohassib.exception.CompanyNotFoundException;
import com.elguennouni.mohassib.exception.InvalidTokenException;
import com.elguennouni.mohassib.service.CompanyService;
import com.elguennouni.mohassib.service.ReportingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportingController {

    private final ReportingService reportingService;
    private final CompanyService companyService;

    @GetMapping("/dashboard")
    public DashboardKpisResponse dashboard(Authentication authentication) {
        return reportingService.getDashboardKpis(currentCompanyId(authentication));
    }

    @GetMapping("/invoices")
    public MonthlyInvoiceReportResponse invoiceReport(
            @RequestParam(required = false) Integer year,
            Authentication authentication
    ) {
        int targetYear = year != null ? year : LocalDate.now().getYear();
        return reportingService.getInvoiceReport(currentCompanyId(authentication), targetYear);
    }

    @GetMapping("/payroll")
    public AnnualPayrollReportResponse payrollReport(
            @RequestParam(required = false) Integer year,
            Authentication authentication
    ) {
        int targetYear = year != null ? year : LocalDate.now().getYear();
        return reportingService.getPayrollReport(currentCompanyId(authentication), targetYear);
    }

    @GetMapping("/tva")
    public AnnualTvaReportResponse tvaReport(
            @RequestParam(required = false) Integer year,
            Authentication authentication
    ) {
        int targetYear = year != null ? year : LocalDate.now().getYear();
        return reportingService.getTvaReport(currentCompanyId(authentication), targetYear);
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
