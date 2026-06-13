package com.elguennouni.mohassib.dto;

import com.elguennouni.mohassib.entity.Notification;
import com.elguennouni.mohassib.entity.NotificationType;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        NotificationType type,
        String title,
        String message,
        String link,
        boolean read,
        LocalDateTime readAt,
        LocalDateTime createdAt
) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getType(),
                n.getTitle(),
                n.getMessage(),
                n.getLink(),
                n.isRead(),
                n.getReadAt(),
                n.getCreatedAt()
        );
    }
}
