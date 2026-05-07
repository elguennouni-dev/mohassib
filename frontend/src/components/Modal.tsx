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
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !busy) {
      onClose()
    }
  }

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        zIndex: 'var(--z-modal-backdrop)',
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
          boxShadow: 'var(--shadow-modal)',
          animation: 'modal-in 0.2s ease-out',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 'var(--space-5)',
            gap: 'var(--space-4)',
          }}
        >
          <div style={{ flex: 1 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text)',
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <div
                style={{
                  marginTop: 'var(--space-2)',
                  color: 'var(--color-text-muted)',
                  fontSize: 'var(--font-size-sm)',
                  lineHeight: 'var(--line-height-normal)',
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Fermer"
            style={{
              background: 'var(--color-surface-2)',
              border: 'none',
              width: '32px',
              height: '32px',
              fontSize: '1.25rem',
              fontWeight: 600,
              cursor: busy ? 'not-allowed' : 'pointer',
              color: 'var(--color-text-muted)',
              padding: 0,
              lineHeight: 1,
              borderRadius: 'var(--radius-md)',
              transition: 'all var(--transition-fast) ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              if (!busy) {
                e.currentTarget.style.backgroundColor = 'var(--color-border)'
                e.currentTarget.style.color = 'var(--color-text)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface-2)'
              e.currentTarget.style.color = 'var(--color-text-muted)'
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}