import { useState, type FormEvent } from 'react'
import axios from 'axios'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { PublicHeader } from '../components/PublicHeader'

type LocationState = { from?: { pathname?: string }; justRegistered?: boolean } | null

type ApiErrorBody = { message?: string; error?: string }

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const state = location.state as LocationState
  const justRegistered = state?.justRegistered === true

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const result = await login(email, password)
      if (result.company === null) {
        navigate('/mon-entreprise/creation', { replace: true })
      } else {
        const redirectTo = state?.from?.pathname ?? '/tableau-de-bord'
        navigate(redirectTo, { replace: true })
      }
    } catch (err: unknown) {
      let message = 'Une erreur est survenue. Veuillez reessayer.'
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        const body = err.response?.data as ApiErrorBody | undefined
        if (status === 401) {
          message = body?.message ?? 'Identifiants invalides.'
        } else if (status === 400 && body?.message) {
          message = body.message
        } else if (!err.response) {
          message = 'Le serveur est injoignable. Verifiez votre connexion.'
        }
      }
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

        {justRegistered && (
          <div
            className="alert"
            style={{
              backgroundColor: '#e6f5ec',
              border: '1px solid #b7dec6',
              color: 'var(--color-success)',
            }}
          >
            Votre compte a ete cree. Vous pouvez maintenant vous connecter.
          </div>
        )}

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
