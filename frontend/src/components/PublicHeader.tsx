import { Link } from 'react-router-dom'

export function PublicHeader() {
  return (
    <header style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
      <div
        className="container"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--space-4) var(--space-5)',
        }}
      >
        <Link to="/" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700 }}>
          Mohassib
        </Link>
        <nav style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
          <Link to="/connexion">Connexion</Link>
          <Link to="/inscription" className="btn">
            Creer un compte
          </Link>
        </nav>
      </div>
    </header>
  )
}
