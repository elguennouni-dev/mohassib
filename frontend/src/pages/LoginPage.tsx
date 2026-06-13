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

  const oauthError = new URLSearchParams(location.search).get('oauth_error')
  const oauthErrorMessage = oauthError
    ? 'La connexion via Google n\'a pas abouti. Veuillez reessayer.'
    : null

  const handleGoogleLogin = () => {
    const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1'
    window.location.href = `${apiBase}/oauth2/authorization/google`
  }

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

        {oauthErrorMessage && !error && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--space-5)' }}>
            {oauthErrorMessage}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={submitting}
          className="btn btn-secondary"
          style={{
            width: '100%',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continuer avec Google
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            margin: 'var(--space-4) 0',
            color: 'var(--color-text-muted)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          <span style={{ flex: 1, height: 1, backgroundColor: 'var(--color-border)' }} />
          ou
          <span style={{ flex: 1, height: 1, backgroundColor: 'var(--color-border)' }} />
        </div>

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