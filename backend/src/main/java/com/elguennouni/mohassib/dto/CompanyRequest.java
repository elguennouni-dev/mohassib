package com.elguennouni.mohassib.dto;

import com.elguennouni.mohassib.entity.FiscalYearStart;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CompanyRequest(
        @NotBlank(message = "Le nom de l'entreprise est obligatoire.")
        @Size(max = 255, message = "Le nom de l'entreprise ne doit pas depasser 255 caracteres.")
        String name,

        @Size(max = 255, message = "Le nom commercial ne doit pas depasser 255 caracteres.")
        String tradeName,

        @NotBlank(message = "Le numero ICE est obligatoire.")
        @Pattern(regexp = "^\\d{15}$", message = "L'ICE doit contenir exactement 15 chiffres.")
        String iceNumber,

        @NotBlank(message = "Le numero du registre du commerce est obligatoire.")
        @Size(max = 50, message = "Le numero RC ne doit pas depasser 50 caracteres.")
        String rcNumber,

        @NotBlank(message = "Le numero CNSS de l'entreprise est obligatoire.")
        @Size(max = 50, message = "Le numero CNSS ne doit pas depasser 50 caracteres.")
        String cnssNumber,

        @Size(max = 100, message = "Le secteur d'activite ne doit pas depasser 100 caracteres.")
        String sector,

        @NotBlank(message = "L'adresse est obligatoire.")
        @Size(max = 2000, message = "L'adresse ne doit pas depasser 2000 caracteres.")
        String address,

        @NotBlank(message = "La ville est obligatoire.")
        @Size(max = 100, message = "La ville ne doit pas depasser 100 caracteres.")
        String city,

        @Size(max = 20, message = "Le code postal ne doit pas depasser 20 caracteres.")
        String postalCode,

        @NotBlank(message = "Le telephone est obligatoire.")
        @Size(min = 8, max = 20, message = "Le telephone doit contenir entre 8 et 20 caracteres.")
        String phone,

        @NotBlank(message = "L'adresse email de l'entreprise est obligatoire.")
        @Email(message = "L'adresse email de l'entreprise n'est pas valide.")
        @Size(max = 255, message = "L'adresse email ne doit pas depasser 255 caracteres.")
        String email,

        @Size(max = 255, message = "L'adresse du site web ne doit pas depasser 255 caracteres.")
        String website,

        @Min(value = 0, message = "Le nombre d'employes ne peut pas etre negatif.")
        @Max(value = 10000, message = "Le nombre d'employes semble trop eleve.")
        Integer employeesCount,

        @NotNull(message = "Le debut de l'exercice fiscal est obligatoire.")
        FiscalYearStart fiscalYearStart
) {}
