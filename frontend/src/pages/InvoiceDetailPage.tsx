import { useEffect, useState, type FormEvent } from 'react'
import axios from 'axios'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { Modal } from '../components/Modal'
import { StatusBadge } from './InvoicesListPage'
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId])

  const handleCancel = async () => {
    if (!invoice) return
    if (!window.confirm(`Annuler la facture ${invoice.invoiceNumber} ?`)) return
    setActionLoading(true)
    try {
      const updated = await cancelInvoice(invoice.id)
      setInvoice(updated)
    } catch (err: unknown) {
      window.alert(extractErrorMessage(err, "Impossible d'annuler la facture."))
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
      window.alert(extractErrorMessage(err, 'Impossible de telecharger le PDF.'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!invoice) return
    if (!window.confirm(`Supprimer definitivement la facture ${invoice.invoiceNumber} ?`)) return
    setActionLoading(true)
    try {
      await deleteInvoice(invoice.id)
      navigate('/factures', { replace: true })
    } catch (err: unknown) {
      window.alert(extractErrorMessage(err, 'Impossible de supprimer la facture.'))
      setActionLoading(false)
    }
  }

  const handleDeletePayment = async (payment: InvoicePayment) => {
    if (!invoice) return
    if (!window.confirm(`Supprimer ce paiement de ${formatMoneyMAD(payment.amount)} ?`)) return
    setActionLoading(true)
    try {
      const updated = await deletePayment(payment.id)
      setInvoice(updated)
    } catch (err: unknown) {
      window.alert(extractErrorMessage(err, 'Impossible de supprimer le paiement.'))
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <AppHeader />
        <main className="container" style={{ padding: 'var(--space-8) var(--space-5)' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>Chargement...</p>
        </main>
      </>
    )
  }

  if (error || !invoice) {
    return (
      <>
        <AppHeader />
        <main className="container" style={{ padding: 'var(--space-8) var(--space-5)' }}>
          <p style={{ marginBottom: 'var(--space-3)' }}>
            <Link to="/factures">&larr; Retour a la liste</Link>
          </p>
          <div className="alert alert-error">{error ?? 'Facture introuvable.'}</div>
        </main>
      </>
    )
  }

  const isDraft = invoice.status === 'DRAFT'
  const isSent = invoice.status === 'SENT'
  const isOverdue = invoice.status === 'OVERDUE'
  const isCancelable = isDraft || isSent || isOverdue
  const canRecordPayment = isSent || isOverdue
  const canSendReminder = isSent || isOverdue
  const hasPayments = invoice.payments.length > 0
  const outstanding = Number(invoice.outstandingAmount)

  return (
    <>
      <AppHeader />
      <main className="container" style={{ padding: 'var(--space-8) var(--space-5)' }}>
        <p style={{ marginBottom: 'var(--space-3)' }}>
          <Link to="/factures">&larr; Retour a la liste</Link>
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-5)',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1 style={{ marginBottom: 'var(--space-2)' }}>Facture {invoice.invoiceNumber}</h1>
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
              <StatusBadge status={invoice.status} />
              <span style={{ color: 'var(--color-text-muted)' }}>
                Date : {formatDateFr(invoice.invoiceDate)}
                {invoice.dueDate && ` | Echeance : ${formatDateFr(invoice.dueDate)}`}
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
              Telecharger PDF
            </button>
            {isDraft && (
              <>
                <button
                  type="button"
                  className="btn"
                  onClick={() => navigate(`/factures/${invoice.id}/modifier`)}
                  disabled={actionLoading}
                >
                  Modifier
                </button>
                <button
                  type="button"
                  className="btn"
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
                className="btn"
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
            {isCancelable && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={actionLoading}
              >
                Annuler
              </button>
            )}
            {isDraft && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={actionLoading}
                style={{
                  padding: 'var(--space-3) var(--space-5)',
                  border: '1px solid var(--color-danger)',
                  borderRadius: 'var(--radius-md)',
                  background: 'transparent',
                  color: 'var(--color-danger)',
                  fontWeight: 600,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                }}
              >
                Supprimer
              </button>
            )}
          </div>
        </div>

        <Section title="Client">
          <p style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>{invoice.clientName}</p>
          {invoice.clientEmail && (
            <p style={{ color: 'var(--color-text-muted)' }}>{invoice.clientEmail}</p>
          )}
        </Section>

        <Section title="Lignes">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                  <th style={thStyle}>Description</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Qte</th>
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
            <div style={{ minWidth: 320, display: 'grid', gap: 'var(--space-2)' }}>
              <TotalRow label="Total HT" value={formatMoneyMAD(invoice.netAmount)} />
              <TotalRow label="Total TVA" value={formatMoneyMAD(invoice.tvaAmount)} />
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-2)' }}>
                <TotalRow label="Total TTC" value={formatMoneyMAD(invoice.totalAmount)} bold />
              </div>
              {(hasPayments || canRecordPayment) && (
                <>
                  <TotalRow label="Deja paye" value={formatMoneyMAD(invoice.paidAmount)} />
                  <TotalRow
                    label="Reste a payer"
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
                  <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Mode</th>
                    <th style={thStyle}>Reference</th>
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
                          title="Supprimer ce paiement"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-danger)',
                            cursor:
                              actionLoading || invoice.status === 'CANCELLED' ? 'not-allowed' : 'pointer',
                            font: 'inherit',
                            padding: 0,
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
          <Section title="Informations complementaires">
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
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'right' }}>
            Envoyee le {formatDateFr(invoice.sentDate.slice(0, 10))}
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
      setError(extractErrorMessage(err, "L'envoi de l'email a echoue."))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Envoyer la facture par email"
      subtitle={
        <>
          {invoice.invoiceNumber} - {invoice.clientName} -{' '}
          <strong>{formatMoneyMAD(invoice.totalAmount)}</strong>
        </>
      }
      onClose={onClose}
      busy={submitting}
    >
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="send-recipient">
            Adresse email du destinataire <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <input
            id="send-recipient"
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            required
            maxLength={255}
            autoFocus
          />
        </div>
        <div className="field">
          <label htmlFor="send-subject">Sujet (optionnel)</label>
          <input
            id="send-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={defaultSubject}
            maxLength={500}
          />
        </div>
        <div className="field">
          <label htmlFor="send-message">Message (optionnel)</label>
          <textarea
            id="send-message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={5000}
            placeholder="Si vide, un message standard en francais sera envoye avec la facture en piece jointe."
          />
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: 'var(--space-4)' }}>
          La facture sera jointe en PDF. Une fois envoyee, son statut passera a "Envoyee".
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
      setError(extractErrorMessage(err, "L'envoi de la relance a echoue."))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Envoyer une relance par email"
      subtitle={
        <>
          {invoice.invoiceNumber} - reste a payer{' '}
          <strong>{formatMoneyMAD(invoice.outstandingAmount)}</strong>
        </>
      }
      onClose={onClose}
      busy={submitting}
    >
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="reminder-recipient">
            Adresse email du destinataire <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <input
            id="reminder-recipient"
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            required
            maxLength={255}
            autoFocus
          />
        </div>
        <div className="field">
          <label htmlFor="reminder-subject">Sujet (optionnel)</label>
          <input
            id="reminder-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={defaultSubject}
            maxLength={500}
          />
        </div>
        <div className="field">
          <label htmlFor="reminder-message">Message (optionnel)</label>
          <textarea
            id="reminder-message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={5000}
            placeholder="Si vide, une relance standard en francais sera envoyee avec la facture en piece jointe."
          />
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: 'var(--space-4)' }}>
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
      setError('Le montant doit etre superieur a zero.')
      return
    }
    if (num > Number(invoice.outstandingAmount) + 0.005) {
      setError(`Le montant depasse le restant du (${formatMoneyMAD(invoice.outstandingAmount)}).`)
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
      subtitle={
        <>
          {invoice.invoiceNumber} - reste a payer{' '}
          <strong>{formatMoneyMAD(invoice.outstandingAmount)}</strong>
        </>
      }
      onClose={onClose}
      busy={submitting}
    >
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <div className="field">
            <label htmlFor="payment-amount">
              Montant (MAD) <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              id="payment-amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="payment-date">
              Date du paiement <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              id="payment-date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="payment-method">
            Mode de paiement <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <select
            id="payment-method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            required
          >
            <option value="BANK_TRANSFER">{PAYMENT_METHOD_LABELS.BANK_TRANSFER}</option>
            <option value="CASH">{PAYMENT_METHOD_LABELS.CASH}</option>
            <option value="CHECK">{PAYMENT_METHOD_LABELS.CHECK}</option>
            <option value="OTHER">{PAYMENT_METHOD_LABELS.OTHER}</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="payment-reference">Reference (optionnel)</label>
          <input
            id="payment-reference"
            type="text"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            maxLength={100}
            placeholder="Ex: numero de virement, numero de cheque..."
          />
        </div>

        <div className="field">
          <label htmlFor="payment-notes">Notes (optionnel)</label>
          <textarea
            id="payment-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={1000}
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
      <button type="submit" className="btn" disabled={submitting}>
        {submitting ? 'Envoi en cours...' : submitLabel}
      </button>
    </div>
  )
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as { message?: string } | undefined
    if (body?.message) return body.message
    if (!err.response) return 'Le serveur est injoignable. Verifiez votre connexion.'
  }
  return fallback
}

const thStyle: React.CSSProperties = {
  padding: 'var(--space-3)',
  fontSize: '0.85rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: 'var(--color-text-muted)',
}

const cellStyle: React.CSSProperties = {
  padding: 'var(--space-3)',
  verticalAlign: 'top',
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
    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: bold ? 700 : 400 }}>
      <span style={{ color: color ?? (bold ? 'var(--color-text)' : 'var(--color-text-muted)') }}>
        {label}
      </span>
      <span
        style={{
          fontVariantNumeric: 'tabular-nums',
          fontSize: bold ? '1.15rem' : '1rem',
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
