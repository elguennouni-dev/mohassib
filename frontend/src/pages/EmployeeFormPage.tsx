import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import {
  buildEmptyEmployeeForm,
  createEmployee,
  employeeToForm,
  getEmployee,
  updateEmployee,
  EMPLOYEE_STATUS_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  type EmployeeFormValues,
  type EmployeeStatus,
  type EmploymentType,
} from '../api/employees'

type ApiErrorBody = {
  message?: string
  error?: string
  details?: Array<{ field: string; message: string }>
}

const EMPLOYMENT_TYPES: EmploymentType[] = ['PERMANENT', 'CONTRACT', 'PART_TIME', 'SEASONAL']
const EMPLOYEE_STATUSES: EmployeeStatus[] = ['ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED']

export function EmployeeFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = id !== undefined && id !== 'nouveau'
  const employeeId = isEdit ? Number(id) : null

  const [values, setValues] = useState<EmployeeFormValues>(buildEmptyEmployeeForm())
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isEdit || employeeId === null) return
    let cancelled = false
    setLoading(true)
    getEmployee(employeeId)
      .then((e) => {
        if (!cancelled) setValues(employeeToForm(e))
      })
      .catch((err: unknown) => {
        if (cancelled) return
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setError("Cet employé est introuvable.")
        } else {
          setError("Impossible de charger l'employé.")
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [isEdit, employeeId])

  const set =
    <K extends keyof EmployeeFormValues>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setValues((prev) => ({ ...prev, [key]: e.target.value as EmployeeFormValues[K] }))
    }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setFieldErrors({})
    setSubmitting(true)
    try {
      if (isEdit && employeeId !== null) {
        await updateEmployee(employeeId, values)
      } else {
        await createEmployee(values)
      }
      navigate('/employes', { replace: true })
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
          setError("Impossible d'enregistrer l'employé. Veuillez réessayer.")
        }
      } else {
        setError("Impossible d'enregistrer l'employé. Veuillez réessayer.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <AppHeader />
      <main className="container" style={{ padding: 'var(--space-8) var(--space-5)', maxWidth: 880 }}>
        <p style={{ marginBottom: 'var(--space-3)' }}>
          <Link to="/employes">← Retour à la liste</Link>
        </p>
        <h1 style={{ marginBottom: 'var(--space-5)' }}>
          {isEdit ? "Modifier l'employé" : 'Nouvel employé'}
        </h1>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <p style={{ color: 'var(--color-text-muted)' }}>Chargement...</p>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <Section title="Identité">
              <Row>
                <Field label="Prénom" required error={fieldErrors.firstName}>
                  <input className="input" value={values.firstName} onChange={set('firstName')} required maxLength={100} />
                </Field>
                <Field label="Nom" required error={fieldErrors.lastName}>
                  <input className="input" value={values.lastName} onChange={set('lastName')} required maxLength={100} />
                </Field>
              </Row>
              <Row>
                <Field label="CIN" error={fieldErrors.cinNumber}>
                  <input
                    className="input"
                    value={values.cinNumber}
                    onChange={set('cinNumber')}
                    maxLength={20}
                    placeholder="Ex: A123456"
                  />
                </Field>
                <Field label="Numéro CNSS" error={fieldErrors.cnssNumber}>
                  <input
                    className="input"
                    value={values.cnssNumber}
                    onChange={set('cnssNumber')}
                    maxLength={20}
                  />
                </Field>
              </Row>
            </Section>

            <Section title="Contact">
              <Row>
                <Field label="Email" error={fieldErrors.email}>
                  <input
                    className="input"
                    value={values.email}
                    onChange={set('email')}
                    type="email"
                    maxLength={255}
                  />
                </Field>
                <Field label="Téléphone" error={fieldErrors.phone}>
                  <input
                    className="input"
                    value={values.phone}
                    onChange={set('phone')}
                    maxLength={20}
                    placeholder="+212 6XX XX XX XX"
                  />
                </Field>
              </Row>
            </Section>

            <Section title="Contrat">
              <Row>
                <Field label="Poste" error={fieldErrors.position}>
                  <input
                    className="input"
                    value={values.position}
                    onChange={set('position')}
                    maxLength={100}
                  />
                </Field>
                <Field label="Département" error={fieldErrors.department}>
                  <input
                    className="input"
                    value={values.department}
                    onChange={set('department')}
                    maxLength={100}
                  />
                </Field>
              </Row>
              <Row>
                <Field label="Type de contrat" required error={fieldErrors.employmentType}>
                  <select className="select" value={values.employmentType} onChange={set('employmentType')} required>
                    {EMPLOYMENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {EMPLOYMENT_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Statut" required error={fieldErrors.status}>
                  <select className="select" value={values.status} onChange={set('status')} required>
                    {EMPLOYEE_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {EMPLOYEE_STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </Field>
              </Row>
              <Row>
                <Field label="Date d'embauche" required error={fieldErrors.hireDate}>
                  <input
                    className="input"
                    type="date"
                    value={values.hireDate}
                    onChange={set('hireDate')}
                    required
                  />
                </Field>
                <Field label="Date de sortie" error={fieldErrors.endDate}>
                  <input
                    className="input"
                    type="date"
                    value={values.endDate}
                    onChange={set('endDate')}
                  />
                </Field>
              </Row>
            </Section>

            <Section title="Rémunération">
              <Row>
                <Field label="Salaire de base (MAD)" required error={fieldErrors.baseSalary}>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={values.baseSalary}
                    onChange={set('baseSalary')}
                    required
                  />
                </Field>
                <Field label="Primes (MAD)" error={fieldErrors.bonuses}>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={values.bonuses}
                    onChange={set('bonuses')}
                    placeholder="0,00"
                  />
                </Field>
              </Row>
              <Row>
                <Field label="Indemnités (MAD)" error={fieldErrors.allowances}>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={values.allowances}
                    onChange={set('allowances')}
                    placeholder="0,00"
                  />
                </Field>
                <span />
              </Row>
            </Section>

            <Section title="Coordonnées bancaires">
              <Row>
                <Field label="Banque" error={fieldErrors.bankName}>
                  <input
                    className="input"
                    value={values.bankName}
                    onChange={set('bankName')}
                    maxLength={100}
                  />
                </Field>
                <Field label="Numéro de compte (RIB)" error={fieldErrors.bankAccountNumber}>
                  <input
                    className="input"
                    value={values.bankAccountNumber}
                    onChange={set('bankAccountNumber')}
                    maxLength={50}
                  />
                </Field>
              </Row>
            </Section>

            <Section title="Notes internes">
              <Field label="Notes" error={fieldErrors.notes}>
                <textarea
                  className="textarea"
                  value={values.notes}
                  onChange={set('notes')}
                  rows={4}
                  maxLength={2000}
                />
              </Field>
            </Section>

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting
                  ? 'Enregistrement...'
                  : isEdit
                    ? 'Enregistrer les modifications'
                    : "Créer l'employé"}
              </button>
              <Link to="/employes" className="btn btn-secondary">
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
          fontFamily: 'var(--font-sans)',
          fontWeight: 700,
          fontSize: '1.05rem',
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
      <label className="field-label">
        {label}
        {required && <span className="field-required"> *</span>}
      </label>
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}
