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
import java.time.LocalDateTime;

@Entity
@Table(
        name = "payrolls",
        indexes = {
                @Index(name = "idx_payrolls_company_id", columnList = "company_id"),
                @Index(name = "idx_payrolls_company_year", columnList = "company_id,year")
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_payrolls_company_month_year",
                        columnNames = {"company_id", "month", "year"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(nullable = false)
    private Integer month;

    @Column(nullable = false)
    private Integer year;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PayrollStatus status;

    @Column(name = "employee_count", nullable = false)
    private Integer employeeCount;

    @Column(name = "total_gross_salary", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalGrossSalary;

    @Column(name = "total_cnss_deduction", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalCnssDeduction;

    @Column(name = "total_ir_deduction", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalIrDeduction;

    @Column(name = "total_other_deductions", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalOtherDeductions;

    @Column(name = "total_net_salary", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalNetSalary;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(length = 2000)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
