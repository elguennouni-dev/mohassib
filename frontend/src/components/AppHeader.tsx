import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const navItems = [
  { to: '/tableau-de-bord', label: 'Tableau de bord' },
  { to: '/factures', label: 'Factures' },
  { to: '/clients', label: 'Clients' },
  { to: '/employes', label: 'Employés' },
  { to: '/paie', label: 'Paie' },
  { to: '/tva', label: 'TVA' },
  { to: '/mon-entreprise', label: 'Mon entreprise' },
]

export function AppHeader() {
  const { user, logout } = useAuth()

  return (
    <header
      style={{
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--space-4) var(--space-5)',
          gap: 'var(--space-5)',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        <Link
          to="/tableau-de-bord"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.5rem',
            fontWeight: 700,
            textDecoration: 'none',
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          Mohassib
        </Link>

        <nav
          style={{
            display: 'flex',
            gap: 'var(--space-4)',
            flex: 1,
            marginLeft: 'var(--space-5)',
          }}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 500,
                padding: 'var(--space-1) var(--space-2)',
                borderRadius: 'var(--radius-md)',
                transition: 'color 0.2s ease',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div
          style={{
            display: 'flex',
            gap: 'var(--space-4)',
            alignItems: 'center',
          }}
        >
          {user && (
            <span
              style={{
                color: 'var(--color-text-muted)',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              {user.firstName} {user.lastName}
            </span>
          )}
          <button
            type="button"
            onClick={logout}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              fontSize: '0.875rem',
              fontWeight: 500,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-background-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  )
}