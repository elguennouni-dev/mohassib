import { apiClient } from './client'
import type { Invoice } from './invoices'

export type PaymentMethod = 'BANK_TRANSFER' | 'CASH' | 'CHECK' | 'OTHER'

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  BANK_TRANSFER: 'Virement bancaire',
  CASH: 'Especes',
  CHECK: 'Cheque',
  OTHER: 'Autre',
}

export type RecordPaymentPayload = {
  amount: string
  paymentMethod: PaymentMethod
  paymentDate: string
  referenceNumber?: string
  notes?: string
}

export async function recordPayment(invoiceId: number, payload: RecordPaymentPayload): Promise<Invoice> {
  const body = {
    amount: payload.amount === '' ? null : Number(payload.amount),
    paymentMethod: payload.paymentMethod,
    paymentDate: payload.paymentDate,
    referenceNumber: payload.referenceNumber?.trim() || null,
    notes: payload.notes?.trim() || null,
  }
  const res = await apiClient.post<Invoice>(`/invoices/${invoiceId}/payments`, body)
  return res.data
}

export async function deletePayment(paymentId: number): Promise<Invoice> {
  const res = await apiClient.delete<Invoice>(`/payments/${paymentId}`)
  return res.data
}
