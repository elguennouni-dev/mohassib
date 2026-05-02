package com.elguennouni.mohassib.dto;

import jakarta.validation.constraints.NotBlank;

public record RefreshTokenRequest(
        @NotBlank(message = "Le jeton de rafraichissement est obligatoire.")
        String refreshToken
) {}
