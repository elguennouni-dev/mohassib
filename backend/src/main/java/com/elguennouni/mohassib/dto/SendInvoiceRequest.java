package com.elguennouni.mohassib.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SendInvoiceRequest(
        @NotBlank(message = "L'adresse email du destinataire est obligatoire.")
        @Email(message = "L'adresse email du destinataire n'est pas valide.")
        @Size(max = 255, message = "L'adresse email ne doit pas depasser 255 caracteres.")
        String recipientEmail,

        @Size(max = 500, message = "Le sujet ne doit pas depasser 500 caracteres.")
        String subject,

        @Size(max = 5000, message = "Le message ne doit pas depasser 5000 caracteres.")
        String message
) {}
