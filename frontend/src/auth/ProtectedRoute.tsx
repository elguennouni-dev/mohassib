import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import type { ReactNode } from 'react'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <div className="container" style={{ padding: 'var(--space-8) 0' }}>Chargement...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/connexion" state={{ from: location }} replace />
  }

  return <>{children}</>
}
