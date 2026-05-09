import { apiClient } from './client'

export type TVADeclarationStatus = 'DRAFT' | 'SUBMITTED' | 'PAID' | 'CANCELLED'

export const TVA_STATUS_LABELS: Record<TVADeclarationStatus, string> = {
  DRAFT: 'Brouillon',
  SUBMITTED: 'Soumise',
  PAID: 'Payée',
  CANCELLED: 'Annulée',
}

export type RateBreakdown = {
  tvaRate: string
  baseAmount: string
  tvaAmount: string
  entryCount: number
}

export type TVAPreview = {
  month: number
  year: number
  salesByRate: RateBreakdown[]
  expensesByRate: RateBreakdown[]
  salesBase: string
  tvaCollected: string
  expensesBase: string
  tvaDeductible: string
  tvaToPay: string
  declarationExists: boolean
}

export type TVADeclaration = {
  id: number
  month: number
  year: number
  salesBase: string
  tvaCollected: string
  expensesBase: string
  tvaDeductible: string
  tvaToPay: string
  status: TVADeclarationStatus
  submissionDate: string | null
  paymentDate: string | null
  referenceNumber: string | null
  notes: string | null
  generatedAt: string
  createdAt: string
  updatedAt: string
}

const MONTH_NAMES_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

export function formatTvaPeriod(month: number, year: number): string {
  const name = month >= 1 && month <= 12 ? MONTH_NAMES_FR[month - 1] : String(month)
  return `${name} ${year}`
}

export async function previewTVA(month: number, year: number): Promise<TVAPreview> {
  const res = await apiClient.get<TVAPreview>('/tva/preview', { params: { month, year } })
  return res.data
}

export async function listDeclarations(year?: number): Promise<TVADeclaration[]> {
  const params: Record<string, string> = {}
  if (year !== undefined) params.year = String(year)
  const res = await apiClient.get<TVADeclaration[]>('/tva/declarations', { params })
  return res.data
}

export async function getDeclaration(id: number): Promise<TVADeclaration> {
  const res = await apiClient.get<TVADeclaration>(`/tva/declarations/${id}`)
  return res.data
}

export async function generateDeclaration(month: number, year: number): Promise<TVADeclaration> {
  const res = await apiClient.post<TVADeclaration>('/tva/declarations/generate', { month, year })
  return res.data
}

export type UpdateDeclarationStatusPayload = {
  status: TVADeclarationStatus
  submissionDate?: string | null
  paymentDate?: string | null
  referenceNumber?: string | null
  notes?: string | null
}

export async function updateDeclarationStatus(
  id: number,
  payload: UpdateDeclarationStatusPayload,
): Promise<TVADeclaration> {
  const res = await apiClient.put<TVADeclaration>(`/tva/declarations/${id}/status`, payload)
  return res.data
}

export async function deleteDeclaration(id: number): Promise<void> {
  await apiClient.delete(`/tva/declarations/${id}`)
}

export async function downloadDeclarationPdf(id: number, label: string): Promise<void> {
  const res = await apiClient.get<Blob>(`/tva/declarations/${id}/pdf`, { responseType: 'blob' })
  const blob = new Blob([res.data], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${label}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 100)
}
