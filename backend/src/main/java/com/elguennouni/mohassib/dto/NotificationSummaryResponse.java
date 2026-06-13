package com.elguennouni.mohassib.dto;

import java.util.List;

public record NotificationSummaryResponse(
        long unreadCount,
        List<NotificationResponse> recent
) {}
