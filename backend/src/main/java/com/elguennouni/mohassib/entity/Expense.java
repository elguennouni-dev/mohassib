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
@Table(name = "expenses", indexes = {
        @Index(name = "idx_expenses_company_id", columnList = "company_id"),
        @Index(name = "idx_expenses_company_date", columnList = "company_id,expense_date"),
        @Index(name = "idx_expenses_category", columnList = "company_id,category")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @Column(name = "vendor_name", length = 255)
    private String vendorName;

    @Column(length = 100)
    private String category;

    @Column(name = "base_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal baseAmount;

    @Column(name = "tva_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal tvaRate;

    @Column(name = "tva_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal tvaAmount;

    @Column(name = "total_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "reference_number", length = 100)
    private String referenceNumber;

    @Column(length = 500)
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
