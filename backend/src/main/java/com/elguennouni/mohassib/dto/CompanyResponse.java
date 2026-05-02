package com.elguennouni.mohassib.dto;

import com.elguennouni.mohassib.entity.Company;
import com.elguennouni.mohassib.entity.FiscalYearStart;

import java.time.LocalDateTime;

public record CompanyResponse(
        Long id,
        String name,
        String tradeName,
        String iceNumber,
        String rcNumber,
        String cnssNumber,
        String sector,
        String address,
        String city,
        String postalCode,
        String phone,
        String email,
        String website,
        Integer employeesCount,
        FiscalYearStart fiscalYearStart,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static CompanyResponse from(Company c) {
        return new CompanyResponse(
                c.getId(),
                c.getName(),
                c.getTradeName(),
                c.getIceNumber(),
                c.getRcNumber(),
                c.getCnssNumber(),
                c.getSector(),
                c.getAddress(),
                c.getCity(),
                c.getPostalCode(),
                c.getPhone(),
                c.getEmail(),
                c.getWebsite(),
                c.getEmployeesCount(),
                c.getFiscalYearStart(),
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }
}
