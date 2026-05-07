import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { Modal } from '../Modal'
import { Button } from '../ui/Button'

export type ConfirmOptions = {
  title: string
  message?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
}

type Pending = {
  options: ConfirmOptions
  resolve: (answer: boolean) => void
}

const ConfirmContext = createContext<((options: ConfirmOptions) => Promise<boolean>) | undefined>(
  undefined,
)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null)

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setPending({ options, resolve })
    })
  }, [])

  const respond = (answer: boolean) => {
    if (!pending) return
    pending.resolve(answer)
    setPending(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && (
        <Modal title={pending.options.title} onClose={() => respond(false)}>
          {pending.options.message && (
            <div
              style={{
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--space-5)',
                fontSize: 'var(--font-size-sm)',
                lineHeight: 'var(--line-height-normal)',
              }}
            >
              {pending.options.message}
            </div>
          )}
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
              justifyContent: 'flex-end',
            }}
          >
            <Button variant="secondary" onClick={() => respond(false)}>
              {pending.options.cancelLabel ?? 'Annuler'}
            </Button>
            <Button
              variant={pending.options.variant === 'danger' ? 'danger' : 'primary'}
              onClick={() => respond(true)}
              autoFocus
            >
              {pending.options.confirmLabel ?? 'Confirmer'}
            </Button>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const fn = useContext(ConfirmContext)
  if (!fn) {
    throw new Error('useConfirm doit être utilisé à l\'intérieur d\'un ConfirmProvider')
  }
  return fn
}
