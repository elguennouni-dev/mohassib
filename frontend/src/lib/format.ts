/* Francophone Moroccan formatting helpers — used everywhere in the UI. */

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const dateLongFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const amountFormatter = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const integerFormatter = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 0,
})

const PLACEHOLDER = '—'

function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = typeof value === 'string' ? Number(value) : value
  return Number.isFinite(n) ? n : null
}

function parseDate(value: string | Date | null | undefined): Date | null {
  if (value === null || value === undefined || value === '') return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }
  // Treat plain YYYY-MM-DD as local midnight to avoid timezone drift.
  const iso = value.length === 10 ? `${value}T00:00:00` : value
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

/** "1 250,50 MAD" — used for any monetary amount in the UI. */
export function formatAmount(value: string | number | null | undefined): string {
  const n = toNumber(value)
  if (n === null) return `0,00 MAD`
  return `${amountFormatter.format(n)} MAD`
}

/** "1 250,50" — same as formatAmount but without the currency suffix. */
export function formatAmountNoCurrency(value: string | number | null | undefined): string {
  const n = toNumber(value)
  if (n === null) return '0,00'
  return amountFormatter.format(n)
}

/** Integer with French thousands separator: "1 250". */
export function formatInteger(value: string | number | null | undefined): string {
  const n = toNumber(value)
  if (n === null) return '0'
  return integerFormatter.format(n)
}

/** "15/07/2026" — for tables and compact displays. */
export function formatDate(value: string | Date | null | undefined): string {
  const d = parseDate(value)
  return d ? dateFormatter.format(d) : PLACEHOLDER
}

/** "15 juillet 2026" — for narrative contexts. */
export function formatDateLong(value: string | Date | null | undefined): string {
  const d = parseDate(value)
  return d ? dateLongFormatter.format(d) : PLACEHOLDER
}

/** "15/07/2026 10:30" — for audit log style timestamps. */
export function formatDateTime(value: string | Date | null | undefined): string {
  const d = parseDate(value)
  return d ? dateTimeFormatter.format(d) : PLACEHOLDER
}

/** Returns the current local date as YYYY-MM-DD (suitable for <input type="date">). */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Adds N days to today and returns YYYY-MM-DD. */
export function todayPlusDaysIso(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
