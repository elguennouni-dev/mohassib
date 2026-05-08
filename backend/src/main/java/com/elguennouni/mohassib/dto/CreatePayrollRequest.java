package com.elguennouni.mohassib.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreatePayrollRequest(
        @NotNull(message = "Le mois est obligatoire.")
        @Min(value = 1, message = "Le mois doit etre compris entre 1 et 12.")
        @Max(value = 12, message = "Le mois doit etre compris entre 1 et 12.")
        Integer month,

        @NotNull(message = "L'annee est obligatoire.")
        @Min(value = 2000, message = "L'annee doit etre raisonnable.")
        @Max(value = 2100, message = "L'annee doit etre raisonnable.")
        Integer year,

        @Size(max = 2000, message = "Les notes ne doivent pas depasser 2000 caracteres.")
        String notes
) {}
