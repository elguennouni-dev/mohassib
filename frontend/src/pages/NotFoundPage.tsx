import { Link } from 'react-router-dom'
import { PublicHeader } from '../components/PublicHeader'

export function NotFoundPage() {
  return (
    <>
      <PublicHeader />
      <main className="container" style={{ padding: 'var(--space-10) 0', textAlign: 'center' }}>
        <h1 style={{ marginBottom: 'var(--space-3)' }}>Page introuvable</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-5)' }}>
          La page que vous cherchez n'existe pas ou a ete deplacee.
        </p>
        <Link to="/" className="btn">
          Retour a l'accueil
        </Link>
      </main>
    </>
  )
}
