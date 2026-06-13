package com.elguennouni.mohassib.config;

import com.elguennouni.mohassib.entity.User;
import com.elguennouni.mohassib.service.CompanyService;
import com.elguennouni.mohassib.service.JwtService;
import com.elguennouni.mohassib.service.OAuth2UserProvisioningService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Bridges Google OAuth2 to the application's JWT model.
 *
 * On a successful Google sign-in, find or create the local user, mint our
 * standard access + refresh JWTs, and redirect to the SPA's callback page
 * carrying the tokens in the URL fragment (so they don't hit server logs
 * or browser history search).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final OAuth2UserProvisioningService provisioningService;
    private final JwtService jwtService;
    private final CompanyService companyService;

    @Value("${mohassib.frontend.base-url}")
    private String frontendBaseUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        try {
            OAuth2User principal = (OAuth2User) authentication.getPrincipal();
            String googleSubject = principal.getAttribute("sub");
            String email = principal.getAttribute("email");
            String firstName = principal.getAttribute("given_name");
            String lastName = principal.getAttribute("family_name");

            if (googleSubject == null || googleSubject.isBlank()) {
                throw new IllegalStateException("Aucun identifiant Google (sub) recu.");
            }

            User user = provisioningService.findOrCreate(googleSubject, email, firstName, lastName);

            String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail());
            String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());
            boolean hasCompany = companyService.findByUserId(user.getId()).isPresent();

            // Tokens in fragment — never sent to the server, never logged.
            String redirectUrl = UriComponentsBuilder.fromUriString(frontendBaseUrl)
                    .path("/auth/oauth-callback")
                    .build(true)
                    .toUriString()
                    + "#accessToken=" + URLEncoder.encode(accessToken, StandardCharsets.UTF_8)
                    + "&refreshToken=" + URLEncoder.encode(refreshToken, StandardCharsets.UTF_8)
                    + "&hasCompany=" + hasCompany;

            response.sendRedirect(redirectUrl);

        } catch (RuntimeException ex) {
            log.warn("Echec connexion Google: {}", ex.getMessage());
            String fallback = UriComponentsBuilder.fromUriString(frontendBaseUrl)
                    .path("/connexion")
                    .queryParam("oauth_error", "google")
                    .build(true)
                    .toUriString();
            response.sendRedirect(fallback);
        }
    }
}
