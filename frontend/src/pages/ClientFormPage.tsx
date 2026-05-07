import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import {
  clientToForm,
  createClient,
  emptyClientForm,
  getClient,
  updateClient,
  type ClientFormValues,
} from '../api/clients'

type ApiErrorBody = {
  message?: string
  error?: string
  details?: Array<{ field: string; message: string }>
}

export function ClientFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = id !== undefined && id !== 'nouveau'
  const clientId = isEdit ? Number(id) : null

  const [values, setValues] = useState<ClientFormValues>(emptyClientForm)
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isEdit || clientId === null) return

    let cancelled = false
    setLoading(true)

    getClient(clientId)
      .then((c) => {
        if (!cancelled) setValues(clientToForm(c))
      })
      .catch((err: unknown) => {
        if (cancelled) return
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setError('Ce client est introuvable.')
        } else {
          setError('Impossible de charger le client.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isEdit, clientId])

  const setField = (key: keyof ClientFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setFieldErrors({})
    setSubmitting(true)

    try {
      if (isEdit && clientId !== null) {
        await updateClient(clientId, values)
      } else {
        await createClient(values)
      }
      navigate('/clients', { replace: true })
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const body = err.response?.data as ApiErrorBody | undefined

        if (body?.details && body.details.length > 0) {
          const next: Record<string, string> = {}
          body.details.forEach((d) => {
            next[d.field] = d.message
          })
          setFieldErrors(next)
          setError('Veuillez corriger les champs indiqués.')
        } else if (body?.message) {
          setError(body.message)
        } else if (!err.response) {
          setError('Le serveur est injoignable. Vérifiez votre connexion.')
        } else {
          setError('Impossible d\'enregistrer le client. Veuillez réessayer.')
        }
      } else {
        setError('Impossible d\'enregistrer le client. Veuillez réessayer.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <AppHeader />
        <main className="container" style={{ padding: 'var(--space-8) var(--space-5)', maxWidth: 760 }}>
          <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto var(--space-4)' }} />
            <p style={{ color: 'var(--color-text-muted)' }}>Chargement du client...</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <AppHeader />
      <main className="container" style={{ padding: 'var(--space-8) var(--space-5)', maxWidth: 760 }}>
        <p style={{ marginBottom: 'var(--space-3)' }}>
          <Link to="/clients" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            ← Retour à la liste
          </Link>
        </p>

        <h1 style={{ marginBottom: 'var(--space-5)', fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-semibold)' }}>
          {isEdit ? 'Modifier le client' : 'Nouveau client'}
        </h1>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--space-5)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Section title="Identification">
            <Field label="Nom du client / raison sociale" required error={fieldErrors.name}>
              <input
                value={values.name}
                onChange={setField('name')}
                required
                maxLength={255}
                className="input"
                placeholder="Nom complet ou raison sociale"
              />
            </Field>

            <Row>
              <Field label="Personne de contact" error={fieldErrors.contactPerson}>
                <input
                  value={values.contactPerson}
                  onChange={setField('contactPerson')}
                  maxLength={255}
                  className="input"
                  placeholder="Nom du contact principal"
                />
              </Field>
              <Field label="ICE (15 chiffres)" error={fieldErrors.iceNumber}>
                <input
                  value={values.iceNumber}
                  onChange={setField('iceNumber')}
                  inputMode="numeric"
                  maxLength={15}
                  className="input"
                  placeholder="000000000000000"
                />
              </Field>
            </Row>
          </Section>

          <Section title="Contact">
            <Row>
              <Field label="Email" error={fieldErrors.email}>
                <input
                  value={values.email}
                  onChange={setField('email')}
                  type="email"
                  maxLength={255}
                  className="input"
                  placeholder="contact@client.com"
                />
              </Field>
              <Field label="Téléphone" error={fieldErrors.phone}>
                <input
                  value={values.phone}
                  onChange={setField('phone')}
                  maxLength={20}
                  className="input"
                  placeholder="+212 5XX XX XX XX"
                />
              </Field>
            </Row>

            <Field label="Adresse" error={fieldErrors.address}>
              <input
                value={values.address}
                onChange={setField('address')}
                maxLength={2000}
                className="input"
                placeholder="Adresse complète"
              />
            </Field>

            <Row>
              <Field label="Ville" error={fieldErrors.city}>
                <input
                  value={values.city}
                  onChange={setField('city')}
                  maxLength={100}
                  className="input"
                  placeholder="Ville"
                />
              </Field>
              <Field label="Code postal" error={fieldErrors.postalCode}>
                <input
                  value={values.postalCode}
                  onChange={setField('postalCode')}
                  maxLength={20}
                  className="input"
                  placeholder="Code postal"
                />
              </Field>
            </Row>
          </Section>

          <Section title="Notes internes">
            <Field label="Notes" error={fieldErrors.notes}>
              <textarea
                value={values.notes}
                onChange={setField('notes')}
                rows={4}
                maxLength={2000}
                className="textarea"
                placeholder="Informations complémentaires..."
              />
            </Field>
          </Section>

          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ minWidth: '180px' }}
            >
              {submitting ? 'Enregistrement...' : (isEdit ? 'Enregistrer les modifications' : 'Créer le client')}
            </button>
            <Link to="/clients" className="btn btn-secondary">
              Annuler
            </Link>
          </div>
        </form>
      </main>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        marginBottom: 'var(--space-6)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <legend
        style={{
          padding: '0 var(--space-3)',
          fontFamily: 'var(--font-sans)',
          fontWeight: 'var(--font-weight-semibold)',
          fontSize: 'var(--font-size-md)',
          color: 'var(--color-text)',
          width: 'auto',
        }}
      >
        {title}
      </legend>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {children}
      </div>
    </fieldset>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
      {children}
    </div>
  )
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="field">
      <label className="field-label">
        {label}
        {required && <span className="field-required"> *</span>}
      </label>
      {children}
      {error && <div className="field-error">{error}</div>}
    </div>
  )
}