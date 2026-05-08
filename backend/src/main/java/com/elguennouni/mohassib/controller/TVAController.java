package com.elguennouni.mohassib.controller;

import com.elguennouni.mohassib.dto.GenerateDeclarationRequest;
import com.elguennouni.mohassib.dto.TVADeclarationResponse;
import com.elguennouni.mohassib.dto.TVAEntryResponse;
import com.elguennouni.mohassib.dto.TVAPreviewResponse;
import com.elguennouni.mohassib.dto.UpdateDeclarationStatusRequest;
import com.elguennouni.mohassib.exception.CompanyNotFoundException;
import com.elguennouni.mohassib.exception.InvalidTokenException;
import com.elguennouni.mohassib.service.CompanyService;
import com.elguennouni.mohassib.service.TVAService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class TVAController {

    private final TVAService tvaService;
    private final CompanyService companyService;

    @GetMapping("/tva/entries")
    public List<TVAEntryResponse> listEntries(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            Authentication authentication
    ) {
        return tvaService.listEntries(currentCompanyId(authentication), from, to);
    }

    @GetMapping("/tva/preview")
    public TVAPreviewResponse preview(
            @RequestParam int month,
            @RequestParam int year,
            Authentication authentication
    ) {
        // Validate range
        YearMonth.of(year, month);
        return tvaService.preview(currentCompanyId(authentication), month, year);
    }

    @GetMapping("/tva/declarations")
    public List<TVADeclarationResponse> listDeclarations(
            @RequestParam(required = false) Integer year,
            Authentication authentication
    ) {
        return tvaService.listDeclarations(currentCompanyId(authentication), year);
    }

    @GetMapping("/tva/declarations/{id}")
    public TVADeclarationResponse getDeclaration(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return tvaService.getDeclaration(currentCompanyId(authentication), id);
    }

    @PostMapping("/tva/declarations/generate")
    public TVADeclarationResponse generate(
            @Valid @RequestBody GenerateDeclarationRequest request,
            Authentication authentication
    ) {
        return tvaService.generateDeclaration(currentCompanyId(authentication), request);
    }

    @PutMapping("/tva/declarations/{id}/status")
    public TVADeclarationResponse updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDeclarationStatusRequest request,
            Authentication authentication
    ) {
        return tvaService.updateStatus(currentCompanyId(authentication), id, request);
    }

    @DeleteMapping("/tva/declarations/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDeclaration(@PathVariable Long id, Authentication authentication) {
        tvaService.deleteDeclaration(currentCompanyId(authentication), id);
    }

    @GetMapping("/tva/declarations/{id}/pdf")
    public ResponseEntity<byte[]> getDeclarationPdf(
            @PathVariable Long id,
            Authentication authentication
    ) {
        TVAService.DeclarationPdf pdf = tvaService.generatePdf(currentCompanyId(authentication), id);
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
