package com.elguennouni.mohassib.dto;

import com.elguennouni.mohassib.entity.Employee;
import com.elguennouni.mohassib.entity.EmployeeStatus;
import com.elguennouni.mohassib.entity.EmploymentType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record EmployeeResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        String phone,
        String cinNumber,
        String cnssNumber,
        LocalDate hireDate,
        LocalDate endDate,
        String position,
        String department,
        EmploymentType employmentType,
        BigDecimal baseSalary,
        BigDecimal bonuses,
        BigDecimal allowances,
        String bankAccountNumber,
        String bankName,
        EmployeeStatus status,
        String notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static EmployeeResponse from(Employee e) {
        return new EmployeeResponse(
                e.getId(),
                e.getFirstName(),
                e.getLastName(),
                e.getEmail(),
                e.getPhone(),
                e.getCinNumber(),
                e.getCnssNumber(),
                e.getHireDate(),
                e.getEndDate(),
                e.getPosition(),
                e.getDepartment(),
                e.getEmploymentType(),
                e.getBaseSalary(),
                e.getBonuses(),
                e.getAllowances(),
                e.getBankAccountNumber(),
                e.getBankName(),
                e.getStatus(),
                e.getNotes(),
                e.getCreatedAt(),
                e.getUpdatedAt()
        );
    }
}

