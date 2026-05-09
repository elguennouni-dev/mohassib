package com.elguennouni.mohassib.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardKpisResponse(
        // Revenue
        BigDecimal revenueMtd,
        BigDecimal revenueYtd,
        // Outstanding (SENT or OVERDUE)
        long outstandingCount,
        BigDecimal outstandingAmount,
        // Overdue subset
        long overdueCount,
        BigDecimal overdueAmount,
        // Payroll
        BigDecimal payrollCostMtd,
        BigDecimal payrollCostYtd,
        // TVA preview for the current month
        BigDecimal tvaCollectedMonth,
        BigDecimal tvaDeductibleMonth,
        BigDecimal tvaToPayMonth,
        // Expenses YTD (HT)
        BigDecimal expensesBaseYtd,
        BigDecimal expensesTotalYtd,
        // Counters
        long activeClientsCount,
        long activeEmployeesCount,
        // Chart: last 12 months of revenue
        List<RevenueDataPoint> monthlyRevenue,
        // Recent activity
        List<RecentInvoiceItem> recentInvoices
) {}
