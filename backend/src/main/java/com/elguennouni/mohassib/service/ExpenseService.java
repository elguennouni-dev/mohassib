package com.elguennouni.mohassib.service;

import com.elguennouni.mohassib.dto.ExpenseRequest;
import com.elguennouni.mohassib.dto.ExpenseResponse;
import com.elguennouni.mohassib.dto.PageResponse;
import com.elguennouni.mohassib.entity.Expense;
import com.elguennouni.mohassib.exception.ExpenseNotFoundException;
import com.elguennouni.mohassib.exception.InvalidTvaRateException;
import com.elguennouni.mohassib.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private static final List<BigDecimal> ALLOWED_TVA_RATES = List.of(
            new BigDecimal("0"),
            new BigDecimal("7"),
            new BigDecimal("10"),
            new BigDecimal("20")
    );

    private final ExpenseRepository expenseRepository;
    private final TVAEntryService tvaEntryService;

    @Transactional(readOnly = true)
    public PageResponse<ExpenseResponse> list(Long companyId, String search, int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), 100);
        Pageable pageable = PageRequest.of(safePage, safeSize);

        Page<Expense> result;
        if (search == null || search.isBlank()) {
            result = expenseRepository.findByCompanyIdOrderByExpenseDateDescIdDesc(companyId, pageable);
        } else {
            result = expenseRepository.searchByCompanyId(companyId, search.trim(), pageable);
        }
        return PageResponse.from(result, ExpenseResponse::from);
    }

    @Transactional(readOnly = true)
    public ExpenseResponse get(Long companyId, Long expenseId) {
        return ExpenseResponse.from(findOrThrow(companyId, expenseId));
    }

    @Transactional
    public ExpenseResponse create(Long companyId, ExpenseRequest request) {
        validateTvaRate(request.tvaRate());

        BigDecimal base = request.baseAmount().setScale(2, RoundingMode.HALF_UP);
        BigDecimal rate = request.tvaRate().setScale(2, RoundingMode.HALF_UP);
        BigDecimal tvaAmount = base.multiply(rate)
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

        Expense expense = Expense.builder()
                .companyId(companyId)
                .expenseDate(request.expenseDate())
                .vendorName(blankToNull(request.vendorName()))
                .category(blankToNull(request.category()))
                .baseAmount(base)
                .tvaRate(rate)
                .tvaAmount(tvaAmount)
                .totalAmount(base.add(tvaAmount))
                .referenceNumber(blankToNull(request.referenceNumber()))
                .description(blankToNull(request.description()))
                .build();
        Expense saved = expenseRepository.save(expense);

        // Mirror this expense into the TVA ledger.
        tvaEntryService.recordExpense(saved);

        return ExpenseResponse.from(saved);
    }

    @Transactional
    public ExpenseResponse update(Long companyId, Long expenseId, ExpenseRequest request) {
        validateTvaRate(request.tvaRate());

        Expense expense = findOrThrow(companyId, expenseId);

        BigDecimal base = request.baseAmount().setScale(2, RoundingMode.HALF_UP);
        BigDecimal rate = request.tvaRate().setScale(2, RoundingMode.HALF_UP);
        BigDecimal tvaAmount = base.multiply(rate)
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

        expense.setExpenseDate(request.expenseDate());
        expense.setVendorName(blankToNull(request.vendorName()));
        expense.setCategory(blankToNull(request.category()));
        expense.setBaseAmount(base);
        expense.setTvaRate(rate);
        expense.setTvaAmount(tvaAmount);
        expense.setTotalAmount(base.add(tvaAmount));
        expense.setReferenceNumber(blankToNull(request.referenceNumber()));
        expense.setDescription(blankToNull(request.description()));

        // Re-record so the TVA ledger stays in sync.
        tvaEntryService.recordExpense(expense);

        return ExpenseResponse.from(expense);
    }

    @Transactional
    public void delete(Long companyId, Long expenseId) {
        Expense expense = findOrThrow(companyId, expenseId);
        tvaEntryService.removeForExpense(expense.getId());
        expenseRepository.delete(expense);
    }

    private Expense findOrThrow(Long companyId, Long expenseId) {
        return expenseRepository.findByIdAndCompanyId(expenseId, companyId)
                .orElseThrow(ExpenseNotFoundException::new);
    }

    private void validateTvaRate(BigDecimal rate) {
        if (rate == null) throw new InvalidTvaRateException();
        boolean ok = ALLOWED_TVA_RATES.stream().anyMatch(r -> r.compareTo(rate) == 0);
        if (!ok) throw new InvalidTvaRateException();
    }

    private static String blankToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
