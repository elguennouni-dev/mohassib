package com.elguennouni.mohassib.dto;

import com.elguennouni.mohassib.entity.EmployeeStatus;
import com.elguennouni.mohassib.entity.EmploymentType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record EmployeeRequest(
        @NotBlank(message = "Le prénom est obligatoire.")
        @Size(max = 100, message = "Le prénom ne doit pas dépasser 100 caractères.")
        String firstName,

        @NotBlank(message = "Le nom est obligatoire.")
        @Size(max = 100, message = "Le nom ne doit pas dépasser 100 caractères.")
        String lastName,

        @Email(message = "L'adresse email n'est pas valide.")
        @Size(max = 255, message = "L'adresse email ne doit pas dépasser 255 caractères.")
        String email,

        @Size(max = 20, message = "Le téléphone ne doit pas dépasser 20 caractères.")
        String phone,

        @Size(max = 20, message = "Le numéro CIN ne doit pas dépasser 20 caractères.")
        String cinNumber,

        @Size(max = 20, message = "Le numéro CNSS ne doit pas dépasser 20 caractères.")
        String cnssNumber,

        @NotNull(message = "La date d'embauche est obligatoire.")
        LocalDate hireDate,

        LocalDate endDate,

        @Size(max = 100, message = "Le poste ne doit pas dépasser 100 caractères.")
        String position,

        @Size(max = 100, message = "Le département ne doit pas dépasser 100 caractères.")
        String department,

        @NotNull(message = "Le type de contrat est obligatoire.")
        EmploymentType employmentType,

        @NotNull(message = "Le salaire de base est obligatoire.")
        @DecimalMin(value = "0.00", message = "Le salaire de base ne peut pas être négatif.")
        BigDecimal baseSalary,

        @DecimalMin(value = "0.00", message = "Les primes ne peuvent pas être négatives.")
        BigDecimal bonuses,

        @DecimalMin(value = "0.00", message = "Les indemnités ne peuvent pas être négatives.")
        BigDecimal allowances,

        @Size(max = 50, message = "Le numéro de compte bancaire ne doit pas dépasser 50 caractères.")
        String bankAccountNumber,

        @Size(max = 100, message = "Le nom de la banque ne doit pas dépasser 100 caractères.")
        String bankName,

        @NotNull(message = "Le statut est obligatoire.")
        EmployeeStatus status,

        @Size(max = 2000, message = "Les notes ne doivent pas dépasser 2000 caractères.")
        String notes
) {}
