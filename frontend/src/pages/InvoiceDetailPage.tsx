import { useEffect, useState, type FormEvent } from 'react'
import axios from 'axios'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Modal } from '../components/Modal'
import { StatusBadge } from '../components/ui'
import {
  cancelInvoice,
  deleteInvoice,
  downloadInvoicePdf,
  formatDateFr,
  formatMoneyMAD,
  getInvoice,
  sendInvoice,
  sendInvoiceReminder,
  type Invoice,
  type InvoicePayment,
} from '../api/invoices'
import {
  PAYMENT_METHOD_LABELS,
  recordPayment,
  deletePayment,
  type PaymentMethod,
} from '../api/payments'

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const invoiceId = id ? Number(id) : null

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [reminderModalOpen, setReminderModalOpen] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)

  const load = async () => {
    if (invoiceId === null) return
    setLoading(true)
    setError(null)
    try {
      const inv = await getInvoice(invoiceId)
      setInvoice(inv)
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setError('Cette facture est introuvable.')
      } else {
        setError('Impossible de charger la facture.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [invoiceId])

  const handleCancel = async () => {
    if (!invoice) return

    const confirmed = window.confirm(`Annuler la facture ${invoice.invoiceNumber} ? Cette action est irréversible.`)
    if (!confirmed) return

    setActionLoading(true)
    try {
      const updated = await cancelInvoice(invoice.id)
      setInvoice(updated)
    } catch (err: unknown) {
      const message = extractErrorMessage(err, "Impossible d'annuler la facture.")
      setError(message)
      setTimeout(() => setError(null), 5000)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!invoice) return
    setActionLoading(true)
    try {
      await downloadInvoicePdf(invoice.id, invoice.invoiceNumber)
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Impossible de télécharger le PDF.')
      setError(message)
      setTimeout(() => setError(null), 5000)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!invoice) return

    const confirmed = window.confirm(`Supprimer définitivement la facture ${invoice.invoiceNumber} ? Cette action est irréversible.`)
    if (!confirmed) return

    setActionLoading(true)
    try {
      await deleteInvoice(invoice.id)
      navigate('/factures', { replace: true })
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Impossible de supprimer la facture.')
      setError(message)
      setTimeout(() => setError(null), 5000)
      setActionLoading(false)
    }
  }

  const handleDeletePayment = async (payment: InvoicePayment) => {
    if (!invoice) return

    const confirmed = window.confirm(`Supprimer ce paiement de ${formatMoneyMAD(payment.amount)} ?`)
    if (!confirmed) return

    setActionLoading(true)
    try {
      const updated = await deletePayment(payment.id)
      setInvoice(updated)
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Impossible de supprimer le paiement.')
      setError(message)
      setTimeout(() => setError(null), 5000)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <main className="container" style={{ padding: 'var(--space-8) var(--space-5)' }}>
          <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto var(--space-4)' }} />
            <p style={{ color: 'var(--color-text-muted)' }}>Chargement de la facture...</p>
          </div>
        </main>
      </>
    )
  }

  if (error || !invoice) {
    return (
      <>
        <main className="container" style={{ padding: 'var(--space-8) var(--space-5)' }}>
          <p style={{ marginBottom: 'var(--space-3)' }}>
            <Link to="/factures">← Retour à la liste</Link>
          </p>
          <div className="alert alert-error">{error ?? 'Facture introuvable.'}</div>
        </main>
      </>
    )
  }

  const isDraft = invoice.status === 'DRAFT'
  const isSent = invoice.status === 'SENT'
  const isOverdue = invoice.status === 'OVERDUE'
  const isCancellable = isDraft || isSent || isOverdue
  const canRecordPayment = isSent || isOverdue
  const canSendReminder = isSent || isOverdue
  const hasPayments = invoice.payments.length > 0
  const outstanding = Number(invoice.outstandingAmount)

  return (
    <>
      <main className="container" style={{ padding: 'var(--space-8) var(--space-5)', maxWidth: 1200 }}>
        <p style={{ marginBottom: 'var(--space-3)' }}>
          <Link to="/factures">← Retour à la liste</Link>
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1 style={{ marginBottom: 'var(--space-2)' }}>Facture {invoice.invoiceNumber}</h1>
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
              <StatusBadge status={invoice.status} />
              <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                Date : {formatDateFr(invoice.invoiceDate)}
                {invoice.dueDate && ` | Échéance : ${formatDateFr(invoice.dueDate)}`}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleDownloadPdf}
              disabled={actionLoading}
            >
              Télécharger PDF
            </button>
            {isDraft && (
              <>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate(`/factures/${invoice.id}/modifier`)}
                  disabled={actionLoading}
                >
                  Modifier
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setSendModalOpen(true)}
                  disabled={actionLoading}
                >
                  Envoyer par email
                </button>
              </>
            )}
            {canRecordPayment && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setPaymentModalOpen(true)}
                disabled={actionLoading}
              >
                Enregistrer un paiement
              </button>
            )}
            {canSendReminder && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setReminderModalOpen(true)}
                disabled={actionLoading}
              >
                Envoyer une relance
              </button>
            )}
            {isCancellable && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleCancel}
                disabled={actionLoading}
              >
                Annuler
              </button>
            )}
            {isDraft && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleDelete}
                disabled={actionLoading}
              >
                Supprimer
              </button>
            )}
          </div>
        </div>

        <Section title="Client">
          <p style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>{invoice.clientName}</p>
          {invoice.clientEmail && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
              {invoice.clientEmail}
            </p>
          )}
        </Section>

        <Section title="Lignes">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                  <th style={thStyle}>Description</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Qté</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Prix unitaire</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>TVA</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>HT</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>TTC</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((line) => (
                  <tr key={line.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={cellStyle}>{line.description}</td>
                    <td style={{ ...cellStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {line.quantity}
                    </td>
                    <td style={{ ...cellStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {formatMoneyMAD(line.unitPrice)}
                    </td>
                    <td style={{ ...cellStyle, textAlign: 'right' }}>{Number(line.tvaRate)}%</td>
                    <td style={{ ...cellStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {formatMoneyMAD(line.lineSubtotal)}
                    </td>
                    <td
                      style={{
                        ...cellStyle,
                        textAlign: 'right',
                        fontVariantNumeric: 'tabular-nums',
                        fontWeight: 600,
                      }}
                    >
                      {formatMoneyMAD(line.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Totaux">
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ minWidth: 340 }}>
              <TotalRow label="Total HT" value={formatMoneyMAD(invoice.netAmount)} />
              <TotalRow label="Total TVA" value={formatMoneyMAD(invoice.tvaAmount)} />
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                <TotalRow label="Total TTC" value={formatMoneyMAD(invoice.totalAmount)} bold />
              </div>
              {(hasPayments || canRecordPayment) && (
                <>
                  <TotalRow label="Déjà payé" value={formatMoneyMAD(invoice.paidAmount)} />
                  <TotalRow
                    label="Reste à payer"
                    value={formatMoneyMAD(invoice.outstandingAmount)}
                    bold
                    color={outstanding > 0 ? 'var(--color-danger)' : 'var(--color-success)'}
                  />
                </>
              )}
            </div>
          </div>
        </Section>

        {hasPayments && (
          <Section title="Paiements">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Mode</th>
                    <th style={thStyle}>Référence</th>
                    <th style={thStyle}>Notes</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Montant</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.payments.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={cellStyle}>{formatDateFr(p.paymentDate)}</td>
                      <td style={cellStyle}>{PAYMENT_METHOD_LABELS[p.paymentMethod]}</td>
                      <td style={cellStyle}>{p.referenceNumber ?? '-'}</td>
                      <td style={cellStyle}>{p.notes ?? '-'}</td>
                      <td
                        style={{
                          ...cellStyle,
                          textAlign: 'right',
                          fontVariantNumeric: 'tabular-nums',
                          fontWeight: 600,
                        }}
                      >
                        {formatMoneyMAD(p.amount)}
                      </td>
                      <td style={{ ...cellStyle, textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => handleDeletePayment(p)}
                          disabled={actionLoading || invoice.status === 'CANCELLED'}
                          className="btn-ghost"
                          style={{
                            color: 'var(--color-danger)',
                            fontSize: 'var(--font-size-sm)',
                            padding: 'var(--space-1) var(--space-2)',
                            height: 'auto',
                          }}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {(invoice.paymentTerms || invoice.notes) && (
          <Section title="Informations complémentaires">
            {invoice.paymentTerms && (
              <p style={{ marginBottom: invoice.notes ? 'var(--space-3)' : 0 }}>
                <strong>Conditions de paiement :</strong> {invoice.paymentTerms}
              </p>
            )}
            {invoice.notes && (
              <p style={{ whiteSpace: 'pre-wrap' }}>
                <strong>Notes :</strong>
                <br />
                {invoice.notes}
              </p>
            )}
          </Section>
        )}

        {invoice.sentDate && (
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'right', fontSize: 'var(--font-size-sm)' }}>
            Envoyée le {formatDateFr(invoice.sentDate.slice(0, 10))}
          </p>
        )}
      </main>

      {sendModalOpen && (
        <SendInvoiceModal
          invoice={invoice}
          onClose={() => setSendModalOpen(false)}
          onSent={(updated) => {
            setInvoice(updated)
            setSendModalOpen(false)
          }}
        />
      )}

      {reminderModalOpen && (
        <ReminderModal
          invoice={invoice}
          onClose={() => setReminderModalOpen(false)}
          onSent={(updated) => {
            setInvoice(updated)
            setReminderModalOpen(false)
          }}
        />
      )}

      {paymentModalOpen && (
        <RecordPaymentModal
          invoice={invoice}
          onClose={() => setPaymentModalOpen(false)}
          onRecorded={(updated) => {
            setInvoice(updated)
            setPaymentModalOpen(false)
          }}
        />
      )}
    </>
  )
}

function SendInvoiceModal({
  invoice,
  onClose,
  onSent,
}: {
  invoice: Invoice
  onClose: () => void
  onSent: (updated: Invoice) => void
}) {
  const defaultSubject = `Facture ${invoice.invoiceNumber}`
  const [recipientEmail, setRecipientEmail] = useState(invoice.clientEmail ?? '')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!recipientEmail.trim()) {
      setError("L'adresse email du destinataire est obligatoire.")
      return
    }

    setSubmitting(true)
    try {
      const updated = await sendInvoice(invoice.id, { recipientEmail, subject, message })
      onSent(updated)
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "L'envoi de l'email a échoué."))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Envoyer la facture par email"
      subtitle={`${invoice.invoiceNumber} - ${invoice.clientName}`}
      onClose={onClose}
      busy={submitting}
      width={560}
    >
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="send-recipient" className="field-label">
            Adresse email du destinataire <span className="field-required">*</span>
          </label>
          <input
            id="send-recipient"
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            required
            maxLength={255}
            className="input"
            autoFocus
          />
        </div>

        <div className="field">
          <label htmlFor="send-subject" className="field-label">
            Sujet
          </label>
          <input
            id="send-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={defaultSubject}
            maxLength={500}
            className="input"
          />
        </div>

        <div className="field">
          <label htmlFor="send-message" className="field-label">
            Message
          </label>
          <textarea
            id="send-message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={5000}
            className="textarea"
            placeholder="Si vide, un message standard sera envoyé avec la facture en pièce jointe."
          />
        </div>

        <p className="field-hint" style={{ marginBottom: 'var(--space-5)' }}>
          La facture sera jointe en PDF. Une fois envoyée, son statut passera à "Envoyée".
        </p>

        <ModalActions onClose={onClose} submitting={submitting} submitLabel="Envoyer" />
      </form>
    </Modal>
  )
}

function ReminderModal({
  invoice,
  onClose,
  onSent,
}: {
  invoice: Invoice
  onClose: () => void
  onSent: (updated: Invoice) => void
}) {
  const defaultSubject = `Relance : facture ${invoice.invoiceNumber}`
  const [recipientEmail, setRecipientEmail] = useState(invoice.clientEmail ?? '')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!recipientEmail.trim()) {
      setError("L'adresse email du destinataire est obligatoire.")
      return
    }

    setSubmitting(true)
    try {
      const updated = await sendInvoiceReminder(invoice.id, { recipientEmail, subject, message })
      onSent(updated)
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "L'envoi de la relance a échoué."))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Envoyer une relance par email"
      subtitle={`${invoice.invoiceNumber} - Reste à payer ${formatMoneyMAD(invoice.outstandingAmount)}`}
      onClose={onClose}
      busy={submitting}
      width={560}
    >
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="reminder-recipient" className="field-label">
            Adresse email du destinataire <span className="field-required">*</span>
          </label>
          <input
            id="reminder-recipient"
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            required
            maxLength={255}
            className="input"
            autoFocus
          />
        </div>

        <div className="field">
          <label htmlFor="reminder-subject" className="field-label">
            Sujet
          </label>
          <input
            id="reminder-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={defaultSubject}
            maxLength={500}
            className="input"
          />
        </div>

        <div className="field">
          <label htmlFor="reminder-message" className="field-label">
            Message
          </label>
          <textarea
            id="reminder-message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={5000}
            className="textarea"
            placeholder="Si vide, une relance standard sera envoyée avec la facture en pièce jointe."
          />
        </div>

        <p className="field-hint" style={{ marginBottom: 'var(--space-5)' }}>
          La facture sera jointe en PDF. Le statut de la facture ne change pas.
        </p>

        <ModalActions onClose={onClose} submitting={submitting} submitLabel="Envoyer la relance" />
      </form>
    </Modal>
  )
}

function RecordPaymentModal({
  invoice,
  onClose,
  onRecorded,
}: {
  invoice: Invoice
  onClose: () => void
  onRecorded: (updated: Invoice) => void
}) {
  const today = new Date().toISOString().slice(0, 10)
  const [amount, setAmount] = useState(invoice.outstandingAmount)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER')
  const [paymentDate, setPaymentDate] = useState(today)
  const [referenceNumber, setReferenceNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    const num = Number(amount)
    if (!Number.isFinite(num) || num <= 0) {
      setError('Le montant doit être supérieur à zéro.')
      return
    }
    if (num > Number(invoice.outstandingAmount) + 0.005) {
      setError(`Le montant dépasse le restant dû (${formatMoneyMAD(invoice.outstandingAmount)}).`)
      return
    }

    setSubmitting(true)
    try {
      const updated = await recordPayment(invoice.id, {
        amount,
        paymentMethod,
        paymentDate,
        referenceNumber,
        notes,
      })
      onRecorded(updated)
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Impossible d'enregistrer le paiement."))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Enregistrer un paiement"
      subtitle={`${invoice.invoiceNumber} - Reste à payer ${formatMoneyMAD(invoice.outstandingAmount)}`}
      onClose={onClose}
      busy={submitting}
      width={560}
    >
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="field">
            <label htmlFor="payment-amount" className="field-label">
              Montant (MAD) <span className="field-required">*</span>
            </label>
            <input
              id="payment-amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="input"
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="payment-date" className="field-label">
              Date du paiement <span className="field-required">*</span>
            </label>
            <input
              id="payment-date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
              className="input"
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="payment-method" className="field-label">
            Mode de paiement <span className="field-required">*</span>
          </label>
          <select
            id="payment-method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            required
            className="select"
          >
            <option value="BANK_TRANSFER">{PAYMENT_METHOD_LABELS.BANK_TRANSFER}</option>
            <option value="CASH">{PAYMENT_METHOD_LABELS.CASH}</option>
            <option value="CHECK">{PAYMENT_METHOD_LABELS.CHECK}</option>
            <option value="OTHER">{PAYMENT_METHOD_LABELS.OTHER}</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="payment-reference" className="field-label">
            Référence
          </label>
          <input
            id="payment-reference"
            type="text"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            maxLength={100}
            className="input"
            placeholder="Ex: numéro de virement, numéro de chèque..."
          />
        </div>

        <div className="field">
          <label htmlFor="payment-notes" className="field-label">
            Notes
          </label>
          <textarea
            id="payment-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={1000}
            className="textarea"
          />
        </div>

        <ModalActions onClose={onClose} submitting={submitting} submitLabel="Enregistrer le paiement" />
      </form>
    </Modal>
  )
}

function ModalActions({
  onClose,
  submitting,
  submitLabel,
}: {
  onClose: () => void
  submitting: boolean
  submitLabel: string
}) {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
      <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
        Annuler
      </button>
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Envoi en cours...' : submitLabel}
      </button>
    </div>
  )
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as { message?: string } | undefined
    if (body?.message) return body.message
    if (!err.response) return 'Le serveur est injoignable. Vérifiez votre connexion.'
  }
  return fallback
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
  padding: 'var(--space-3)',
  verticalAlign: 'top',
  fontSize: 'var(--font-size-sm)',
}

function TotalRow({
  label,
  value,
  bold,
  color,
}: {
  label: string
  value: string
  bold?: boolean
  color?: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: 'var(--space-2) 0',
        fontWeight: bold ? 700 : 400,
      }}
    >
      <span style={{ color: color ?? (bold ? 'var(--color-text)' : 'var(--color-text-muted)') }}>
        {label}
      </span>
      <span
        style={{
          fontVariantNumeric: 'tabular-nums',
          fontSize: bold ? 'var(--font-size-lg)' : 'var(--font-size-base)',
          fontWeight: bold ? 700 : 400,
          color: color,
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