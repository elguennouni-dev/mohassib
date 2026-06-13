package com.elguennouni.mohassib.repository;

import com.elguennouni.mohassib.entity.Invoice;
import com.elguennouni.mohassib.entity.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
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

    @Modifying
    @Query("""
            UPDATE Invoice i
            SET i.status = com.elguennouni.mohassib.entity.InvoiceStatus.OVERDUE
            WHERE i.status = com.elguennouni.mohassib.entity.InvoiceStatus.SENT
              AND i.paymentStatus <> com.elguennouni.mohassib.entity.PaymentStatus.PAID
              AND i.dueDate IS NOT NULL
              AND i.dueDate < :today
            """)
    int flagOverdueAsOf(@Param("today") LocalDate today);

    /* Reporting / dashboard aggregations.
       Revenue excludes DRAFT and CANCELLED invoices.
       Outstanding = SENT or OVERDUE. */

    @Query("""
            SELECT COALESCE(SUM(i.totalAmount), 0)
            FROM Invoice i
            WHERE i.companyId = :companyId
              AND i.status NOT IN (
                com.elguennouni.mohassib.entity.InvoiceStatus.DRAFT,
                com.elguennouni.mohassib.entity.InvoiceStatus.CANCELLED
              )
              AND i.invoiceDate >= :from
              AND i.invoiceDate <= :to
            """)
    java.math.BigDecimal sumRevenueByDateRange(
            @Param("companyId") Long companyId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
            SELECT COALESCE(SUM(i.tvaAmount), 0)
            FROM Invoice i
            WHERE i.companyId = :companyId
              AND i.status NOT IN (
                com.elguennouni.mohassib.entity.InvoiceStatus.DRAFT,
                com.elguennouni.mohassib.entity.InvoiceStatus.CANCELLED
              )
              AND i.invoiceDate >= :from
              AND i.invoiceDate <= :to
            """)
    java.math.BigDecimal sumTvaByDateRange(
            @Param("companyId") Long companyId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
            SELECT COUNT(i)
            FROM Invoice i
            WHERE i.companyId = :companyId
              AND i.status IN (
                com.elguennouni.mohassib.entity.InvoiceStatus.SENT,
                com.elguennouni.mohassib.entity.InvoiceStatus.OVERDUE
              )
            """)
    long countOutstanding(@Param("companyId") Long companyId);

    @Query("""
            SELECT COALESCE(SUM(i.totalAmount), 0)
            FROM Invoice i
            WHERE i.companyId = :companyId
              AND i.status IN (
                com.elguennouni.mohassib.entity.InvoiceStatus.SENT,
                com.elguennouni.mohassib.entity.InvoiceStatus.OVERDUE
              )
            """)
    java.math.BigDecimal sumOutstanding(@Param("companyId") Long companyId);

    @Query("""
            SELECT COUNT(i)
            FROM Invoice i
            WHERE i.companyId = :companyId
              AND i.status = com.elguennouni.mohassib.entity.InvoiceStatus.OVERDUE
            """)
    long countOverdue(@Param("companyId") Long companyId);

    @Query("""
            SELECT COALESCE(SUM(i.totalAmount), 0)
            FROM Invoice i
            WHERE i.companyId = :companyId
              AND i.status = com.elguennouni.mohassib.entity.InvoiceStatus.OVERDUE
            """)
    java.math.BigDecimal sumOverdue(@Param("companyId") Long companyId);

    @Query("""
            SELECT COUNT(i)
            FROM Invoice i
            WHERE i.companyId = :companyId
              AND i.status NOT IN (
                com.elguennouni.mohassib.entity.InvoiceStatus.DRAFT,
                com.elguennouni.mohassib.entity.InvoiceStatus.CANCELLED
              )
              AND i.invoiceDate >= :from
              AND i.invoiceDate <= :to
            """)
    long countByDateRange(
            @Param("companyId") Long companyId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
            SELECT COUNT(i)
            FROM Invoice i
            WHERE i.companyId = :companyId
              AND i.paymentStatus = com.elguennouni.mohassib.entity.PaymentStatus.PAID
              AND i.status NOT IN (
                com.elguennouni.mohassib.entity.InvoiceStatus.DRAFT,
                com.elguennouni.mohassib.entity.InvoiceStatus.CANCELLED
              )
              AND i.invoiceDate >= :from
              AND i.invoiceDate <= :to
            """)
    long countPaidByDateRange(
            @Param("companyId") Long companyId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
            SELECT COALESCE(SUM(i.totalAmount), 0)
            FROM Invoice i
            WHERE i.companyId = :companyId
              AND i.paymentStatus = com.elguennouni.mohassib.entity.PaymentStatus.PAID
              AND i.status NOT IN (
                com.elguennouni.mohassib.entity.InvoiceStatus.DRAFT,
                com.elguennouni.mohassib.entity.InvoiceStatus.CANCELLED
              )
              AND i.invoiceDate >= :from
              AND i.invoiceDate <= :to
            """)
    java.math.BigDecimal sumPaidByDateRange(
            @Param("companyId") Long companyId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    java.util.List<Invoice> findTop5ByCompanyIdOrderByCreatedAtDesc(Long companyId);

    @Query("""
            SELECT COUNT(i)
            FROM Invoice i
            WHERE i.companyId = :companyId
              AND i.status = com.elguennouni.mohassib.entity.InvoiceStatus.SENT
              AND i.paymentStatus <> com.elguennouni.mohassib.entity.PaymentStatus.PAID
              AND i.dueDate IS NOT NULL
              AND i.dueDate >= :from
              AND i.dueDate <= :to
            """)
    long countDueBetween(
            @Param("companyId") Long companyId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );
}
