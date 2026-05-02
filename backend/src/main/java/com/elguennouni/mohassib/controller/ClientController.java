package com.elguennouni.mohassib.controller;

import com.elguennouni.mohassib.dto.ClientRequest;
import com.elguennouni.mohassib.dto.ClientResponse;
import com.elguennouni.mohassib.dto.PageResponse;
import com.elguennouni.mohassib.exception.CompanyNotFoundException;
import com.elguennouni.mohassib.exception.InvalidTokenException;
import com.elguennouni.mohassib.service.ClientService;
import com.elguennouni.mohassib.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;
    private final CompanyService companyService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClientResponse create(
            @Valid @RequestBody ClientRequest request,
            Authentication authentication
    ) {
        return clientService.create(currentCompanyId(authentication), request);
    }

    @GetMapping
    public PageResponse<ClientResponse> list(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        return clientService.list(currentCompanyId(authentication), search, page, size);
    }

    @GetMapping("/{id}")
    public ClientResponse get(@PathVariable Long id, Authentication authentication) {
        return clientService.get(currentCompanyId(authentication), id);
    }

    @PutMapping("/{id}")
    public ClientResponse update(
            @PathVariable Long id,
            @Valid @RequestBody ClientRequest request,
            Authentication authentication
    ) {
        return clientService.update(currentCompanyId(authentication), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        clientService.delete(currentCompanyId(authentication), id);
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
