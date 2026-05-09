import { apiClient } from './client'

export type RevenueDataPoint = {
  year: number
  month: number
  revenue: string
}

export type RecentInvoiceItem = {
  id: number
  invoiceNumber: string
  clientName: string
  invoiceDate: string
  totalAmount: string
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'
}

export type DashboardKpis = {
  revenueMtd: string
  revenueYtd: string
  outstandingCount: number
  outstandingAmount: string
  overdueCount: number
  overdueAmount: string
  payrollCostMtd: string
  payrollCostYtd: string
  tvaCollectedMonth: string
  tvaDeductibleMonth: string
  tvaToPayMonth: string
  expensesBaseYtd: string
  expensesTotalYtd: string
  activeClientsCount: number
  activeEmployeesCount: number
  monthlyRevenue: RevenueDataPoint[]
  recentInvoices: RecentInvoiceItem[]
}

export type InvoiceMonthBucket = {
  month: number
  invoiceCount: number
  revenue: string
  tva: string
  paidCount: number
  paidAmount: string
}

export type MonthlyInvoiceReport = {
  year: number
  months: InvoiceMonthBucket[]
  totalRevenue: string
  totalTva: string
  totalInvoiceCount: number
  paidInvoiceCount: number
  paidAmount: string
  outstandingInvoiceCount: number
  outstandingAmount: string
}

export type PayrollMonthBucket = {
  month: number
  employeeCount: number
  gross: string
  cnss: string
  ir: string
  net: string
  status: string | null
  exists: boolean
}

export type AnnualPayrollReport = {
  year: number
  months: PayrollMonthBucket[]
  totalGross: string
  totalCnss: string
  totalIr: string
  totalNet: string
  totalEmployeeMonths: number
}

export type TvaMonthBucket = {
  month: number
  salesBase: string
  tvaCollected: string
  expensesBase: string
  tvaDeductible: string
  tvaToPay: string
  declarationStatus: string | null
  declared: boolean
}

export type AnnualTvaReport = {
  year: number
  months: TvaMonthBucket[]
  totalSalesBase: string
  totalTvaCollected: string
  totalExpensesBase: string
  totalTvaDeductible: string
  totalTvaToPay: string
}

export async function getDashboardKpis(): Promise<DashboardKpis> {
  const res = await apiClient.get<DashboardKpis>('/reports/dashboard')
  return res.data
}

export async function getInvoiceReport(year?: number): Promise<MonthlyInvoiceReport> {
  const params: Record<string, string> = {}
  if (year) params.year = String(year)
  const res = await apiClient.get<MonthlyInvoiceReport>('/reports/invoices', { params })
  return res.data
}

export async function getPayrollReport(year?: number): Promise<AnnualPayrollReport> {
  const params: Record<string, string> = {}
  if (year) params.year = String(year)
  const res = await apiClient.get<AnnualPayrollReport>('/reports/payroll', { params })
  return res.data
}

export async function getTvaReport(year?: number): Promise<AnnualTvaReport> {
  const params: Record<string, string> = {}
  if (year) params.year = String(year)
  const res = await apiClient.get<AnnualTvaReport>('/reports/tva', { params })
  return res.data
}
