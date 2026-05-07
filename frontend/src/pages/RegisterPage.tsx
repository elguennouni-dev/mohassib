import { useState, type FormEvent } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { PublicHeader } from '../components/PublicHeader'

type ApiErrorBody = {
  message?: string
  error?: string
  details?: Array<{ field: string; message: string }>
}

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setFieldErrors({})

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    setSubmitting(true)

    try {
      await register(firstName, lastName, email, password)
      navigate('/connexion', { state: { justRegistered: true } })
    } catch (err: unknown) {
      let message = 'Inscription impossible. Vérifiez vos informations et réessayez.'

      if (axios.isAxiosError(err)) {
        const body = err.response?.data as ApiErrorBody | undefined

        if (body?.details && body.details.length > 0) {
          const errors: Record<string, string> = {}
          body.details.forEach((d) => {
            errors[d.field] = d.message
          })
          setFieldErrors(errors)
          message = 'Veuillez corriger les champs indiqués.'
        } else if (body?.message) {
          message = body.message
        } else if (!err.response) {
          message = 'Le serveur est injoignable. Vérifiez votre connexion.'
        }
      }

      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const getFieldError = (field: string) => fieldErrors[field]

  return (
    <>
      <PublicHeader />
      <main className="container" style={{ maxWidth: 480, padding: 'var(--space-8) var(--space-5)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <h1 style={{ marginBottom: 'var(--space-2)' }}>Créer un compte</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            Commencez gratuitement, sans carte bancaire.
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--space-5)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="field">
              <label htmlFor="firstName" className="field-label">
                Prénom <span className="field-required">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                required
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={`input ${getFieldError('firstName') ? 'input-invalid' : ''}`}
                disabled={submitting}
                placeholder="Jean"
              />
              {getFieldError('firstName') && (
                <div className="field-error">{getFieldError('firstName')}</div>
              )}
            </div>

            <div className="field">
              <label htmlFor="lastName" className="field-label">
                Nom <span className="field-required">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                required
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={`input ${getFieldError('lastName') ? 'input-invalid' : ''}`}
                disabled={submitting}
                placeholder="Dupont"
              />
              {getFieldError('lastName') && (
                <div className="field-error">{getFieldError('lastName')}</div>
              )}
            </div>
          </div>

          <div className="field">
            <label htmlFor="email" className="field-label">
              Adresse email <span className="field-required">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`input ${getFieldError('email') ? 'input-invalid' : ''}`}
              disabled={submitting}
              placeholder="jean.dupont@exemple.com"
            />
            {getFieldError('email') && (
              <div className="field-error">{getFieldError('email')}</div>
            )}
          </div>

          <div className="field">
            <label htmlFor="password" className="field-label">
              Mot de passe <span className="field-required">*</span>
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`input ${getFieldError('password') ? 'input-invalid' : ''}`}
              disabled={submitting}
              placeholder="8 caractères minimum"
            />
            {getFieldError('password') && (
              <div className="field-error">{getFieldError('password')}</div>
            )}
            {!getFieldError('password') && (
              <div className="field-hint">
                Minimum 8 caractères
              </div>
            )}
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
                Création en cours...
              </span>
            ) : (
              'Créer mon compte'
            )}
          </button>
        </form>

        <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            Déjà inscrit ?{' '}
            <Link to="/connexion" style={{ fontWeight: 500 }}>
              Se connecter
            </Link>
          </p>
        </div>

        <div style={{ marginTop: 'var(--space-5)', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-disabled)', fontSize: 'var(--font-size-xs)' }}>
            En créant un compte, vous acceptez nos conditions d'utilisation.
          </p>
        </div>
      </main>
    </>
  )
}