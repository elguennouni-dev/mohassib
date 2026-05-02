package com.elguennouni.mohassib.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "invoice_line_items", indexes = {
        @Index(name = "idx_line_items_invoice_id", columnList = "invoice_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceLineItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @Column(name = "line_number", nullable = false)
    private Integer lineNumber;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(nullable = false, precision = 14, scale = 4)
    private BigDecimal quantity;

    @Column(name = "unit_price", nullable = false, precision = 14, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "tva_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal tvaRate;

    @Column(name = "line_subtotal", nullable = false, precision = 14, scale = 2)
    private BigDecimal lineSubtotal;

    @Column(name = "line_tva", nullable = false, precision = 14, scale = 2)
    private BigDecimal lineTva;

    @Column(name = "line_total", nullable = false, precision = 14, scale = 2)
    private BigDecimal lineTotal;
}
