import { apiClient } from './client'
import type { Page } from './clients'

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'
export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID'

export type InvoiceLineItem = {
  id: number
  lineNumber: number
  description: string
  quantity: string
  unitPrice: string
  tvaRate: string
  lineSubtotal: string
  lineTva: string
  lineTotal: string
}

export type Invoice = {
  id: number
  invoiceNumber: string
  clientId: number
  clientName: string
  clientEmail: string | null
  invoiceDate: string
  dueDate: string | null
  paymentTerms: string | null
  notes: string | null
  netAmount: string
  tvaAmount: string
  totalAmount: string
  status: InvoiceStatus
  paymentStatus: PaymentStatus
  sentDate: string | null
  lineItems: InvoiceLineItem[]
  createdAt: string
  updatedAt: string
}

export type SendInvoicePayload = {
  recipientEmail: string
  subject?: string
  message?: string
}

export type InvoiceSummary = {
  id: number
  invoiceNumber: string
  clientId: number
  clientName: string
  invoiceDate: string
  dueDate: string | null
  totalAmount: string
  status: InvoiceStatus
  paymentStatus: PaymentStatus
}

export type InvoiceLineItemFormValues = {
  description: string
  quantity: string
  unitPrice: string
  tvaRate: string
}

export type InvoiceFormValues = {
  clientId: string
  invoiceDate: string
  dueDate: string
  paymentTerms: string
  notes: string
  lineItems: InvoiceLineItemFormValues[]
}

const TODAY_ISO = () => new Date().toISOString().slice(0, 10)
const PLUS_30_DAYS_ISO = () => {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().slice(0, 10)
}

export const VALID_TVA_RATES = ['0', '7', '10', '20'] as const

export const emptyLine: InvoiceLineItemFormValues = {
  description: '',
  quantity: '1',
  unitPrice: '0.00',
  tvaRate: '20',
}

export const buildEmptyInvoiceForm = (): InvoiceFormValues => ({
  clientId: '',
  invoiceDate: TODAY_ISO(),
  dueDate: PLUS_30_DAYS_ISO(),
  paymentTerms: 'Paiement sous 30 jours',
  notes: '',
  lineItems: [{ ...emptyLine }],
})

export function invoiceToForm(inv: Invoice): InvoiceFormValues {
  return {
    clientId: String(inv.clientId),
    invoiceDate: inv.invoiceDate,
    dueDate: inv.dueDate ?? '',
    paymentTerms: inv.paymentTerms ?? '',
    notes: inv.notes ?? '',
    lineItems: inv.lineItems.map((l) => ({
      description: l.description,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      tvaRate: l.tvaRate,
    })),
  }
}

function toPayload(values: InvoiceFormValues) {
  return {
    clientId: values.clientId === '' ? null : Number(values.clientId),
    invoiceDate: values.invoiceDate,
    dueDate: values.dueDate.trim() === '' ? null : values.dueDate,
    paymentTerms: values.paymentTerms.trim() || null,
    notes: values.notes.trim() || null,
    lineItems: values.lineItems.map((l) => ({
      description: l.description.trim(),
      quantity: l.quantity === '' ? null : Number(l.quantity),
      unitPrice: l.unitPrice === '' ? null : Number(l.unitPrice),
      tvaRate: l.tvaRate === '' ? null : Number(l.tvaRate),
    })),
  }
}

type ListOptions = {
  search?: string
  status?: InvoiceStatus
  page?: number
  size?: number
}

export async function listInvoices(opts: ListOptions = {}): Promise<Page<InvoiceSummary>> {
  const params: Record<string, string> = {}
  if (opts.search && opts.search.trim()) params.search = opts.search.trim()
  if (opts.status) params.status = opts.status
  if (opts.page !== undefined) params.page = String(opts.page)
  if (opts.size !== undefined) params.size = String(opts.size)
  const res = await apiClient.get<Page<InvoiceSummary>>('/invoices', { params })
  return res.data
}

export async function getInvoice(id: number): Promise<Invoice> {
  const res = await apiClient.get<Invoice>(`/invoices/${id}`)
  return res.data
}

export async function createInvoice(values: InvoiceFormValues): Promise<Invoice> {
  const res = await apiClient.post<Invoice>('/invoices', toPayload(values))
  return res.data
}

export async function updateInvoice(id: number, values: InvoiceFormValues): Promise<Invoice> {
  const res = await apiClient.put<Invoice>(`/invoices/${id}`, toPayload(values))
  return res.data
}

export async function deleteInvoice(id: number): Promise<void> {
  await apiClient.delete(`/invoices/${id}`)
}

export async function sendInvoice(id: number, payload: SendInvoicePayload): Promise<Invoice> {
  const body = {
    recipientEmail: payload.recipientEmail.trim(),
    subject: payload.subject?.trim() || null,
    message: payload.message?.trim() || null,
  }
  const res = await apiClient.post<Invoice>(`/invoices/${id}/send`, body)
  return res.data
}

export async function cancelInvoice(id: number): Promise<Invoice> {
  const res = await apiClient.post<Invoice>(`/invoices/${id}/cancel`)
  return res.data
}

export async function downloadInvoicePdf(id: number, invoiceNumber: string): Promise<void> {
  const res = await apiClient.get<Blob>(`/invoices/${id}/pdf`, { responseType: 'blob' })
  const blob = new Blob([res.data], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${invoiceNumber}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

export const STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: 'Brouillon',
  SENT: 'Envoyee',
  PAID: 'Payee',
  OVERDUE: 'En retard',
  CANCELLED: 'Annulee',
}

export const STATUS_COLORS: Record<InvoiceStatus, { bg: string; fg: string }> = {
  DRAFT: { bg: '#eeece6', fg: '#5a5a5a' },
  SENT: { bg: '#e3eef9', fg: '#1f5fa4' },
  PAID: { bg: '#e6f5ec', fg: '#0f7a3b' },
  OVERDUE: { bg: '#fdeae9', fg: '#b3261e' },
  CANCELLED: { bg: '#f0eeea', fg: '#888' },
}

export function formatMoneyMAD(value: string | number): string {
  const num = typeof value === 'string' ? Number(value) : value
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 2,
  }).format(num)
}

export function formatDateFr(value: string | null): string {
  if (!value) return '-'
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export type LineTotals = {
  subtotal: number
  tva: number
  total: number
}

export function computeLineTotals(line: InvoiceLineItemFormValues): LineTotals {
  const qty = Number(line.quantity || 0)
  const price = Number(line.unitPrice || 0)
  const rate = Number(line.tvaRate || 0)
  const subtotal = qty * price
  const tva = subtotal * (rate / 100)
  return {
    subtotal: Number.isFinite(subtotal) ? subtotal : 0,
    tva: Number.isFinite(tva) ? tva : 0,
    total: Number.isFinite(subtotal + tva) ? subtotal + tva : 0,
  }
}

export function computeInvoiceTotals(lines: InvoiceLineItemFormValues[]): LineTotals {
  return lines.reduce<LineTotals>(
    (acc, line) => {
      const t = computeLineTotals(line)
      return { subtotal: acc.subtotal + t.subtotal, tva: acc.tva + t.tva, total: acc.total + t.total }
    },
    { subtotal: 0, tva: 0, total: 0 },
  )
}
