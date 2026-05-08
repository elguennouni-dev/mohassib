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
@Table(name = "salary_slips", indexes = {
        @Index(name = "idx_slips_payroll_id", columnList = "payroll_id"),
        @Index(name = "idx_slips_employee_id", columnList = "employee_id"),
        @Index(name = "idx_slips_company_id", columnList = "company_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalarySlip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "payroll_id", nullable = false)
    private Long payrollId;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    /* Snapshot of employee data at the time the slip was generated.
       Even if the employee record changes later, the slip stays accurate. */

    @Column(name = "employee_first_name", nullable = false, length = 100)
    private String employeeFirstName;

    @Column(name = "employee_last_name", nullable = false, length = 100)
    private String employeeLastName;

    @Column(name = "employee_email", length = 255)
    private String employeeEmail;

    @Column(name = "employee_cin_number", length = 20)
    private String employeeCinNumber;

    @Column(name = "employee_cnss_number", length = 20)
    private String employeeCnssNumber;

    @Column(name = "employee_position", length = 100)
    private String employeePosition;

    /* Salary breakdown */

    @Column(name = "base_salary", nullable = false, precision = 14, scale = 2)
    private BigDecimal baseSalary;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal bonuses;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal allowances;

    @Column(name = "gross_salary", nullable = false, precision = 14, scale = 2)
    private BigDecimal grossSalary;

    @Column(name = "cnss_deduction", nullable = false, precision = 14, scale = 2)
    private BigDecimal cnssDeduction;

    @Column(name = "ir_deduction", nullable = false, precision = 14, scale = 2)
    private BigDecimal irDeduction;

    @Column(name = "other_deductions", nullable = false, precision = 14, scale = 2)
    private BigDecimal otherDeductions;

    @Column(name = "total_deductions", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalDeductions;

    @Column(name = "net_salary", nullable = false, precision = 14, scale = 2)
    private BigDecimal netSalary;

    /* Delivery tracking */

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
