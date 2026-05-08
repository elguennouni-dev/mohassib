package com.elguennouni.mohassib.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record GenerateDeclarationRequest(
        @NotNull(message = "Le mois est obligatoire.")
        @Min(value = 1, message = "Le mois doit être compris entre 1 et 12.")
        @Max(value = 12, message = "Le mois doit être compris entre 1 et 12.")
        Integer month,

        @NotNull(message = "L'année est obligatoire.")
        @Min(value = 2000, message = "L'année doit être raisonnable.")
        @Max(value = 2100, message = "L'année doit être raisonnable.")
        Integer year
) {}
