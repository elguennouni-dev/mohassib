package com.elguennouni.mohassib.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ClientRequest(
        @NotBlank(message = "Le nom du client est obligatoire.")
        @Size(max = 255, message = "Le nom du client ne doit pas depasser 255 caracteres.")
        String name,

        @Email(message = "L'adresse email du client n'est pas valide.")
        @Size(max = 255, message = "L'adresse email ne doit pas depasser 255 caracteres.")
        String email,

        @Size(max = 20, message = "Le telephone ne doit pas depasser 20 caracteres.")
        String phone,

        @Size(max = 2000, message = "L'adresse ne doit pas depasser 2000 caracteres.")
        String address,

        @Size(max = 100, message = "La ville ne doit pas depasser 100 caracteres.")
        String city,

        @Size(max = 20, message = "Le code postal ne doit pas depasser 20 caracteres.")
        String postalCode,

        @Pattern(regexp = "^(\\d{15})?$", message = "L'ICE doit contenir exactement 15 chiffres.")
        String iceNumber,

        @Size(max = 255, message = "Le nom du contact ne doit pas depasser 255 caracteres.")
        String contactPerson,

        @Size(max = 2000, message = "Les notes ne doivent pas depasser 2000 caracteres.")
        String notes
) {}
