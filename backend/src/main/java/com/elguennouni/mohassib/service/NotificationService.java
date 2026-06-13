package com.elguennouni.mohassib.service;

import com.elguennouni.mohassib.dto.NotificationResponse;
import com.elguennouni.mohassib.dto.NotificationSummaryResponse;
import com.elguennouni.mohassib.dto.PageResponse;
import com.elguennouni.mohassib.entity.Notification;
import com.elguennouni.mohassib.entity.NotificationType;
import com.elguennouni.mohassib.exception.NotificationNotFoundException;
import com.elguennouni.mohassib.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Central API for in-app notifications.
 *
 * `create(...)` is idempotent within a deduplication window: the same
 * (companyId, dedupeKey) pair will not produce two rows if the previous one
 * was emitted recently (default: last 24h). This keeps schedulers from
 * spamming users on every cron tick.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final int DEFAULT_DEDUPE_HOURS = 24;
    private static final int RECENT_LIMIT = 10;

    private final NotificationRepository notificationRepository;

    @Transactional
    public Optional<Notification> create(
            Long companyId,
            Long userId,
            NotificationType type,
            String title,
            String message,
            String link,
            String dedupeKey
    ) {
        if (dedupeKey != null && !dedupeKey.isBlank()) {
            LocalDateTime since = LocalDateTime.now().minusHours(DEFAULT_DEDUPE_HOURS);
            if (notificationRepository.existsByCompanyIdAndDedupeKeyAndCreatedAtAfter(
                    companyId, dedupeKey, since)) {
                return Optional.empty();
            }
        }

        Notification notification = Notification.builder()
                .companyId(companyId)
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .link(link)
                .dedupeKey(dedupeKey)
                .read(false)
                .build();
        return Optional.of(notificationRepository.save(notification));
    }

    @Transactional(readOnly = true)
    public NotificationSummaryResponse summary(Long companyId) {
        long unread = notificationRepository.countByCompanyIdAndReadFalse(companyId);
        var recent = notificationRepository.findTop10ByCompanyIdOrderByCreatedAtDesc(companyId)
                .stream().map(NotificationResponse::from).toList();
        return new NotificationSummaryResponse(unread, recent);
    }

    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> list(Long companyId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Notification> result = notificationRepository
                .findByCompanyIdOrderByCreatedAtDesc(companyId, pageable);
        return PageResponse.from(result, NotificationResponse::from);
    }

    @Transactional
    public NotificationResponse markAsRead(Long companyId, Long notificationId) {
        Notification notification = notificationRepository
                .findByIdAndCompanyId(notificationId, companyId)
                .orElseThrow(NotificationNotFoundException::new);
        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
        }
        return NotificationResponse.from(notification);
    }

    @Transactional
    public int markAllAsRead(Long companyId) {
        return notificationRepository.markAllAsRead(companyId, LocalDateTime.now());
    }
}
