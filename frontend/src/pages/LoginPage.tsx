import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { PublicHeader } from '../components/PublicHeader'

type LocationState = { from?: { pathname?: string } } | null

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      const state = location.state as LocationState
      const redirectTo = state?.from?.pathname ?? '/tableau-de-bord'
      navigate(redirectTo, { replace: true })
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message
          ? 'Identifiants invalides. Veuillez reessayer.'
          : 'Une erreur est survenue. Veuillez reessayer.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PublicHeader />
      <main className="container" style={{ maxWidth: 420, padding: 'var(--space-8) var(--space-5)' }}>
        <h1 style={{ marginBottom: 'var(--space-5)' }}>Connexion</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Adresse email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn" disabled={submitting} style={{ width: '100%' }}>
            {submitting ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <p style={{ marginTop: 'var(--space-5)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Pas encore de compte ? <Link to="/inscription">Creer un compte</Link>
        </p>
      </main>
    </>
  )
}
