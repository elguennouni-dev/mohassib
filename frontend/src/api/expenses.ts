import { apiClient } from './client'
import type { Page } from './clients'

export type Expense = {
  id: number
  expenseDate: string
  vendorName: string | null
  category: string | null
  baseAmount: string
  tvaRate: string
  tvaAmount: string
  totalAmount: string
  referenceNumber: string | null
  description: string | null
  createdAt: string
  updatedAt: string
}

export type ExpenseFormValues = {
  expenseDate: string
  vendorName: string
  category: string
  baseAmount: string
  tvaRate: string
  referenceNumber: string
  description: string
}

const TODAY_ISO = () => new Date().toISOString().slice(0, 10)

export const VALID_TVA_RATES = ['0', '7', '10', '20'] as const

export const buildEmptyExpenseForm = (): ExpenseFormValues => ({
  expenseDate: TODAY_ISO(),
  vendorName: '',
  category: '',
  baseAmount: '',
  tvaRate: '20',
  referenceNumber: '',
  description: '',
})

export function expenseToForm(e: Expense): ExpenseFormValues {
  return {
    expenseDate: e.expenseDate,
    vendorName: e.vendorName ?? '',
    category: e.category ?? '',
    baseAmount: e.baseAmount,
    tvaRate: e.tvaRate,
    referenceNumber: e.referenceNumber ?? '',
    description: e.description ?? '',
  }
}

function toPayload(values: ExpenseFormValues) {
  return {
    expenseDate: values.expenseDate,
    vendorName: values.vendorName.trim() || null,
    category: values.category.trim() || null,
    baseAmount: values.baseAmount === '' ? null : Number(values.baseAmount),
    tvaRate: values.tvaRate === '' ? null : Number(values.tvaRate),
    referenceNumber: values.referenceNumber.trim() || null,
    description: values.description.trim() || null,
  }
}

type ListOptions = {
  search?: string
  page?: number
  size?: number
}

export async function listExpenses(opts: ListOptions = {}): Promise<Page<Expense>> {
  const params: Record<string, string> = {}
  if (opts.search && opts.search.trim()) params.search = opts.search.trim()
  if (opts.page !== undefined) params.page = String(opts.page)
  if (opts.size !== undefined) params.size = String(opts.size)
  const res = await apiClient.get<Page<Expense>>('/expenses', { params })
  return res.data
}

export async function getExpense(id: number): Promise<Expense> {
  const res = await apiClient.get<Expense>(`/expenses/${id}`)
  return res.data
}

export async function createExpense(values: ExpenseFormValues): Promise<Expense> {
  const res = await apiClient.post<Expense>('/expenses', toPayload(values))
  return res.data
}

export async function updateExpense(id: number, values: ExpenseFormValues): Promise<Expense> {
  const res = await apiClient.put<Expense>(`/expenses/${id}`, toPayload(values))
  return res.data
}

export async function deleteExpense(id: number): Promise<void> {
  await apiClient.delete(`/expenses/${id}`)
}
