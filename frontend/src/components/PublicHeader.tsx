import { Link } from 'react-router-dom'

export function PublicHeader() {
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
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.5rem',
            fontWeight: 700,
            textDecoration: 'none',
            color: 'var(--color-text)',
            letterSpacing: '-0.02em',
          }}
        >
          Mohassib
        </Link>

        <nav
          style={{
            display: 'flex',
            gap: 'var(--space-4)',
            alignItems: 'center',
          }}
        >
          <Link
            to="/connexion"
            style={{
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              fontWeight: 500,
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              transition: 'all var(--transition-fast) ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface-2)'
              e.currentTarget.style.color = 'var(--color-text)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--color-text-secondary)'
            }}
          >
            Connexion
          </Link>

          <Link
            to="/inscription"
            style={{
              padding: 'var(--space-2) var(--space-4)',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-primary-text)',
              textDecoration: 'none',
              fontWeight: 500,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-primary)',
              transition: 'all var(--transition-fast) ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'
              e.currentTarget.style.borderColor = 'var(--color-primary-hover)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary)'
              e.currentTarget.style.borderColor = 'var(--color-primary)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Créer un compte
          </Link>
        </nav>
      </div>
    </header>
  )
}