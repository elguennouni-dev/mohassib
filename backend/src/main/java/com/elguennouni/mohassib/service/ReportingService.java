package com.elguennouni.mohassib.service;

import com.elguennouni.mohassib.dto.AnnualPayrollReportResponse;
import com.elguennouni.mohassib.dto.AnnualTvaReportResponse;
import com.elguennouni.mohassib.dto.DashboardKpisResponse;
import com.elguennouni.mohassib.dto.MonthlyInvoiceReportResponse;
import com.elguennouni.mohassib.dto.RecentInvoiceItem;
import com.elguennouni.mohassib.dto.RevenueDataPoint;
import com.elguennouni.mohassib.entity.EmployeeStatus;
import com.elguennouni.mohassib.entity.Payroll;
import com.elguennouni.mohassib.entity.TVADeclaration;
import com.elguennouni.mohassib.repository.ClientRepository;
import com.elguennouni.mohassib.repository.EmployeeRepository;
import com.elguennouni.mohassib.repository.ExpenseRepository;
import com.elguennouni.mohassib.repository.InvoiceRepository;
import com.elguennouni.mohassib.repository.PayrollRepository;
import com.elguennouni.mohassib.repository.TVADeclarationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportingService {

    private final InvoiceRepository invoiceRepository;
    private final ExpenseRepository expenseRepository;
    private final PayrollRepository payrollRepository;
    private final TVADeclarationRepository declarationRepository;
    private final ClientRepository clientRepository;
    private final EmployeeRepository employeeRepository;
    private final TVAService tvaService;

    @Transactional(readOnly = true)
    public DashboardKpisResponse getDashboardKpis(Long companyId) {
        LocalDate today = LocalDate.now();
        int year = today.getYear();
        int month = today.getMonthValue();

        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate yearStart = LocalDate.of(year, 1, 1);

        // Revenue
        BigDecimal revenueMtd = nz(invoiceRepository.sumRevenueByDateRange(companyId, monthStart, today));
        BigDecimal revenueYtd = nz(invoiceRepository.sumRevenueByDateRange(companyId, yearStart, today));

        // Outstanding / overdue
        long outstandingCount = invoiceRepository.countOutstanding(companyId);
        BigDecimal outstandingAmount = nz(invoiceRepository.sumOutstanding(companyId));
        long overdueCount = invoiceRepository.countOverdue(companyId);
        BigDecimal overdueAmount = nz(invoiceRepository.sumOverdue(companyId));

        // Payroll
        BigDecimal payrollMtd = payrollRepository
                .findByCompanyIdAndYearOrderByMonthDesc(companyId, year).stream()
                .filter(p -> p.getMonth() == month)
                .map(Payroll::getTotalGrossSalary)
                .findFirst()
                .orElse(BigDecimal.ZERO);
        BigDecimal payrollYtd = payrollRepository
                .findByCompanyIdAndYearOrderByMonthDesc(companyId, year).stream()
                .map(Payroll::getTotalGrossSalary)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // TVA preview for current month
        var preview = tvaService.preview(companyId, month, year);
        BigDecimal tvaCollected = preview.tvaCollected();
        BigDecimal tvaDeductible = preview.tvaDeductible();
        BigDecimal tvaToPay = preview.tvaToPay();

        // Expenses YTD
        BigDecimal expensesBaseYtd = nz(expenseRepository.sumBaseByDateRange(companyId, yearStart, today));
        BigDecimal expensesTotalYtd = nz(expenseRepository.sumTotalByDateRange(companyId, yearStart, today));

        // Counters
        long activeClientsCount = clientRepository.countByCompanyId(companyId);
        long activeEmployeesCount = employeeRepository.countByCompanyIdAndStatus(companyId, EmployeeStatus.ACTIVE);

        // Last 12 months of revenue
        List<RevenueDataPoint> chart = monthlyRevenue(companyId, today);

        // Recent invoices (top 5 newest)
        List<RecentInvoiceItem> recent = invoiceRepository
                .findTop5ByCompanyIdOrderByCreatedAtDesc(companyId).stream()
                .map(RecentInvoiceItem::from)
                .toList();

        return new DashboardKpisResponse(
                revenueMtd,
                revenueYtd,
                outstandingCount,
                outstandingAmount,
                overdueCount,
                overdueAmount,
                payrollMtd,
                payrollYtd,
                tvaCollected,
                tvaDeductible,
                tvaToPay,
                expensesBaseYtd,
                expensesTotalYtd,
                activeClientsCount,
                activeEmployeesCount,
                chart,
                recent
        );
    }

    @Transactional(readOnly = true)
    public MonthlyInvoiceReportResponse getInvoiceReport(Long companyId, int year) {
        List<MonthlyInvoiceReportResponse.MonthBucket> buckets = new ArrayList<>();
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalTva = BigDecimal.ZERO;
        long totalCount = 0;
        long paidCount = 0;
        BigDecimal paidAmount = BigDecimal.ZERO;

        for (int m = 1; m <= 12; m++) {
            LocalDate from = LocalDate.of(year, m, 1);
            LocalDate to = YearMonth.of(year, m).atEndOfMonth();
            BigDecimal revenue = nz(invoiceRepository.sumRevenueByDateRange(companyId, from, to));
            BigDecimal tva = nz(invoiceRepository.sumTvaByDateRange(companyId, from, to));
            long count = invoiceRepository.countByDateRange(companyId, from, to);
            long pCount = invoiceRepository.countPaidByDateRange(companyId, from, to);
            BigDecimal pAmount = nz(invoiceRepository.sumPaidByDateRange(companyId, from, to));

            buckets.add(new MonthlyInvoiceReportResponse.MonthBucket(
                    m, count, revenue, tva, pCount, pAmount
            ));

            totalRevenue = totalRevenue.add(revenue);
            totalTva = totalTva.add(tva);
            totalCount += count;
            paidCount += pCount;
            paidAmount = paidAmount.add(pAmount);
        }

        long outstandingCount = invoiceRepository.countOutstanding(companyId);
        BigDecimal outstandingAmount = nz(invoiceRepository.sumOutstanding(companyId));

        return new MonthlyInvoiceReportResponse(
                year,
                buckets,
                totalRevenue,
                totalTva,
                totalCount,
                paidCount,
                paidAmount,
                outstandingCount,
                outstandingAmount
        );
    }

    @Transactional(readOnly = true)
    public AnnualPayrollReportResponse getPayrollReport(Long companyId, int year) {
        Map<Integer, Payroll> byMonth = payrollRepository
                .findByCompanyIdAndYearOrderByMonthDesc(companyId, year).stream()
                .collect(Collectors.toMap(Payroll::getMonth, p -> p, (a, b) -> a));

        List<AnnualPayrollReportResponse.MonthBucket> buckets = new ArrayList<>();
        BigDecimal totalGross = BigDecimal.ZERO;
        BigDecimal totalCnss = BigDecimal.ZERO;
        BigDecimal totalIr = BigDecimal.ZERO;
        BigDecimal totalNet = BigDecimal.ZERO;
        long totalEmployeeMonths = 0;

        for (int m = 1; m <= 12; m++) {
            Payroll p = byMonth.get(m);
            if (p != null) {
                buckets.add(new AnnualPayrollReportResponse.MonthBucket(
                        m,
                        p.getEmployeeCount(),
                        nz(p.getTotalGrossSalary()),
                        nz(p.getTotalCnssDeduction()),
                        nz(p.getTotalIrDeduction()),
                        nz(p.getTotalNetSalary()),
                        p.getStatus().name(),
                        true
                ));
                totalGross = totalGross.add(nz(p.getTotalGrossSalary()));
                totalCnss = totalCnss.add(nz(p.getTotalCnssDeduction()));
                totalIr = totalIr.add(nz(p.getTotalIrDeduction()));
                totalNet = totalNet.add(nz(p.getTotalNetSalary()));
                totalEmployeeMonths += p.getEmployeeCount();
            } else {
                buckets.add(new AnnualPayrollReportResponse.MonthBucket(
                        m, 0, BigDecimal.ZERO, BigDecimal.ZERO,
                        BigDecimal.ZERO, BigDecimal.ZERO, null, false
                ));
            }
        }

        return new AnnualPayrollReportResponse(
                year, buckets, totalGross, totalCnss, totalIr, totalNet, totalEmployeeMonths
        );
    }

    @Transactional(readOnly = true)
    public AnnualTvaReportResponse getTvaReport(Long companyId, int year) {
        Map<Integer, TVADeclaration> byMonth = declarationRepository
                .findByCompanyIdAndYearOrderByMonthDesc(companyId, year).stream()
                .collect(Collectors.toMap(TVADeclaration::getMonth, d -> d, (a, b) -> a));

        List<AnnualTvaReportResponse.MonthBucket> buckets = new ArrayList<>();
        BigDecimal totalSalesBase = BigDecimal.ZERO;
        BigDecimal totalCollected = BigDecimal.ZERO;
        BigDecimal totalExpensesBase = BigDecimal.ZERO;
        BigDecimal totalDeductible = BigDecimal.ZERO;
        BigDecimal totalToPay = BigDecimal.ZERO;

        for (int m = 1; m <= 12; m++) {
            TVADeclaration d = byMonth.get(m);
            if (d != null) {
                buckets.add(new AnnualTvaReportResponse.MonthBucket(
                        m,
                        nz(d.getSalesBase()),
                        nz(d.getTvaCollected()),
                        nz(d.getExpensesBase()),
                        nz(d.getTvaDeductible()),
                        nz(d.getTvaToPay()),
                        d.getStatus().name(),
                        true
                ));
                totalSalesBase = totalSalesBase.add(nz(d.getSalesBase()));
                totalCollected = totalCollected.add(nz(d.getTvaCollected()));
                totalExpensesBase = totalExpensesBase.add(nz(d.getExpensesBase()));
                totalDeductible = totalDeductible.add(nz(d.getTvaDeductible()));
                totalToPay = totalToPay.add(nz(d.getTvaToPay()));
            } else {
                // Compute live preview totals so the report shows what *would* be declared
                var preview = tvaService.preview(companyId, m, year);
                buckets.add(new AnnualTvaReportResponse.MonthBucket(
                        m,
                        nz(preview.salesBase()),
                        nz(preview.tvaCollected()),
                        nz(preview.expensesBase()),
                        nz(preview.tvaDeductible()),
                        nz(preview.tvaToPay()),
                        null,
                        false
                ));
            }
        }

        return new AnnualTvaReportResponse(
                year, buckets, totalSalesBase, totalCollected,
                totalExpensesBase, totalDeductible, totalToPay
        );
    }

    private List<RevenueDataPoint> monthlyRevenue(Long companyId, LocalDate today) {
        List<RevenueDataPoint> result = new ArrayList<>(12);
        for (int i = 11; i >= 0; i--) {
            LocalDate ref = today.minusMonths(i).withDayOfMonth(1);
            LocalDate from = ref;
            LocalDate to = YearMonth.from(ref).atEndOfMonth();
            BigDecimal sum = nz(invoiceRepository.sumRevenueByDateRange(companyId, from, to));
            result.add(new RevenueDataPoint(ref.getYear(), ref.getMonthValue(), sum));
        }
        return result;
    }

    private static BigDecimal nz(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}
