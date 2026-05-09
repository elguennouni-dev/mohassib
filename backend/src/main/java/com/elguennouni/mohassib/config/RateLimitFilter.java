package com.elguennouni.mohassib.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple per-IP sliding-window rate limit on the auth endpoints. In-memory only —
 * sufficient for a single-VPS MVP. Replace with Redis-based bucket if we ever
 * scale to multiple instances.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int LOGIN_MAX_ATTEMPTS = 10;
    private static final long LOGIN_WINDOW_MS = 60_000;

    private static final int REGISTER_MAX_ATTEMPTS = 5;
    private static final long REGISTER_WINDOW_MS = 60_000;

    private final Map<String, Bucket> loginBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> registerBuckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String uri = request.getRequestURI();
        boolean isPost = "POST".equalsIgnoreCase(request.getMethod());

        if (isPost && uri.endsWith("/auth/login")) {
            if (!tryConsume(loginBuckets, clientIp(request), LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS)) {
                writeRateLimited(response, "Trop de tentatives de connexion. Réessayez dans une minute.");
                return;
            }
        } else if (isPost && uri.endsWith("/auth/register")) {
            if (!tryConsume(registerBuckets, clientIp(request), REGISTER_MAX_ATTEMPTS, REGISTER_WINDOW_MS)) {
                writeRateLimited(response, "Trop d'inscriptions depuis cette adresse. Réessayez dans une minute.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private static boolean tryConsume(Map<String, Bucket> buckets, String key, int max, long windowMs) {
        Bucket bucket = buckets.computeIfAbsent(key, k -> new Bucket());
        return bucket.tryConsume(max, windowMs);
    }

    private static String clientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }

    private static void writeRateLimited(HttpServletResponse response, String message) throws IOException {
        response.setStatus(429);
        response.setContentType("application/json;charset=UTF-8");
        response.setHeader("Retry-After", "60");

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", 429);
        body.put("error", "RATE_LIMIT_EXCEEDED");
        body.put("message", message);

        StringBuilder json = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Object> entry : body.entrySet()) {
            if (!first) json.append(",");
            json.append("\"").append(entry.getKey()).append("\":");
            Object value = entry.getValue();
            if (value instanceof Number) {
                json.append(value);
            } else {
                json.append("\"").append(value.toString().replace("\"", "\\\"")).append("\"");
            }
            first = false;
        }
        json.append("}");
        response.getWriter().write(json.toString());
    }

    private static final class Bucket {
        private int count;
        private long windowStart;

        synchronized boolean tryConsume(int max, long windowMs) {
            long now = System.currentTimeMillis();
            if (now - windowStart > windowMs) {
                windowStart = now;
                count = 0;
            }
            if (count >= max) return false;
            count++;
            return true;
        }
    }
}
