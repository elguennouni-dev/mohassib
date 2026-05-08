package com.elguennouni.mohassib.dto;

import java.math.BigDecimal;

public record RevenueDataPoint(
        int year,
        int month,
        BigDecimal revenue
) {}
