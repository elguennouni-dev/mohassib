import type { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

export type FieldProps = {
  label: string
  htmlFor?: string
  required?: boolean
  hint?: string
  error?: string
  children: ReactNode
}

export function Field({ label, htmlFor, required, hint, error, children }: FieldProps) {
  return (
    <div className="field">
      <label htmlFor={htmlFor} className="field-label">
        {label}
        {required && (
          <span className="field-required" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && (
        <p className="field-error" role="alert">
          <AlertCircle size={12} aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}
