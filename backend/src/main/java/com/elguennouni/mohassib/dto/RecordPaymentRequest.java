package com.elguennouni.mohassib.dto;

import com.elguennouni.mohassib.entity.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RecordPaymentRequest(
        @NotNull(message = "Le montant du paiement est obligatoire.")
        @DecimalMin(value = "0.01", message = "Le montant doit etre superieur a zero.")
        BigDecimal amount,

        @NotNull(message = "Le mode de paiement est obligatoire.")
        PaymentMethod paymentMethod,

        @NotNull(message = "La date du paiement est obligatoire.")
        LocalDate paymentDate,

        @Size(max = 100, message = "La reference ne doit pas depasser 100 caracteres.")
        String referenceNumber,

        @Size(max = 1000, message = "Les notes ne doivent pas depasser 1000 caracteres.")
        String notes
) {}
