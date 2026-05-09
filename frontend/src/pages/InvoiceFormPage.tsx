import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  buildEmptyInvoiceForm,
  computeInvoiceTotals,
  computeLineTotals,
  createInvoice,
  emptyLine,
  formatMoneyMAD,
  getInvoice,
  invoiceToForm,
  updateInvoice,
  VALID_TVA_RATES,
  type InvoiceFormValues,
  type InvoiceLineItemFormValues,
} from '../api/invoices'
import { listClients, type Client } from '../api/clients'

type ApiErrorBody = {
  message?: string
  error?: string
  details?: Array<{ field: string; message: string }>
}

export function InvoiceFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = id !== undefined
  const invoiceId = isEdit ? Number(id) : null

  const [values, setValues] = useState<InvoiceFormValues>(() => buildEmptyInvoiceForm())
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const clientsPromise = listClients({ size: 200 })

        if (isEdit && invoiceId !== null) {
          const [clientsPage, invoice] = await Promise.all([clientsPromise, getInvoice(invoiceId)])

          if (cancelled) return

          if (invoice.status !== 'DRAFT') {
            setError('Seules les factures en brouillon peuvent être modifiées.')
          } else {
            setValues(invoiceToForm(invoice))
          }

          setClients(clientsPage.items)
        } else {
          const clientsPage = await clientsPromise
          if (cancelled) return
          setClients(clientsPage.items)
        }
      } catch (err: unknown) {
        if (cancelled) return
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setError('Cette facture est introuvable.')
        } else {
          setError('Impossible de charger le formulaire.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [isEdit, invoiceId])

  const totals = useMemo(() => computeInvoiceTotals(values.lineItems), [values.lineItems])

  const setField = <K extends keyof InvoiceFormValues>(key: K, value: InvoiceFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const updateLine = (index: number, patch: Partial<InvoiceLineItemFormValues>) => {
    setValues((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    }))
  }

  const addLine = () => {
    setValues((prev) => ({ ...prev, lineItems: [...prev.lineItems, { ...emptyLine }] }))
  }

  const removeLine = (index: number) => {
    setValues((prev) => ({
      ...prev,
      lineItems: prev.lineItems.length > 1 ? prev.lineItems.filter((_, i) => i !== index) : prev.lineItems,
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setFieldErrors({})

    if (values.clientId === '') {
      setError('Veuillez sélectionner un client.')
      return
    }

    setSubmitting(true)

    try {
      const saved = isEdit && invoiceId !== null
        ? await updateInvoice(invoiceId, values)
        : await createInvoice(values)

      navigate(`/factures/${saved.id}`, { replace: true })
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
          setError("Impossible d'enregistrer la facture. Veuillez réessayer.")
        }
      } else {
        setError("Impossible d'enregistrer la facture. Veuillez réessayer.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
          <main className="container" style={{ padding: 'var(--space-8) var(--space-5)' }}>
          <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto var(--space-4)' }} />
            <p style={{ color: 'var(--color-text-muted)' }}>Chargement du formulaire...</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <main className="container" style={{ padding: 'var(--space-8) var(--space-5)', maxWidth: 1200 }}>
        <p style={{ marginBottom: 'var(--space-3)' }}>
          <Link to="/factures">← Retour à la liste</Link>
        </p>

        <h1 style={{ marginBottom: 'var(--space-5)', fontSize: 'var(--font-size-2xl)' }}>
          {isEdit ? 'Modifier la facture' : 'Nouvelle facture'}
        </h1>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--space-5)' }}>
            {error}
          </div>
        )}

        {clients.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h3 className="empty-state-title">Aucun client</h3>
            <p className="empty-state-description">
              Vous devez créer au moins un client avant de pouvoir facturer.
            </p>
            <div className="empty-state-action">
              <Link to="/clients/nouveau" className="btn btn-primary">
                Créer un client
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <Section title="Informations générales">
              <Row>
                <Field label="Client" required error={fieldErrors.clientId}>
                  <select
                    value={values.clientId}
                    onChange={(e) => setField('clientId', e.target.value)}
                    required
                    className="select"
                  >
                    <option value="">Sélectionnez un client...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Date de facture" required error={fieldErrors.invoiceDate}>
                  <input
                    type="date"
                    value={values.invoiceDate}
                    onChange={(e) => setField('invoiceDate', e.target.value)}
                    required
                    className="input"
                  />
                </Field>
              </Row>

              <Row>
                <Field label="Date d'échéance" error={fieldErrors.dueDate}>
                  <input
                    type="date"
                    value={values.dueDate}
                    onChange={(e) => setField('dueDate', e.target.value)}
                    className="input"
                  />
                </Field>

                <Field label="Conditions de paiement" error={fieldErrors.paymentTerms}>
                  <input
                    value={values.paymentTerms}
                    onChange={(e) => setField('paymentTerms', e.target.value)}
                    maxLength={500}
                    className="input"
                    placeholder="Ex: 30 jours net, À réception..."
                  />
                </Field>
              </Row>
            </Section>

            <Section title="Lignes de facture">
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                      <th style={thStyle}>Description</th>
                      <th style={{ ...thStyle, width: 90, textAlign: 'right' }}>Qté</th>
                      <th style={{ ...thStyle, width: 130, textAlign: 'right' }}>Prix unitaire</th>
                      <th style={{ ...thStyle, width: 100, textAlign: 'right' }}>TVA</th>
                      <th style={{ ...thStyle, width: 120, textAlign: 'right' }}>HT</th>
                      <th style={{ ...thStyle, width: 120, textAlign: 'right' }}>TTC</th>
                      <th style={{ ...thStyle, width: 60, textAlign: 'center' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {values.lineItems.map((line, idx) => {
                      const t = computeLineTotals(line)
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td style={cellStyle}>
                            <input
                              value={line.description}
                              onChange={(e) => updateLine(idx, { description: e.target.value })}
                              placeholder="Désignation du produit ou service"
                              required
                              className="input"
                              style={{ width: '100%' }}
                            />
                            {fieldErrors[`lineItems[${idx}].description`] && (
                              <FieldError message={fieldErrors[`lineItems[${idx}].description`]} />
                            )}
                           </td>
                          <td style={{ ...cellStyle, textAlign: 'right' }}>
                            <input
                              type="number"
                              step="0.01"
                              min="0.0001"
                              value={line.quantity}
                              onChange={(e) => updateLine(idx, { quantity: e.target.value })}
                              required
                              className="input"
                              style={{ width: '100%', textAlign: 'right' }}
                            />
                           </td>
                          <td style={{ ...cellStyle, textAlign: 'right' }}>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={line.unitPrice}
                              onChange={(e) => updateLine(idx, { unitPrice: e.target.value })}
                              required
                              className="input"
                              style={{ width: '100%', textAlign: 'right' }}
                            />
                           </td>
                          <td style={{ ...cellStyle, textAlign: 'right' }}>
                            <select
                              value={line.tvaRate}
                              onChange={(e) => updateLine(idx, { tvaRate: e.target.value })}
                              className="select"
                              style={{ width: '100%', textAlign: 'right' }}
                            >
                              {VALID_TVA_RATES.map((r) => (
                                <option key={r} value={r}>
                                  {r}%
                                </option>
                              ))}
                            </select>
                           </td>
                          <td style={{ ...cellStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                            {formatMoneyMAD(t.subtotal)}
                           </td>
                          <td
                            style={{
                              ...cellStyle,
                              textAlign: 'right',
                              fontVariantNumeric: 'tabular-nums',
                              fontWeight: 600,
                            }}
                          >
                            {formatMoneyMAD(t.total)}
                           </td>
                          <td style={{ ...cellStyle, textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => removeLine(idx)}
                              disabled={values.lineItems.length === 1}
                              className="btn-ghost"
                              style={{
                                color: values.lineItems.length === 1
                                  ? 'var(--color-text-muted)'
                                  : 'var(--color-danger)',
                                fontSize: '1.25rem',
                                padding: 'var(--space-1) var(--space-2)',
                                height: 'auto',
                              }}
                            >
                              ×
                            </button>
                           </td>
                         </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={addLine}
                style={{ marginTop: 'var(--space-4)' }}
              >
                + Ajouter une ligne
              </button>
            </Section>

            <Section title="Totaux">
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ minWidth: 300 }}>
                  <TotalRow label="Total HT" value={formatMoneyMAD(totals.subtotal)} />
                  <TotalRow label="Total TVA" value={formatMoneyMAD(totals.tva)} />
                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                    <TotalRow label="Total TTC" value={formatMoneyMAD(totals.total)} bold />
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Notes">
              <Field label="Notes" error={fieldErrors.notes}>
                <textarea
                  value={values.notes}
                  onChange={(e) => setField('notes', e.target.value)}
                  rows={4}
                  maxLength={2000}
                  className="textarea"
                  placeholder="Informations complémentaires affichées sur la facture..."
                />
              </Field>
            </Section>

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ minWidth: '200px' }}
              >
                {submitting
                  ? 'Enregistrement...'
                  : isEdit
                    ? 'Enregistrer les modifications'
                    : 'Créer la facture'}
              </button>
              <Link to="/factures" className="btn btn-secondary">
                Annuler
              </Link>
            </div>
          </form>
        )}
      </main>
    </>
  )
}

const thStyle: React.CSSProperties = {
  padding: 'var(--space-3)',
  fontSize: 'var(--font-size-xs)',
  fontWeight: 'var(--font-weight-semibold)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--color-text-muted)',
}

const cellStyle: React.CSSProperties = {
  padding: 'var(--space-2) var(--space-3)',
  verticalAlign: 'middle',
}

function FieldError({ message }: { message: string }) {
  return <div className="field-error" style={{ marginTop: 'var(--space-1)' }}>{message}</div>
}

function TotalRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: 'var(--space-2) 0',
        fontWeight: bold ? 700 : 400,
      }}
    >
      <span style={{ color: bold ? 'var(--color-text)' : 'var(--color-text-muted)' }}>{label}</span>
      <span
        style={{
          fontVariantNumeric: 'tabular-nums',
          fontSize: bold ? 'var(--font-size-lg)' : 'var(--font-size-base)',
          fontWeight: bold ? 700 : 400,
        }}
      >
        {value}
      </span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        marginBottom: 'var(--space-6)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <h2
        style={{
          margin: '0 0 var(--space-4) 0',
          paddingBottom: 'var(--space-2)',
          borderBottom: '1px solid var(--color-border-subtle)',
          fontSize: 'var(--font-size-md)',
          fontWeight: 'var(--font-weight-semibold)',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
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