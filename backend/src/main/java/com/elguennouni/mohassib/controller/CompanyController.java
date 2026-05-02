package com.elguennouni.mohassib.controller;

import com.elguennouni.mohassib.dto.CompanyRequest;
import com.elguennouni.mohassib.dto.CompanyResponse;
import com.elguennouni.mohassib.exception.InvalidTokenException;
import com.elguennouni.mohassib.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CompanyResponse create(
            @Valid @RequestBody CompanyRequest request,
            Authentication authentication
    ) {
        return companyService.createForUser(currentUserId(authentication), request);
    }

    @GetMapping("/me")
    public CompanyResponse getMyCompany(Authentication authentication) {
        return companyService.getForUser(currentUserId(authentication));
    }

    @PutMapping("/me")
    public CompanyResponse updateMyCompany(
            @Valid @RequestBody CompanyRequest request,
            Authentication authentication
    ) {
        return companyService.updateForUser(currentUserId(authentication), request);
    }

    private Long currentUserId(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new InvalidTokenException();
        }
        return (Long) authentication.getPrincipal();
    }
}
