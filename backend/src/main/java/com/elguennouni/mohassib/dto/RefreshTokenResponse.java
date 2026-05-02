package com.elguennouni.mohassib.dto;

public record RefreshTokenResponse(
        String accessToken,
        long expiresIn
) {}
