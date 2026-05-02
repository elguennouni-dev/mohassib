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
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "invoices",
        indexes = {
                @Index(name = "idx_invoices_company_id", columnList = "company_id"),
                @Index(name = "idx_invoices_company_status", columnList = "company_id,status"),
                @Index(name = "idx_invoices_client_id", columnList = "client_id"),
                @Index(name = "idx_invoices_company_date", columnList = "company_id,invoice_date")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_invoices_company_invoice_number", columnNames = {"company_id", "invoice_number"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "client_name", nullable = false, length = 255)
    private String clientName;

    @Column(name = "invoice_number", nullable = false, length = 50)
    private String invoiceNumber;

    @Column(name = "invoice_date", nullable = false)
    private LocalDate invoiceDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "payment_terms", length = 500)
    private String paymentTerms;

    @Column(length = 2000)
    private String notes;

    @Column(name = "net_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal netAmount;

    @Column(name = "tva_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal tvaAmount;

    @Column(name = "total_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InvoiceStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    private PaymentStatus paymentStatus;

    @Column(name = "sent_date")
    private LocalDateTime sentDate;

    @OneToMany(
            mappedBy = "invoice",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @OrderBy("lineNumber ASC")
    @Builder.Default
    private List<InvoiceLineItem> lineItems = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public void addLineItem(InvoiceLineItem line) {
        lineItems.add(line);
        line.setInvoice(this);
    }

    public void clearLineItems() {
        lineItems.clear();
    }
}
