import { Loader2 } from 'lucide-react'

type SpinnerProps = {
  size?: number
  label?: string
}

/** Inline spinner. Pass `label` for visible text next to the icon. */
export function Spinner({ size = 16, label }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        color: 'var(--color-text-muted)',
        fontSize: 'var(--font-size-sm)',
      }}
    >
      <Loader2 size={size} className="spinner" aria-hidden="true" />
      {label && <span>{label}</span>}
    </span>
  )
}
