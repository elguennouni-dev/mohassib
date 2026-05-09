import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  buildEmptyExpenseForm,
  createExpense,
  expenseToForm,
  getExpense,
  updateExpense,
  VALID_TVA_RATES,
  type ExpenseFormValues,
} from '../api/expenses'

type ApiErrorBody = {
  message?: string
  error?: string
  details?: Array<{ field: string; message: string }>
}

export function ExpenseFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = id !== undefined && id !== 'nouvelle'
  const expenseId = isEdit ? Number(id) : null

  const [values, setValues] = useState<ExpenseFormValues>(buildEmptyExpenseForm())
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isEdit || expenseId === null) return
    let cancelled = false
    setLoading(true)
    getExpense(expenseId)
      .then((e) => {
        if (!cancelled) setValues(expenseToForm(e))
      })
      .catch((err: unknown) => {
        if (cancelled) return
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setError('Cette dépense est introuvable.')
        } else {
          setError('Impossible de charger la dépense.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [isEdit, expenseId])

  const set =
    <K extends keyof ExpenseFormValues>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setValues((prev) => ({ ...prev, [key]: e.target.value as ExpenseFormValues[K] }))
    }

  const totals = useMemo(() => {
    const base = Number(values.baseAmount || 0)
    const rate = Number(values.tvaRate || 0)
    const tva = base * (rate / 100)
    return {
      base: Number.isFinite(base) ? base : 0,
      tva: Number.isFinite(tva) ? tva : 0,
      total: Number.isFinite(base + tva) ? base + tva : 0,
    }
  }, [values.baseAmount, values.tvaRate])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setFieldErrors({})
    setSubmitting(true)
    try {
      if (isEdit && expenseId !== null) {
        await updateExpense(expenseId, values)
      } else {
        await createExpense(values)
      }
      navigate('/depenses', { replace: true })
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
          setError("Impossible d'enregistrer la dépense. Veuillez réessayer.")
        }
      } else {
        setError("Impossible d'enregistrer la dépense. Veuillez réessayer.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <main className="container" style={{ padding: 'var(--space-8) var(--space-5)', maxWidth: 760 }}>
        <p style={{ marginBottom: 'var(--space-3)' }}>
          <Link to="/depenses">← Retour à la liste</Link>
        </p>
        <h1 style={{ marginBottom: 'var(--space-5)' }}>
          {isEdit ? 'Modifier la dépense' : 'Nouvelle dépense'}
        </h1>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <p style={{ color: 'var(--color-text-muted)' }}>Chargement...</p>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <Section title="Informations">
              <Row>
                <Field label="Date" required error={fieldErrors.expenseDate}>
                  <input
                    className="input"
                    type="date"
                    value={values.expenseDate}
                    onChange={set('expenseDate')}
                    required
                  />
                </Field>
                <Field label="Fournisseur" error={fieldErrors.vendorName}>
                  <input
                    className="input"
                    value={values.vendorName}
                    onChange={set('vendorName')}
                    maxLength={255}
                  />
                </Field>
              </Row>
              <Row>
                <Field label="Catégorie" error={fieldErrors.category}>
                  <input
                    className="input"
                    value={values.category}
                    onChange={set('category')}
                    maxLength={100}
                    placeholder="Ex: Loyer, Fournitures, Carburant..."
                  />
                </Field>
                <Field label="Référence" error={fieldErrors.referenceNumber}>
                  <input
                    className="input"
                    value={values.referenceNumber}
                    onChange={set('referenceNumber')}
                    maxLength={100}
                    placeholder="N° de facture du fournisseur"
                  />
                </Field>
              </Row>
            </Section>

            <Section title="Montants">
              <Row>
                <Field label="Montant HT (MAD)" required error={fieldErrors.baseAmount}>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={values.baseAmount}
                    onChange={set('baseAmount')}
                    required
                  />
                </Field>
                <Field label="Taux de TVA" required error={fieldErrors.tvaRate}>
                  <select className="select" value={values.tvaRate} onChange={set('tvaRate')} required>
                    {VALID_TVA_RATES.map((r) => (
                      <option key={r} value={r}>
                        {r}%
                      </option>
                    ))}
                  </select>
                </Field>
              </Row>

              <div
                style={{
                  marginTop: 'var(--space-4)',
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface-2)',
                  display: 'grid',
                  gap: 'var(--space-2)',
                }}
              >
                <TotalRow label="Montant HT" value={formatMoneyMAD(totals.base)} />
                <TotalRow label="TVA" value={formatMoneyMAD(totals.tva)} />
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-2)' }}>
                  <TotalRow label="Total TTC" value={formatMoneyMAD(totals.total)} bold />
                </div>
              </div>
            </Section>

            <Section title="Description">
              <Field label="Description (optionnel)" error={fieldErrors.description}>
                <textarea
                  className="textarea"
                  value={values.description}
                  onChange={set('description')}
                  rows={3}
                  maxLength={500}
                />
              </Field>
            </Section>

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting
                  ? 'Enregistrement...'
                  : isEdit
                    ? 'Enregistrer les modifications'
                    : 'Créer la dépense'}
              </button>
              <Link to="/depenses" className="btn btn-secondary">
                Annuler
              </Link>
            </div>
          </form>
        )}
      </main>
    </>
  )
}

function formatMoneyMAD(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '0,00 MAD'
  const n = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(n)) return '0,00 MAD'
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n) + ' MAD'
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

function TotalRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: bold ? 700 : 400 }}>
      <span style={{ color: bold ? 'var(--color-text)' : 'var(--color-text-muted)' }}>{label}</span>
      <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: bold ? '1.1rem' : '1rem' }}>{value}</span>
    </div>
  )
}
