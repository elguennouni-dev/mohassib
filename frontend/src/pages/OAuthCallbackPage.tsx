import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

type Status = 'loading' | 'error'

export function OAuthCallbackPage() {
  const navigate = useNavigate()
  const { loginWithTokens } = useAuth()
  const [status, setStatus] = useState<Status>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const consumed = useRef(false)

  useEffect(() => {
    if (consumed.current) return
    consumed.current = true

    const fragment = window.location.hash.startsWith('#')
      ? window.location.hash.substring(1)
      : window.location.hash
    const params = new URLSearchParams(fragment)
    const accessToken = params.get('accessToken')
    const refreshToken = params.get('refreshToken')
    const hasCompany = params.get('hasCompany') === 'true'

    // Wipe the fragment so tokens are not visible if the user shares the URL.
    window.history.replaceState(null, '', window.location.pathname)

    if (!accessToken || !refreshToken) {
      setStatus('error')
      setErrorMessage('Reponse de connexion Google invalide.')
      return
    }

    loginWithTokens(accessToken, refreshToken)
      .then(() => {
        navigate(hasCompany ? '/tableau-de-bord' : '/mon-entreprise/creation', { replace: true })
      })
      .catch(() => {
        setStatus('error')
        setErrorMessage('Impossible de finaliser la connexion. Veuillez reessayer.')
      })
  }, [loginWithTokens, navigate])

  if (status === 'loading') {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-muted)',
        }}
      >
        Connexion en cours...
      </main>
    )
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6)',
      }}
    >
      <div
        style={{
          maxWidth: 480,
          padding: 'var(--space-7)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface-2)',
          textAlign: 'center',
        }}
      >
        <h1 style={{ marginBottom: 'var(--space-3)' }}>Connexion impossible</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-5)' }}>
          {errorMessage}
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate('/connexion', { replace: true })}
        >
          Retour a la connexion
        </button>
      </div>
    </main>
  )
}
