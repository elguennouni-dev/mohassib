package com.elguennouni.mohassib.dto;

import com.elguennouni.mohassib.entity.TVADeclarationStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UpdateDeclarationStatusRequest(
        @NotNull(message = "Le statut est obligatoire.")
        TVADeclarationStatus status,

        LocalDate submissionDate,

        LocalDate paymentDate,

        @Size(max = 100, message = "La référence ne doit pas dépasser 100 caractères.")
        String referenceNumber,

        @Size(max = 2000, message = "Les notes ne doivent pas dépasser 2000 caractères.")
        String notes
) {}
