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
      let message = 'Une erreur est survenue. Veuillez réessayer.'

      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        const body = err.response?.data as ApiErrorBody | undefined

        if (status === 401) {
          message = body?.message ?? 'Email ou mot de passe incorrect.'
        } else if (status === 400 && body?.message) {
          message = body.message
        } else if (status === 429) {
          message = 'Trop de tentatives. Veuillez réessayer dans quelques minutes.'
        } else if (!err.response) {
          message = 'Le serveur est injoignable. Vérifiez votre connexion.'
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
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <h1 style={{ marginBottom: 'var(--space-2)' }}>Connexion</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            Accédez à votre espace de travail
          </p>
        </div>

        {justRegistered && (
          <div
            className="alert alert-success"
            style={{
              marginBottom: 'var(--space-5)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Votre compte a été créé. Vous pouvez maintenant vous connecter.
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--space-5)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email" className="field-label">
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="vous@exemple.com"
              disabled={submitting}
            />
          </div>

          <div className="field">
            <label htmlFor="password" className="field-label">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Votre mot de passe"
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
          >
            {submitting ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}>
                <span className="spinner" style={{ width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%' }} />
                Connexion...
              </span>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            Pas encore de compte ?{' '}
            <Link to="/inscription" style={{ fontWeight: 500 }}>
              Créer un compte
            </Link>
          </p>
        </div>
      </main>
    </>
  )
}