package com.elguennouni.mohassib.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "companies", indexes = {
        @Index(name = "idx_companies_user_id", columnList = "user_id", unique = true),
        @Index(name = "idx_companies_ice_number", columnList = "ice_number"),
        @Index(name = "idx_companies_rc_number", columnList = "rc_number")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "trade_name", length = 255)
    private String tradeName;

    @Column(name = "ice_number", nullable = false, length = 15)
    private String iceNumber;

    @Column(name = "rc_number", nullable = false, length = 50)
    private String rcNumber;

    @Column(name = "cnss_number", nullable = false, length = 50)
    private String cnssNumber;

    @Column(length = 100)
    private String sector;

    @Column(nullable = false, length = 2000)
    private String address;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(length = 255)
    private String website;

    @Column(name = "employees_count")
    private Integer employeesCount;

    @Enumerated(EnumType.STRING)
    @Column(name = "fiscal_year_start", nullable = false, length = 20)
    private FiscalYearStart fiscalYearStart;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
