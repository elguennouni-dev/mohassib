import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { PublicHeader } from '../components/PublicHeader'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caracteres.')
      return
    }

    setSubmitting(true)
    try {
      await register(firstName, lastName, email, password)
      navigate('/connexion', { state: { justRegistered: true } })
    } catch {
      setError('Inscription impossible. Verifiez vos informations et reessayez.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PublicHeader />
      <main className="container" style={{ maxWidth: 480, padding: 'var(--space-8) var(--space-5)' }}>
        <h1 style={{ marginBottom: 'var(--space-3)' }}>Creer un compte</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-5)' }}>
          Commencez gratuitement, sans carte bancaire.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div className="field">
              <label htmlFor="firstName">Prenom</label>
              <input
                id="firstName"
                type="text"
                required
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="lastName">Nom</label>
              <input
                id="lastName"
                type="text"
                required
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

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
            <label htmlFor="password">Mot de passe (8 caracteres minimum)</label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn" disabled={submitting} style={{ width: '100%' }}>
            {submitting ? 'Creation en cours...' : 'Creer mon compte'}
          </button>
        </form>

        <p style={{ marginTop: 'var(--space-5)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Deja inscrit ? <Link to="/connexion">Se connecter</Link>
        </p>
      </main>
    </>
  )
}
