package com.elguennouni.mohassib.service;

import com.elguennouni.mohassib.dto.GenerateDeclarationRequest;
import com.elguennouni.mohassib.dto.TVADeclarationResponse;
import com.elguennouni.mohassib.dto.TVAEntryResponse;
import com.elguennouni.mohassib.dto.TVAPreviewResponse;
import com.elguennouni.mohassib.dto.UpdateDeclarationStatusRequest;
import com.elguennouni.mohassib.entity.Company;
import com.elguennouni.mohassib.entity.TVADeclaration;
import com.elguennouni.mohassib.entity.TVADeclarationStatus;
import com.elguennouni.mohassib.entity.TVAEntry;
import com.elguennouni.mohassib.entity.TVAEntryType;
import com.elguennouni.mohassib.exception.CompanyNotFoundException;
import com.elguennouni.mohassib.exception.TVADeclarationNotFoundException;
import com.elguennouni.mohassib.repository.TVADeclarationRepository;
import com.elguennouni.mohassib.repository.TVAEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TVAService {

    private final TVAEntryRepository tvaEntryRepository;
    private final TVADeclarationRepository declarationRepository;
    private final CompanyService companyService;
    private final TVADeclarationPdfService pdfService;

    public record DeclarationPdf(String filename, byte[] bytes) {}

    @Transactional(readOnly = true)
    public List<TVAEntryResponse> listEntries(Long companyId, LocalDate from, LocalDate to) {
        return tvaEntryRepository.findByCompanyIdAndDateRange(companyId, from, to)
                .stream()
                .map(TVAEntryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public TVAPreviewResponse preview(Long companyId, int month, int year) {
        LocalDate from = LocalDate.of(year, month, 1);
        LocalDate to = YearMonth.of(year, month).atEndOfMonth();
        List<TVAEntry> entries = tvaEntryRepository.findByCompanyIdAndDateRange(companyId, from, to);

        List<TVAPreviewResponse.RateBreakdown> sales = aggregateByRate(entries, TVAEntryType.SALES);
        List<TVAPreviewResponse.RateBreakdown> expenses = aggregateByRate(entries, TVAEntryType.EXPENSES);

        BigDecimal salesBase = sumBase(sales);
        BigDecimal tvaCollected = sumTva(sales);
        BigDecimal expensesBase = sumBase(expenses);
        BigDecimal tvaDeductible = sumTva(expenses);
        BigDecimal toPay = tvaCollected.subtract(tvaDeductible).setScale(2, RoundingMode.HALF_UP);

        boolean exists = declarationRepository.findByCompanyIdAndMonthAndYear(companyId, month, year).isPresent();

        return new TVAPreviewResponse(
                month, year,
                sales, expenses,
                salesBase, tvaCollected,
                expensesBase, tvaDeductible,
                toPay,
                exists
        );
    }

    @Transactional(readOnly = true)
    public List<TVADeclarationResponse> listDeclarations(Long companyId, Integer year) {
        List<TVADeclaration> result = (year != null)
                ? declarationRepository.findByCompanyIdAndYearOrderByMonthDesc(companyId, year)
                : declarationRepository.findByCompanyIdOrderByYearDescMonthDesc(companyId);
        return result.stream().map(TVADeclarationResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public TVADeclarationResponse getDeclaration(Long companyId, Long declarationId) {
        TVADeclaration declaration = findOrThrow(companyId, declarationId);
        return TVADeclarationResponse.from(declaration);
    }

    @Transactional
    public TVADeclarationResponse generateDeclaration(Long companyId, GenerateDeclarationRequest request) {
        int month = request.month();
        int year = request.year();

        LocalDate from = LocalDate.of(year, month, 1);
        LocalDate to = YearMonth.of(year, month).atEndOfMonth();
        List<TVAEntry> entries = tvaEntryRepository.findByCompanyIdAndDateRange(companyId, from, to);

        List<TVAPreviewResponse.RateBreakdown> sales = aggregateByRate(entries, TVAEntryType.SALES);
        List<TVAPreviewResponse.RateBreakdown> expenses = aggregateByRate(entries, TVAEntryType.EXPENSES);

        BigDecimal salesBase = sumBase(sales);
        BigDecimal tvaCollected = sumTva(sales);
        BigDecimal expensesBase = sumBase(expenses);
        BigDecimal tvaDeductible = sumTva(expenses);
        BigDecimal toPay = tvaCollected.subtract(tvaDeductible).setScale(2, RoundingMode.HALF_UP);

        TVADeclaration declaration = declarationRepository
                .findByCompanyIdAndMonthAndYear(companyId, month, year)
                .orElseGet(() -> TVADeclaration.builder()
                        .companyId(companyId)
                        .month(month)
                        .year(year)
                        .status(TVADeclarationStatus.DRAFT)
                        .build());

        // If a declaration was already submitted/paid, allow regeneration but keep the
        // status — the user will see updated numbers and can re-submit if needed.
        declaration.setSalesBase(salesBase);
        declaration.setTvaCollected(tvaCollected);
        declaration.setExpensesBase(expensesBase);
        declaration.setTvaDeductible(tvaDeductible);
        declaration.setTvaToPay(toPay);
        declaration.setGeneratedAt(LocalDateTime.now());
        if (declaration.getStatus() == null) {
            declaration.setStatus(TVADeclarationStatus.DRAFT);
        }

        TVADeclaration saved = declarationRepository.save(declaration);
        return TVADeclarationResponse.from(saved);
    }

    @Transactional
    public TVADeclarationResponse updateStatus(Long companyId, Long declarationId, UpdateDeclarationStatusRequest request) {
        TVADeclaration declaration = findOrThrow(companyId, declarationId);
        declaration.setStatus(request.status());
        if (request.submissionDate() != null) {
            declaration.setSubmissionDate(request.submissionDate());
        }
        if (request.paymentDate() != null) {
            declaration.setPaymentDate(request.paymentDate());
        }
        if (request.referenceNumber() != null && !request.referenceNumber().isBlank()) {
            declaration.setReferenceNumber(request.referenceNumber().trim());
        }
        if (request.notes() != null) {
            String trimmed = request.notes().trim();
            declaration.setNotes(trimmed.isEmpty() ? null : trimmed);
        }
        return TVADeclarationResponse.from(declaration);
    }

    @Transactional
    public void deleteDeclaration(Long companyId, Long declarationId) {
        TVADeclaration declaration = findOrThrow(companyId, declarationId);
        declarationRepository.delete(declaration);
    }

    @Transactional(readOnly = true)
    public DeclarationPdf generatePdf(Long companyId, Long declarationId) {
        TVADeclaration declaration = findOrThrow(companyId, declarationId);
        Company company = companyService.findById(companyId)
                .orElseThrow(CompanyNotFoundException::new);
        byte[] bytes = pdfService.generate(declaration, company);
        String filename = "declaration-tva-" + declaration.getYear() + "-"
                + String.format("%02d", declaration.getMonth()) + ".pdf";
        return new DeclarationPdf(filename, bytes);
    }

    private TVADeclaration findOrThrow(Long companyId, Long declarationId) {
        return declarationRepository.findByIdAndCompanyId(declarationId, companyId)
                .orElseThrow(TVADeclarationNotFoundException::new);
    }

    private List<TVAPreviewResponse.RateBreakdown> aggregateByRate(List<TVAEntry> entries, TVAEntryType type) {
        Map<BigDecimal, BigDecimal[]> byRate = new LinkedHashMap<>();
        Map<BigDecimal, Integer> counts = new LinkedHashMap<>();
        for (TVAEntry entry : entries) {
            if (entry.getType() != type) continue;
            BigDecimal rate = entry.getTvaRate().setScale(2, RoundingMode.HALF_UP);
            BigDecimal[] sums = byRate.computeIfAbsent(rate, k -> new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
            sums[0] = sums[0].add(entry.getBaseAmount());
            sums[1] = sums[1].add(entry.getTvaAmount());
            counts.merge(rate, 1, (a, b) -> (a == null ? 0 : a) + (b == null ? 0 : b));
        }

        List<TVAPreviewResponse.RateBreakdown> breakdowns = new ArrayList<>();
        for (Map.Entry<BigDecimal, BigDecimal[]> entry : byRate.entrySet()) {
            breakdowns.add(new TVAPreviewResponse.RateBreakdown(
                    entry.getKey(),
                    entry.getValue()[0].setScale(2, RoundingMode.HALF_UP),
                    entry.getValue()[1].setScale(2, RoundingMode.HALF_UP),
                    counts.getOrDefault(entry.getKey(), 0)
            ));
        }
        breakdowns.sort(Comparator.comparing(TVAPreviewResponse.RateBreakdown::tvaRate));
        return breakdowns;
    }

    private static BigDecimal sumBase(List<TVAPreviewResponse.RateBreakdown> breakdowns) {
        BigDecimal total = BigDecimal.ZERO;
        for (TVAPreviewResponse.RateBreakdown b : breakdowns) total = total.add(b.baseAmount());
        return total.setScale(2, RoundingMode.HALF_UP);
    }

    private static BigDecimal sumTva(List<TVAPreviewResponse.RateBreakdown> breakdowns) {
        BigDecimal total = BigDecimal.ZERO;
        for (TVAPreviewResponse.RateBreakdown b : breakdowns) total = total.add(b.tvaAmount());
        return total.setScale(2, RoundingMode.HALF_UP);
    }
}
