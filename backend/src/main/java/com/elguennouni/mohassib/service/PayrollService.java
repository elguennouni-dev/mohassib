package com.elguennouni.mohassib.service;

import com.elguennouni.mohassib.dto.CreatePayrollRequest;
import com.elguennouni.mohassib.dto.PayrollResponse;
import com.elguennouni.mohassib.dto.PayrollSummaryResponse;
import com.elguennouni.mohassib.dto.SalaryBreakdown;
import com.elguennouni.mohassib.entity.Company;
import com.elguennouni.mohassib.entity.Employee;
import com.elguennouni.mohassib.entity.EmployeeStatus;
import com.elguennouni.mohassib.entity.Payroll;
import com.elguennouni.mohassib.entity.PayrollStatus;
import com.elguennouni.mohassib.entity.SalarySlip;
import com.elguennouni.mohassib.exception.CompanyNotFoundException;
import com.elguennouni.mohassib.exception.InvalidPayrollStateException;
import com.elguennouni.mohassib.exception.PayrollAlreadyExistsException;
import com.elguennouni.mohassib.exception.PayrollNotFoundException;
import com.elguennouni.mohassib.exception.SalarySlipNotFoundException;
import com.elguennouni.mohassib.repository.EmployeeRepository;
import com.elguennouni.mohassib.repository.PayrollRepository;
import com.elguennouni.mohassib.repository.SalarySlipRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final SalarySlipRepository slipRepository;
    private final EmployeeRepository employeeRepository;
    private final CompanyService companyService;
    private final PayrollCalculationService calculationService;
    private final SalarySlipPdfService pdfService;
    private final EmailService emailService;

    public record SalarySlipPdf(String filename, byte[] bytes) {}

    @Transactional(readOnly = true)
    public List<PayrollSummaryResponse> list(Long companyId, Integer year) {
        List<Payroll> result = (year != null)
                ? payrollRepository.findByCompanyIdAndYearOrderByMonthDesc(companyId, year)
                : payrollRepository.findByCompanyIdOrderByYearDescMonthDesc(companyId);
        return result.stream().map(PayrollSummaryResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public PayrollResponse get(Long companyId, Long payrollId) {
        Payroll payroll = findOrThrow(companyId, payrollId);
        List<SalarySlip> slips = slipRepository
                .findByPayrollIdOrderByEmployeeLastNameAscEmployeeFirstNameAsc(payroll.getId());
        return PayrollResponse.from(payroll, slips);
    }

    @Transactional
    public PayrollResponse createDraft(Long companyId, CreatePayrollRequest request) {
        if (payrollRepository.existsByCompanyIdAndMonthAndYear(companyId, request.month(), request.year())) {
            throw new PayrollAlreadyExistsException(request.month(), request.year());
        }

        List<Employee> activeEmployees = employeeRepository
                .findByCompanyIdAndStatusOrderByLastNameAscFirstNameAsc(companyId, EmployeeStatus.ACTIVE);
        if (activeEmployees.isEmpty()) {
            throw new InvalidPayrollStateException(
                    "Aucun employe actif a cette periode. Ajoutez au moins un employe avant de creer la paie."
            );
        }

        // Initialize an empty payroll, save it to obtain an ID, then attach slips.
        Payroll payroll = Payroll.builder()
                .companyId(companyId)
                .month(request.month())
                .year(request.year())
                .status(PayrollStatus.DRAFT)
                .employeeCount(0)
                .totalGrossSalary(BigDecimal.ZERO)
                .totalCnssDeduction(BigDecimal.ZERO)
                .totalIrDeduction(BigDecimal.ZERO)
                .totalOtherDeductions(BigDecimal.ZERO)
                .totalNetSalary(BigDecimal.ZERO)
                .notes(blankToNull(request.notes()))
                .build();
        payroll = payrollRepository.save(payroll);

        BigDecimal totalGross = BigDecimal.ZERO;
        BigDecimal totalCnss = BigDecimal.ZERO;
        BigDecimal totalIr = BigDecimal.ZERO;
        BigDecimal totalOther = BigDecimal.ZERO;
        BigDecimal totalNet = BigDecimal.ZERO;

        for (Employee employee : activeEmployees) {
            SalaryBreakdown breakdown = calculationService.calculate(
                    employee.getBaseSalary(),
                    employee.getBonuses(),
                    employee.getAllowances()
            );

            SalarySlip slip = SalarySlip.builder()
                    .payrollId(payroll.getId())
                    .companyId(companyId)
                    .employeeId(employee.getId())
                    .employeeFirstName(employee.getFirstName())
                    .employeeLastName(employee.getLastName())
                    .employeeEmail(employee.getEmail())
                    .employeeCinNumber(employee.getCinNumber())
                    .employeeCnssNumber(employee.getCnssNumber())
                    .employeePosition(employee.getPosition())
                    .baseSalary(breakdown.baseSalary())
                    .bonuses(breakdown.bonuses())
                    .allowances(breakdown.allowances())
                    .grossSalary(breakdown.grossSalary())
                    .cnssDeduction(breakdown.cnssDeduction())
                    .irDeduction(breakdown.irDeduction())
                    .otherDeductions(breakdown.otherDeductions())
                    .totalDeductions(breakdown.totalDeductions())
                    .netSalary(breakdown.netSalary())
                    .build();
            slipRepository.save(slip);

            totalGross = totalGross.add(breakdown.grossSalary());
            totalCnss = totalCnss.add(breakdown.cnssDeduction());
            totalIr = totalIr.add(breakdown.irDeduction());
            totalOther = totalOther.add(breakdown.otherDeductions());
            totalNet = totalNet.add(breakdown.netSalary());
        }

        payroll.setEmployeeCount(activeEmployees.size());
        payroll.setTotalGrossSalary(totalGross);
        payroll.setTotalCnssDeduction(totalCnss);
        payroll.setTotalIrDeduction(totalIr);
        payroll.setTotalOtherDeductions(totalOther);
        payroll.setTotalNetSalary(totalNet);

        List<SalarySlip> slips = slipRepository
                .findByPayrollIdOrderByEmployeeLastNameAscEmployeeFirstNameAsc(payroll.getId());
        return PayrollResponse.from(payroll, slips);
    }

    @Transactional
    public void delete(Long companyId, Long payrollId) {
        Payroll payroll = findOrThrow(companyId, payrollId);
        if (payroll.getStatus() != PayrollStatus.DRAFT) {
            throw new InvalidPayrollStateException(
                    "Seules les paies en brouillon peuvent etre supprimees."
            );
        }
        List<SalarySlip> slips = slipRepository
                .findByPayrollIdOrderByEmployeeLastNameAscEmployeeFirstNameAsc(payroll.getId());
        slipRepository.deleteAll(slips);
        payrollRepository.delete(payroll);
    }

    @Transactional
    public PayrollResponse process(Long companyId, Long payrollId) {
        Payroll payroll = findOrThrow(companyId, payrollId);
        if (payroll.getStatus() != PayrollStatus.DRAFT) {
            throw new InvalidPayrollStateException(
                    "Seules les paies en brouillon peuvent etre traitees."
            );
        }

        Company company = companyService.findById(companyId)
                .orElseThrow(CompanyNotFoundException::new);
        List<SalarySlip> slips = slipRepository
                .findByPayrollIdOrderByEmployeeLastNameAscEmployeeFirstNameAsc(payroll.getId());

        LocalDateTime now = LocalDateTime.now();

        // Send each slip by email when the employee has a valid address.
        // Failures don't roll back the whole batch — we log + continue, but keep
        // sentAt as null for the failing slip so the user can retry later.
        int sentCount = 0;
        int skippedCount = 0;
        for (SalarySlip slip : slips) {
            if (slip.getEmployeeEmail() == null || slip.getEmployeeEmail().isBlank()) {
                skippedCount++;
                continue;
            }
            try {
                byte[] pdf = pdfService.generate(slip, payroll, company);
                emailService.sendSalarySlipEmail(slip, payroll, company, pdf, slip.getEmployeeEmail());
                slip.setSentAt(now);
                sentCount++;
            } catch (Exception ex) {
                log.warn("Echec envoi bulletin slip={} employee={}: {}",
                        slip.getId(), slip.getEmployeeId(), ex.getMessage());
            }
        }

        payroll.setStatus(PayrollStatus.PROCESSED);
        payroll.setProcessedAt(now);
        log.info("Paie {} (mois={}, annee={}) traitee : {} envoye(s), {} sans email",
                payroll.getId(), payroll.getMonth(), payroll.getYear(), sentCount, skippedCount);

        List<SalarySlip> refreshed = slipRepository
                .findByPayrollIdOrderByEmployeeLastNameAscEmployeeFirstNameAsc(payroll.getId());
        return PayrollResponse.from(payroll, refreshed);
    }

    @Transactional(readOnly = true)
    public SalarySlipPdf generateSlipPdf(Long companyId, Long slipId) {
        SalarySlip slip = slipRepository.findByIdAndCompanyId(slipId, companyId)
                .orElseThrow(SalarySlipNotFoundException::new);
        Payroll payroll = payrollRepository.findById(slip.getPayrollId())
                .orElseThrow(PayrollNotFoundException::new);
        Company company = companyService.findById(companyId)
                .orElseThrow(CompanyNotFoundException::new);

        byte[] bytes = pdfService.generate(slip, payroll, company);
        String filename = "bulletin-" + payroll.getYear() + "-"
                + String.format("%02d", payroll.getMonth()) + "-"
                + slip.getEmployeeLastName().toLowerCase().replaceAll("\\s+", "-")
                + ".pdf";
        return new SalarySlipPdf(filename, bytes);
    }

    private Payroll findOrThrow(Long companyId, Long payrollId) {
        return payrollRepository.findByIdAndCompanyId(payrollId, companyId)
                .orElseThrow(PayrollNotFoundException::new);
    }

    private static String blankToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
