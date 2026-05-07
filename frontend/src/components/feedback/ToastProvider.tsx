import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

type Toast = {
  id: string
  type: ToastType
  message: string
}

type ToastContextValue = {
  show: (type: ToastType, message: string, durationMs?: number) => void
  success: (message: string, durationMs?: number) => void
  error: (message: string, durationMs?: number) => void
  info: (message: string, durationMs?: number) => void
  warning: (message: string, durationMs?: number) => void
  dismiss: (id: string) => void
}

const DEFAULT_DURATION_MS = 4000

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
} as const

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(
    (type: ToastType, message: string, durationMs: number = DEFAULT_DURATION_MS) => {
      const id = generateId()
      setToasts((current) => [...current, { id, type, message }])
      if (durationMs > 0) {
        window.setTimeout(() => {
          setToasts((current) => current.filter((t) => t.id !== id))
        }, durationMs)
      }
    },
    [],
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (message, durationMs) => show('success', message, durationMs),
      error: (message, durationMs) => show('error', message, durationMs),
      info: (message, durationMs) => show('info', message, durationMs),
      warning: (message, durationMs) => show('warning', message, durationMs),
      dismiss,
    }),
    [show, dismiss],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type]
          return (
            <div key={toast.id} className={`toast toast-${toast.type}`} role="status">
              <Icon size={18} className="toast-icon" aria-hidden="true" />
              <div className="toast-message">{toast.message}</div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="toast-close"
                aria-label="Fermer la notification"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast doit être utilisé à l\'intérieur d\'un ToastProvider')
  }
  return ctx
}