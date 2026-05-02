package com.elguennouni.mohassib.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record InvoiceRequest(
        @NotNull(message = "Le client est obligatoire.")
        Long clientId,

        @NotNull(message = "La date de facture est obligatoire.")
        LocalDate invoiceDate,

        LocalDate dueDate,

        @Size(max = 500, message = "Les conditions de paiement ne doivent pas depasser 500 caracteres.")
        String paymentTerms,

        @Size(max = 2000, message = "Les notes ne doivent pas depasser 2000 caracteres.")
        String notes,

        @NotEmpty(message = "Au moins une ligne de facture est obligatoire.")
        @Valid
        List<InvoiceLineItemRequest> lineItems
) {}
