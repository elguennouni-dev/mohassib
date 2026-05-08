package com.elguennouni.mohassib.repository;

import com.elguennouni.mohassib.entity.TVADeclaration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TVADeclarationRepository extends JpaRepository<TVADeclaration, Long> {

    Optional<TVADeclaration> findByIdAndCompanyId(Long id, Long companyId);

    Optional<TVADeclaration> findByCompanyIdAndMonthAndYear(Long companyId, Integer month, Integer year);

    List<TVADeclaration> findByCompanyIdOrderByYearDescMonthDesc(Long companyId);

    List<TVADeclaration> findByCompanyIdAndYearOrderByMonthDesc(Long companyId, Integer year);
}
