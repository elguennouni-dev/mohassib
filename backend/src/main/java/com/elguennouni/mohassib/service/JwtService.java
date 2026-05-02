package com.elguennouni.mohassib.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

@Service
public class JwtService {

    private static final String CLAIM_TOKEN_TYPE = "type";
    private static final String TOKEN_TYPE_ACCESS = "access";
    private static final String TOKEN_TYPE_REFRESH = "refresh";

    private final SecretKey signingKey;
    private final long accessTokenTtlSeconds;
    private final long refreshTokenTtlSeconds;
    private final String issuer;

    public JwtService(
            @Value("${mohassib.jwt.secret}") String secret,
            @Value("${mohassib.jwt.access-token-ttl-minutes}") long accessTtlMinutes,
            @Value("${mohassib.jwt.refresh-token-ttl-days}") long refreshTtlDays,
            @Value("${mohassib.jwt.issuer}") String issuer
    ) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenTtlSeconds = accessTtlMinutes * 60;
        this.refreshTokenTtlSeconds = refreshTtlDays * 24 * 60 * 60;
        this.issuer = issuer;
    }

    public String generateAccessToken(Long userId, String email) {
        return buildToken(userId, email, TOKEN_TYPE_ACCESS, accessTokenTtlSeconds);
    }

    public String generateRefreshToken(Long userId, String email) {
        return buildToken(userId, email, TOKEN_TYPE_REFRESH, refreshTokenTtlSeconds);
    }

    public long getAccessTokenTtlSeconds() {
        return accessTokenTtlSeconds;
    }

    public Optional<Claims> parseAndValidate(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .requireIssuer(issuer)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return Optional.of(claims);
        } catch (JwtException | IllegalArgumentException ex) {
            return Optional.empty();
        }
    }

    public boolean isAccessToken(Claims claims) {
        return TOKEN_TYPE_ACCESS.equals(claims.get(CLAIM_TOKEN_TYPE, String.class));
    }

    public boolean isRefreshToken(Claims claims) {
        return TOKEN_TYPE_REFRESH.equals(claims.get(CLAIM_TOKEN_TYPE, String.class));
    }

    public Long extractUserId(Claims claims) {
        return Long.valueOf(claims.getSubject());
    }

    private String buildToken(Long userId, String email, String tokenType, long ttlSeconds) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .issuer(issuer)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(ttlSeconds)))
                .claim("email", email)
                .claim(CLAIM_TOKEN_TYPE, tokenType)
                .signWith(signingKey)
                .compact();
    }
}
