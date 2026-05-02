package com.elguennouni.mohassib.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Le prenom est obligatoire.")
        @Size(max = 100, message = "Le prenom ne doit pas depasser 100 caracteres.")
        String firstName,

        @NotBlank(message = "Le nom est obligatoire.")
        @Size(max = 100, message = "Le nom ne doit pas depasser 100 caracteres.")
        String lastName,

        @NotBlank(message = "L'adresse email est obligatoire.")
        @Email(message = "L'adresse email n'est pas valide.")
        @Size(max = 255, message = "L'adresse email ne doit pas depasser 255 caracteres.")
        String email,

        @NotBlank(message = "Le mot de passe est obligatoire.")
        @Size(min = 8, max = 100, message = "Le mot de passe doit contenir entre 8 et 100 caracteres.")
        String password
) {}
