package com.elguennouni.mohassib.controller;

import com.elguennouni.mohassib.dto.NotificationResponse;
import com.elguennouni.mohassib.dto.NotificationSummaryResponse;
import com.elguennouni.mohassib.dto.PageResponse;
import com.elguennouni.mohassib.exception.CompanyNotFoundException;
import com.elguennouni.mohassib.exception.InvalidTokenException;
import com.elguennouni.mohassib.service.CompanyService;
import com.elguennouni.mohassib.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final CompanyService companyService;

    @GetMapping("/summary")
    public NotificationSummaryResponse summary(Authentication authentication) {
        return notificationService.summary(currentCompanyId(authentication));
    }

    @GetMapping
    public PageResponse<NotificationResponse> list(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        int safeSize = Math.max(1, Math.min(size, 100));
        return notificationService.list(currentCompanyId(authentication), page, safeSize);
    }

    @PostMapping("/{id}/read")
    public NotificationResponse markAsRead(Authentication authentication, @PathVariable Long id) {
        return notificationService.markAsRead(currentCompanyId(authentication), id);
    }

    @PostMapping("/read-all")
    public Map<String, Integer> markAllAsRead(Authentication authentication) {
        int updated = notificationService.markAllAsRead(currentCompanyId(authentication));
        return Map.of("updated", updated);
    }

    private Long currentCompanyId(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new InvalidTokenException();
        }
        Long userId = (Long) authentication.getPrincipal();
        return companyService.findByUserId(userId)
                .orElseThrow(CompanyNotFoundException::new)
                .getId();
    }
}
