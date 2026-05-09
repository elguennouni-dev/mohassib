import { apiClient } from './client'

export type PayrollStatus = 'DRAFT' | 'PROCESSED' | 'CANCELLED'

export const PAYROLL_STATUS_LABELS: Record<PayrollStatus, string> = {
  DRAFT: 'Brouillon',
  PROCESSED: 'Traitée',
  CANCELLED: 'Annulée',
}

export type SalarySlip = {
  id: number
  payrollId: number
  employeeId: number
  employeeFirstName: string
  employeeLastName: string
  employeeEmail: string | null
  employeeCinNumber: string | null
  employeeCnssNumber: string | null
  employeePosition: string | null
  baseSalary: string
  bonuses: string
  allowances: string
  grossSalary: string
  cnssDeduction: string
  irDeduction: string
  otherDeductions: string
  totalDeductions: string
  netSalary: string
  sentAt: string | null
  createdAt: string
  updatedAt: string
}

export type PayrollSummary = {
  id: number
  month: number
  year: number
  status: PayrollStatus
  employeeCount: number
  totalGrossSalary: string
  totalCnssDeduction: string
  totalIrDeduction: string
  totalNetSalary: string
  processedAt: string | null
  createdAt: string
}

export type Payroll = PayrollSummary & {
  totalOtherDeductions: string
  notes: string | null
  slips: SalarySlip[]
  updatedAt: string
}

export type CreatePayrollPayload = {
  month: number
  year: number
  notes?: string
}

const MONTH_NAMES_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

export function formatPeriod(month: number, year: number): string {
  const name = month >= 1 && month <= 12 ? MONTH_NAMES_FR[month - 1] : String(month)
  return `${name} ${year}`
}

export async function listPayrolls(year?: number): Promise<PayrollSummary[]> {
  const params: Record<string, string> = {}
  if (year !== undefined) params.year = String(year)
  const res = await apiClient.get<PayrollSummary[]>('/payroll', { params })
  return res.data
}

export async function getPayroll(id: number): Promise<Payroll> {
  const res = await apiClient.get<Payroll>(`/payroll/${id}`)
  return res.data
}

export async function createPayroll(payload: CreatePayrollPayload): Promise<Payroll> {
  const body = {
    month: payload.month,
    year: payload.year,
    notes: payload.notes?.trim() || null,
  }
  const res = await apiClient.post<Payroll>('/payroll', body)
  return res.data
}

export async function processPayroll(id: number): Promise<Payroll> {
  const res = await apiClient.post<Payroll>(`/payroll/${id}/process`)
  return res.data
}

export async function deletePayroll(id: number): Promise<void> {
  await apiClient.delete(`/payroll/${id}`)
}

export async function downloadSalarySlipPdf(slipId: number, fileLabel: string): Promise<void> {
  const res = await apiClient.get<Blob>(`/salary-slips/${slipId}/pdf`, { responseType: 'blob' })
  const blob = new Blob([res.data], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${fileLabel}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 100)
}
