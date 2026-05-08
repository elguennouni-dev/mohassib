package com.elguennouni.mohassib.repository;

import com.elguennouni.mohassib.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {

    Optional<Payroll> findByIdAndCompanyId(Long id, Long companyId);

    boolean existsByCompanyIdAndMonthAndYear(Long companyId, Integer month, Integer year);

    List<Payroll> findByCompanyIdOrderByYearDescMonthDesc(Long companyId);

    List<Payroll> findByCompanyIdAndYearOrderByMonthDesc(Long companyId, Integer year);
}
