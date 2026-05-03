import type { ReactNode } from 'react'

type ModalProps = {
  title: string
  subtitle?: ReactNode
  onClose: () => void
  busy?: boolean
  width?: number
  children: ReactNode
}

export function Modal({ title, subtitle, onClose, busy, width = 560, children }: ModalProps) {
  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          width: '100%',
          maxWidth: width,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 'var(--space-4)',
            gap: 'var(--space-4)',
          }}
        >
          <div>
            <h2 style={{ marginBottom: subtitle ? 'var(--space-2)' : 0 }}>{title}</h2>
            {subtitle && (
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>{subtitle}</div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Fermer"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: busy ? 'not-allowed' : 'pointer',
              color: 'var(--color-text-muted)',
              padding: 0,
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
