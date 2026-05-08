package com.elguennouni.mohassib.repository;

import com.elguennouni.mohassib.entity.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    Optional<Expense> findByIdAndCompanyId(Long id, Long companyId);

    Page<Expense> findByCompanyIdOrderByExpenseDateDescIdDesc(Long companyId, Pageable pageable);

    @Query("""
            SELECT e FROM Expense e
            WHERE e.companyId = :companyId
              AND (
                LOWER(COALESCE(e.vendorName, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(e.category, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(e.description, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(e.referenceNumber, '')) LIKE LOWER(CONCAT('%', :search, '%'))
              )
            ORDER BY e.expenseDate DESC, e.id DESC
            """)
    Page<Expense> searchByCompanyId(
            @Param("companyId") Long companyId,
            @Param("search") String search,
            Pageable pageable
    );
}
