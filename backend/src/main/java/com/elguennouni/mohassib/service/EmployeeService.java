package com.elguennouni.mohassib.service;

import com.elguennouni.mohassib.dto.EmployeeRequest;
import com.elguennouni.mohassib.dto.EmployeeResponse;
import com.elguennouni.mohassib.dto.PageResponse;
import com.elguennouni.mohassib.entity.Employee;
import com.elguennouni.mohassib.entity.EmployeeStatus;
import com.elguennouni.mohassib.exception.EmployeeNotFoundException;
import com.elguennouni.mohassib.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public PageResponse<EmployeeResponse> list(
            Long companyId,
            String search,
            EmployeeStatus status,
            int page,
            int size
    ) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), 100);
        Pageable pageable = PageRequest.of(
                safePage,
                safeSize,
                Sort.by(Sort.Order.asc("lastName"), Sort.Order.asc("firstName"))
        );

        Page<Employee> result;
        boolean hasSearch = search != null && !search.isBlank();
        if (status != null && hasSearch) {
            result = employeeRepository.searchByCompanyIdAndStatus(companyId, status, search.trim(), pageable);
        } else if (status != null) {
            result = employeeRepository.findByCompanyIdAndStatus(companyId, status, pageable);
        } else if (hasSearch) {
            result = employeeRepository.searchByCompanyId(companyId, search.trim(), pageable);
        } else {
            result = employeeRepository.findByCompanyId(companyId, pageable);
        }
        return PageResponse.from(result, EmployeeResponse::from);
    }

    @Transactional(readOnly = true)
    public EmployeeResponse get(Long companyId, Long employeeId) {
        return EmployeeResponse.from(findOrThrow(companyId, employeeId));
    }

    @Transactional
    public EmployeeResponse create(Long companyId, EmployeeRequest request) {
        Employee employee = Employee.builder()
                .companyId(companyId)
                .firstName(request.firstName().trim())
                .lastName(request.lastName().trim())
                .email(blankToNull(request.email()))
                .phone(blankToNull(request.phone()))
                .cinNumber(blankToNull(request.cinNumber()))
                .cnssNumber(blankToNull(request.cnssNumber()))
                .hireDate(request.hireDate())
                .endDate(request.endDate())
                .position(blankToNull(request.position()))
                .department(blankToNull(request.department()))
                .employmentType(request.employmentType())
                .baseSalary(request.baseSalary())
                .bonuses(request.bonuses() != null ? request.bonuses() : BigDecimal.ZERO)
                .allowances(request.allowances() != null ? request.allowances() : BigDecimal.ZERO)
                .bankAccountNumber(blankToNull(request.bankAccountNumber()))
                .bankName(blankToNull(request.bankName()))
                .status(request.status())
                .notes(blankToNull(request.notes()))
                .build();
        return EmployeeResponse.from(employeeRepository.save(employee));
    }

    @Transactional
    public EmployeeResponse update(Long companyId, Long employeeId, EmployeeRequest request) {
        Employee employee = findOrThrow(companyId, employeeId);
        employee.setFirstName(request.firstName().trim());
        employee.setLastName(request.lastName().trim());
        employee.setEmail(blankToNull(request.email()));
        employee.setPhone(blankToNull(request.phone()));
        employee.setCinNumber(blankToNull(request.cinNumber()));
        employee.setCnssNumber(blankToNull(request.cnssNumber()));
        employee.setHireDate(request.hireDate());
        employee.setEndDate(request.endDate());
        employee.setPosition(blankToNull(request.position()));
        employee.setDepartment(blankToNull(request.department()));
        employee.setEmploymentType(request.employmentType());
        employee.setBaseSalary(request.baseSalary());
        employee.setBonuses(request.bonuses() != null ? request.bonuses() : BigDecimal.ZERO);
        employee.setAllowances(request.allowances() != null ? request.allowances() : BigDecimal.ZERO);
        employee.setBankAccountNumber(blankToNull(request.bankAccountNumber()));
        employee.setBankName(blankToNull(request.bankName()));
        employee.setStatus(request.status());
        employee.setNotes(blankToNull(request.notes()));
        return EmployeeResponse.from(employee);
    }

    @Transactional
    public void delete(Long companyId, Long employeeId) {
        Employee employee = findOrThrow(companyId, employeeId);
        employeeRepository.delete(employee);
    }

    private Employee findOrThrow(Long companyId, Long employeeId) {
        return employeeRepository.findByIdAndCompanyId(employeeId, companyId)
                .orElseThrow(EmployeeNotFoundException::new);
    }

    private static String blankToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
