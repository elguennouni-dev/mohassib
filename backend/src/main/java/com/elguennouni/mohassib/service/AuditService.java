package com.elguennouni.mohassib.service;

import com.elguennouni.mohassib.entity.AuditLog;
import com.elguennouni.mohassib.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public void log(Long companyId, String action, String entityType, Long entityId) {
        log(companyId, action, entityType, entityId, null);
    }

    public void log(Long companyId, String action, String entityType, Long entityId, String details) {
        try {
            AuditLog entry = AuditLog.builder()
                    .companyId(companyId)
                    .userId(currentUserId())
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .ipAddress(currentIp())
                    .details(truncate(details, 500))
                    .build();
            auditLogRepository.save(entry);
        } catch (Exception ex) {
            log.warn("Failed to write audit log for action {} entity {}#{}: {}",
                    action, entityType, entityId, ex.getMessage());
        }
    }

    private static Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        Object principal = auth.getPrincipal();
        if (principal instanceof Long l) return l;
        return null;
    }

    private static String currentIp() {
        try {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null) return null;
            HttpServletRequest req = attrs.getRequest();
            String xff = req.getHeader("X-Forwarded-For");
            if (xff != null && !xff.isBlank()) return xff.split(",")[0].trim();
            String realIp = req.getHeader("X-Real-IP");
            if (realIp != null && !realIp.isBlank()) return realIp.trim();
            return req.getRemoteAddr();
        } catch (Exception ex) {
            return null;
        }
    }

    private static String truncate(String value, int max) {
        if (value == null) return null;
        return value.length() <= max ? value : value.substring(0, max);
    }
}
