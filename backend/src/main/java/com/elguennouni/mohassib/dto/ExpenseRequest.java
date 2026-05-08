package com.elguennouni.mohassib.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseRequest(
        @NotNull(message = "La date de la dépense est obligatoire.")
        LocalDate expenseDate,

        @Size(max = 255, message = "Le nom du fournisseur ne doit pas dépasser 255 caractères.")
        String vendorName,

        @Size(max = 100, message = "La catégorie ne doit pas dépasser 100 caractères.")
        String category,

        @NotNull(message = "Le montant HT est obligatoire.")
        @DecimalMin(value = "0.00", message = "Le montant HT ne peut pas être négatif.")
        BigDecimal baseAmount,

        @NotNull(message = "Le taux de TVA est obligatoire.")
        BigDecimal tvaRate,

        @Size(max = 100, message = "La référence ne doit pas dépasser 100 caractères.")
        String referenceNumber,

        @Size(max = 500, message = "La description ne doit pas dépasser 500 caractères.")
        String description
) {}
