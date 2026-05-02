import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function AppHeader() {
  const { user, logout } = useAuth()

  return (
    <header style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
      <div
        className="container"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--space-4) var(--space-5)',
          gap: 'var(--space-5)',
        }}
      >
        <Link to="/tableau-de-bord" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700 }}>
          Mohassib
        </Link>
        <nav style={{ display: 'flex', gap: 'var(--space-5)', flex: 1 }}>
          <NavLink to="/tableau-de-bord">Tableau de bord</NavLink>
          <NavLink to="/factures">Factures</NavLink>
          <NavLink to="/paie">Paie</NavLink>
          <NavLink to="/tva">TVA</NavLink>
        </nav>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          {user && (
            <span style={{ color: 'var(--color-text-muted)' }}>
              {user.firstName} {user.lastName}
            </span>
          )}
          <button type="button" onClick={logout} className="btn btn-secondary">
            Deconnexion
          </button>
        </div>
      </div>
    </header>
  )
}
