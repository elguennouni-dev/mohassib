package com.elguennouni.mohassib.repository;

import com.elguennouni.mohassib.entity.Invoice;
import com.elguennouni.mohassib.entity.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    @EntityGraph(attributePaths = "lineItems")
    Optional<Invoice> findByIdAndCompanyId(Long id, Long companyId);

    Page<Invoice> findByCompanyId(Long companyId, Pageable pageable);

    Page<Invoice> findByCompanyIdAndStatus(Long companyId, InvoiceStatus status, Pageable pageable);

    @Query("""
            SELECT i FROM Invoice i
            WHERE i.companyId = :companyId
              AND (
                LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(i.clientName) LIKE LOWER(CONCAT('%', :search, '%'))
              )
            """)
    Page<Invoice> searchByCompanyId(
            @Param("companyId") Long companyId,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("""
            SELECT i FROM Invoice i
            WHERE i.companyId = :companyId
              AND i.status = :status
              AND (
                LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(i.clientName) LIKE LOWER(CONCAT('%', :search, '%'))
              )
            """)
    Page<Invoice> searchByCompanyIdAndStatus(
            @Param("companyId") Long companyId,
            @Param("status") InvoiceStatus status,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("""
            SELECT COUNT(i) FROM Invoice i
            WHERE i.companyId = :companyId
              AND EXTRACT(YEAR FROM i.invoiceDate) = :year
            """)
    long countByCompanyIdAndYear(
            @Param("companyId") Long companyId,
            @Param("year") int year
    );
}
