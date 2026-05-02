import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import type { ReactNode } from 'react'

export function RequireCompany({ children }: { children: ReactNode }) {
  const { isLoading, hasCompany } = useAuth()

  if (isLoading) {
    return <div className="container" style={{ padding: 'var(--space-8) 0' }}>Chargement...</div>
  }

  if (!hasCompany) {
    return <Navigate to="/mon-entreprise/creation" replace />
  }

  return <>{children}</>
}
