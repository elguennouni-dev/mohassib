/**
 * Single source of truth for status presentation across the app.
 * Both invoice statuses and payment statuses are unified here.
 */

export type StatusKey =
  | 'DRAFT'
  | 'SENT'
  | 'PARTIAL'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED'
  | 'UNPAID'

type StatusTone =
  | 'gray'
  | 'blue'
  | 'amber'
  | 'green'
  | 'red'
  | 'red-muted'

const STATUS_CONFIG: Record<StatusKey, { label: string; tone: StatusTone }> = {
  DRAFT: { label: 'Brouillon', tone: 'gray' },
  SENT: { label: 'Envoyée', tone: 'blue' },
  PARTIAL: { label: 'Partiel', tone: 'amber' },
  PAID: { label: 'Payée', tone: 'green' },
  OVERDUE: { label: 'En retard', tone: 'red' },
  CANCELLED: { label: 'Annulée', tone: 'red-muted' },
  UNPAID: { label: 'Impayée', tone: 'gray' },
}

export function getStatusLabel(status: StatusKey): string {
  return STATUS_CONFIG[status]?.label ?? status
}

export function StatusBadge({ status }: { status: StatusKey }) {
  const config = STATUS_CONFIG[status] ?? { label: status, tone: 'gray' as const }
  return <span className={`status-badge status-${config.tone}`}>{config.label}</span>
}
