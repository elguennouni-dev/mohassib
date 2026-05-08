package com.elguennouni.mohassib.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "tva_declarations",
        indexes = {
                @Index(name = "idx_tva_declarations_company_id", columnList = "company_id"),
                @Index(name = "idx_tva_declarations_company_year", columnList = "company_id,year")
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_tva_declarations_company_month_year",
                        columnNames = {"company_id", "month", "year"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TVADeclaration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(nullable = false)
    private Integer month;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "tva_collected", nullable = false, precision = 14, scale = 2)
    private BigDecimal tvaCollected;

    @Column(name = "tva_deductible", nullable = false, precision = 14, scale = 2)
    private BigDecimal tvaDeductible;

    @Column(name = "tva_to_pay", nullable = false, precision = 14, scale = 2)
    private BigDecimal tvaToPay;

    @Column(name = "sales_base", nullable = false, precision = 14, scale = 2)
    private BigDecimal salesBase;

    @Column(name = "expenses_base", nullable = false, precision = 14, scale = 2)
    private BigDecimal expensesBase;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TVADeclarationStatus status;

    @Column(name = "submission_date")
    private LocalDate submissionDate;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(name = "reference_number", length = 100)
    private String referenceNumber;

    @Column(length = 2000)
    private String notes;

    @Column(name = "generated_at", nullable = false)
    private LocalDateTime generatedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
