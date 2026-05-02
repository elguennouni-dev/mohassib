package com.elguennouni.mohassib.service;

import com.elguennouni.mohassib.dto.CompanyRequest;
import com.elguennouni.mohassib.dto.CompanyResponse;
import com.elguennouni.mohassib.entity.Company;
import com.elguennouni.mohassib.exception.CompanyAlreadyExistsException;
import com.elguennouni.mohassib.exception.CompanyNotFoundException;
import com.elguennouni.mohassib.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;

    @Transactional(readOnly = true)
    public Optional<Company> findByUserId(Long userId) {
        return companyRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public Optional<Company> findById(Long companyId) {
        return companyRepository.findById(companyId);
    }

    @Transactional(readOnly = true)
    public CompanyResponse getForUser(Long userId) {
        Company company = companyRepository.findByUserId(userId)
                .orElseThrow(CompanyNotFoundException::new);
        return CompanyResponse.from(company);
    }

    @Transactional
    public CompanyResponse createForUser(Long userId, CompanyRequest request) {
        if (companyRepository.existsByUserId(userId)) {
            throw new CompanyAlreadyExistsException();
        }

        Company company = Company.builder()
                .userId(userId)
                .name(request.name().trim())
                .tradeName(blankToNull(request.tradeName()))
                .iceNumber(request.iceNumber().trim())
                .rcNumber(request.rcNumber().trim())
                .cnssNumber(request.cnssNumber().trim())
                .sector(blankToNull(request.sector()))
                .address(request.address().trim())
                .city(request.city().trim())
                .postalCode(blankToNull(request.postalCode()))
                .phone(request.phone().trim())
                .email(request.email().trim().toLowerCase())
                .website(blankToNull(request.website()))
                .employeesCount(request.employeesCount())
                .fiscalYearStart(request.fiscalYearStart())
                .build();

        Company saved = companyRepository.save(company);
        return CompanyResponse.from(saved);
    }

    @Transactional
    public CompanyResponse updateForUser(Long userId, CompanyRequest request) {
        Company company = companyRepository.findByUserId(userId)
                .orElseThrow(CompanyNotFoundException::new);

        company.setName(request.name().trim());
        company.setTradeName(blankToNull(request.tradeName()));
        company.setIceNumber(request.iceNumber().trim());
        company.setRcNumber(request.rcNumber().trim());
        company.setCnssNumber(request.cnssNumber().trim());
        company.setSector(blankToNull(request.sector()));
        company.setAddress(request.address().trim());
        company.setCity(request.city().trim());
        company.setPostalCode(blankToNull(request.postalCode()));
        company.setPhone(request.phone().trim());
        company.setEmail(request.email().trim().toLowerCase());
        company.setWebsite(blankToNull(request.website()));
        company.setEmployeesCount(request.employeesCount());
        company.setFiscalYearStart(request.fiscalYearStart());

        return CompanyResponse.from(company);
    }

    private static String blankToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
