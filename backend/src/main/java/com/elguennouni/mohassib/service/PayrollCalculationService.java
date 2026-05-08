package com.elguennouni.mohassib.service;

import com.elguennouni.mohassib.dto.SalaryBreakdown;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

/**
 * Pure salary calculation service. No persistence. Used by PayrollService when
 * drafting a payroll, and by anyone else who needs a quick CNSS/IR estimate.
 *
 * Brackets are configurable via application properties. Default values follow the
 * simplified monthly Moroccan IR brackets (cf. master checklist). Cross-check with
 * the DGI before going to production.
 */
@Service
public class PayrollCalculationService {

    private final BigDecimal cnssRate;
    private final BigDecimal cnssCeiling;
    private final List<IrBracket> irBrackets;

    public PayrollCalculationService(
            @Value("${mohassib.payroll.cnss-rate:0.0448}") BigDecimal cnssRate,
            @Value("${mohassib.payroll.cnss-ceiling:6000}") BigDecimal cnssCeiling,
            @Value("${mohassib.payroll.ir-brackets:0:0,2500:0.10,8333:0.20,17500:0.30,30000:0.34}")
            String irBracketsConfig
    ) {
        this.cnssRate = cnssRate;
        this.cnssCeiling = cnssCeiling;
        this.irBrackets = parseBrackets(irBracketsConfig);
    }

    /** Returns a fully computed breakdown given the three input components. */
    public SalaryBreakdown calculate(BigDecimal baseSalary, BigDecimal bonuses, BigDecimal allowances) {
        BigDecimal base = nz(baseSalary);
        BigDecimal bon = nz(bonuses);
        BigDecimal all = nz(allowances);

        BigDecimal gross = base.add(bon).add(all).setScale(2, RoundingMode.HALF_UP);

        // CNSS = min(gross, ceiling) * rate
        BigDecimal cnssBase = gross.min(cnssCeiling);
        BigDecimal cnss = cnssBase.multiply(cnssRate).setScale(2, RoundingMode.HALF_UP);

        // IR is computed on (gross - CNSS). Frais professionnels and other
        // deductions are deliberately NOT included in this MVP simplified model.
        BigDecimal taxable = gross.subtract(cnss);
        BigDecimal ir = computeProgressiveIr(taxable).setScale(2, RoundingMode.HALF_UP);

        BigDecimal otherDeductions = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalDeductions = cnss.add(ir).add(otherDeductions);
        BigDecimal net = gross.subtract(totalDeductions).setScale(2, RoundingMode.HALF_UP);

        return new SalaryBreakdown(
                base.setScale(2, RoundingMode.HALF_UP),
                bon.setScale(2, RoundingMode.HALF_UP),
                all.setScale(2, RoundingMode.HALF_UP),
                gross,
                cnss,
                ir,
                otherDeductions,
                totalDeductions,
                net
        );
    }

    private BigDecimal computeProgressiveIr(BigDecimal taxable) {
        if (taxable.signum() <= 0) return BigDecimal.ZERO;
        BigDecimal total = BigDecimal.ZERO;
        for (int i = 0; i < irBrackets.size(); i++) {
            IrBracket bracket = irBrackets.get(i);
            if (taxable.compareTo(bracket.from) <= 0) break;
            BigDecimal nextFrom = (i + 1 < irBrackets.size()) ? irBrackets.get(i + 1).from : null;
            BigDecimal top = (nextFrom != null) ? nextFrom.min(taxable) : taxable;
            BigDecimal slice = top.subtract(bracket.from);
            if (slice.signum() > 0) {
                total = total.add(slice.multiply(bracket.rate));
            }
        }
        return total;
    }

    private static BigDecimal nz(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private static List<IrBracket> parseBrackets(String config) {
        if (config == null || config.isBlank()) return List.of();
        List<IrBracket> brackets = new ArrayList<>();
        for (String chunk : Arrays.stream(config.split(",")).map(String::trim).toList()) {
            String[] kv = chunk.split(":");
            if (kv.length != 2) {
                throw new IllegalArgumentException(
                        "Format de bareme IR invalide. Attendu : 'borne:taux,...'. Recu : " + chunk
                );
            }
            BigDecimal from = new BigDecimal(kv[0].trim());
            BigDecimal rate = new BigDecimal(kv[1].trim());
            brackets.add(new IrBracket(from, rate));
        }
        brackets.sort(Comparator.comparing(b -> b.from));
        return List.copyOf(brackets);
    }

    private record IrBracket(BigDecimal from, BigDecimal rate) {}
}
