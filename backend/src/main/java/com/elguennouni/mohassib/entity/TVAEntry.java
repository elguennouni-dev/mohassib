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
@Table(name = "tva_entries", indexes = {
        @Index(name = "idx_tva_entries_company_id", columnList = "company_id"),
        @Index(name = "idx_tva_entries_company_date", columnList = "company_id,entry_date"),
        @Index(name = "idx_tva_entries_source", columnList = "source_type,source_id"),
        @Index(name = "idx_tva_entries_company_type", columnList = "company_id,type")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TVAEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TVAEntryType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 20)
    private TVAEntrySourceType sourceType;

    @Column(name = "source_id")
    private Long sourceId;

    @Column(name = "entry_date", nullable = false)
    private LocalDate entryDate;

    @Column(name = "base_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal baseAmount;

    @Column(name = "tva_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal tvaRate;

    @Column(name = "tva_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal tvaAmount;

    @Column(length = 500)
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
