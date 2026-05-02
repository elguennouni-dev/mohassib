package com.elguennouni.mohassib.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record InvoiceLineItemRequest(
        @NotBlank(message = "La description de la ligne est obligatoire.")
        @Size(max = 500, message = "La description ne doit pas depasser 500 caracteres.")
        String description,

        @NotNull(message = "La quantite est obligatoire.")
        @DecimalMin(value = "0.0001", message = "La quantite doit etre superieure a zero.")
        BigDecimal quantity,

        @NotNull(message = "Le prix unitaire est obligatoire.")
        @DecimalMin(value = "0.00", message = "Le prix unitaire ne peut pas etre negatif.")
        BigDecimal unitPrice,

        @NotNull(message = "Le taux de TVA est obligatoire.")
        BigDecimal tvaRate
) {}
