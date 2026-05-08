package com.elguennouni.mohassib.dto;

import com.elguennouni.mohassib.entity.TVAEntry;
import com.elguennouni.mohassib.entity.TVAEntrySourceType;
import com.elguennouni.mohassib.entity.TVAEntryType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TVAEntryResponse(
        Long id,
        TVAEntryType type,
        TVAEntrySourceType sourceType,
        Long sourceId,
        LocalDate entryDate,
        BigDecimal baseAmount,
        BigDecimal tvaRate,
        BigDecimal tvaAmount,
        String description,
        LocalDateTime createdAt
) {
    public static TVAEntryResponse from(TVAEntry e) {
        return new TVAEntryResponse(
                e.getId(),
                e.getType(),
                e.getSourceType(),
                e.getSourceId(),
                e.getEntryDate(),
                e.getBaseAmount(),
                e.getTvaRate(),
                e.getTvaAmount(),
                e.getDescription(),
                e.getCreatedAt()
        );
    }
}
