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

  const set =
    (key: keyof ClientFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
          setError('Veuillez corriger les champs indiques.')
        } else if (body?.message) {
          setError(body.message)
        } else if (!err.response) {
          setError('Le serveur est injoignable. Verifiez votre connexion.')
        } else {
          setError("Impossible d'enregistrer le client. Veuillez reessayer.")
        }
      } else {
        setError("Impossible d'enregistrer le client. Veuillez reessayer.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <AppHeader />
      <main className="container" style={{ padding: 'var(--space-8) var(--space-5)', maxWidth: 760 }}>
        <p style={{ marginBottom: 'var(--space-3)' }}>
          <Link to="/clients">&larr; Retour a la liste</Link>
        </p>
        <h1 style={{ marginBottom: 'var(--space-5)' }}>
          {isEdit ? 'Modifier le client' : 'Nouveau client'}
        </h1>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <p style={{ color: 'var(--color-text-muted)' }}>Chargement...</p>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <Section title="Identification">
              <Field label="Nom du client / raison sociale" required error={fieldErrors.name}>
                <input value={values.name} onChange={set('name')} required maxLength={255} />
              </Field>
              <Row>
                <Field label="Personne de contact" error={fieldErrors.contactPerson}>
                  <input value={values.contactPerson} onChange={set('contactPerson')} maxLength={255} />
                </Field>
                <Field
                  label="ICE (15 chiffres, optionnel)"
                  error={fieldErrors.iceNumber}
                >
                  <input
                    value={values.iceNumber}
                    onChange={set('iceNumber')}
                    inputMode="numeric"
                    maxLength={15}
                    placeholder="000000000000000"
                  />
                </Field>
              </Row>
            </Section>

            <Section title="Contact">
              <Row>
                <Field label="Email" error={fieldErrors.email}>
                  <input value={values.email} onChange={set('email')} type="email" maxLength={255} />
                </Field>
                <Field label="Telephone" error={fieldErrors.phone}>
                  <input
                    value={values.phone}
                    onChange={set('phone')}
                    maxLength={20}
                    placeholder="+212 5XX XX XX XX"
                  />
                </Field>
              </Row>
              <Field label="Adresse" error={fieldErrors.address}>
                <input value={values.address} onChange={set('address')} maxLength={2000} />
              </Field>
              <Row>
                <Field label="Ville" error={fieldErrors.city}>
                  <input value={values.city} onChange={set('city')} maxLength={100} />
                </Field>
                <Field label="Code postal" error={fieldErrors.postalCode}>
                  <input value={values.postalCode} onChange={set('postalCode')} maxLength={20} />
                </Field>
              </Row>
            </Section>

            <Section title="Notes internes">
              <Field label="Notes" error={fieldErrors.notes}>
                <textarea
                  value={values.notes}
                  onChange={set('notes')}
                  rows={4}
                  maxLength={2000}
                />
              </Field>
            </Section>

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              <button type="submit" className="btn" disabled={submitting}>
                {submitting ? 'Enregistrement...' : isEdit ? 'Enregistrer les modifications' : 'Creer le client'}
              </button>
              <Link to="/clients" className="btn btn-secondary">
                Annuler
              </Link>
            </div>
          </form>
        )}
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
        marginBottom: 'var(--space-5)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <legend
        style={{
          padding: '0 var(--space-2)',
          fontFamily: 'var(--font-serif)',
          fontWeight: 700,
          fontSize: '1.1rem',
        }}
      >
        {title}
      </legend>
      {children}
    </fieldset>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
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
      <label>
        {label}
        {required && <span style={{ color: 'var(--color-danger)' }}> *</span>}
      </label>
      {children}
      {error && <span style={{ color: 'var(--color-danger)', fontSize: '0.85rem' }}>{error}</span>}
    </div>
  )
}
