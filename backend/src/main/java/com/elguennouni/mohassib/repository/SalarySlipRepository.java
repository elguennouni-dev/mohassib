package com.elguennouni.mohassib.repository;

import com.elguennouni.mohassib.entity.SalarySlip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalarySlipRepository extends JpaRepository<SalarySlip, Long> {

    List<SalarySlip> findByPayrollIdOrderByEmployeeLastNameAscEmployeeFirstNameAsc(Long payrollId);

    Optional<SalarySlip> findByIdAndCompanyId(Long id, Long companyId);
}
