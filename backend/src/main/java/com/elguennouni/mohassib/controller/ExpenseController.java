package com.elguennouni.mohassib.controller;

import com.elguennouni.mohassib.dto.ExpenseRequest;
import com.elguennouni.mohassib.dto.ExpenseResponse;
import com.elguennouni.mohassib.dto.PageResponse;
import com.elguennouni.mohassib.exception.CompanyNotFoundException;
import com.elguennouni.mohassib.exception.InvalidTokenException;
import com.elguennouni.mohassib.service.CompanyService;
import com.elguennouni.mohassib.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;
    private final CompanyService companyService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExpenseResponse create(
            @Valid @RequestBody ExpenseRequest request,
            Authentication authentication
    ) {
        return expenseService.create(currentCompanyId(authentication), request);
    }

    @GetMapping
    public PageResponse<ExpenseResponse> list(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        return expenseService.list(currentCompanyId(authentication), search, page, size);
    }

    @GetMapping("/{id}")
    public ExpenseResponse get(@PathVariable Long id, Authentication authentication) {
        return expenseService.get(currentCompanyId(authentication), id);
    }

    @PutMapping("/{id}")
    public ExpenseResponse update(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest request,
            Authentication authentication
    ) {
        return expenseService.update(currentCompanyId(authentication), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        expenseService.delete(currentCompanyId(authentication), id);
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
