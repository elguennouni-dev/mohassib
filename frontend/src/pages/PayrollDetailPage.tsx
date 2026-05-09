import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { formatMoneyMAD, PayrollStatusBadge } from './PayrollListPage'
import {
  deletePayroll,
  downloadSalarySlipPdf,
  formatPeriod,
  getPayroll,
  processPayroll,
  type Payroll,
  type SalarySlip,
} from '../api/payroll'

export function PayrollDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const payrollId = id ? Number(id) : null

  const [payroll, setPayroll] = useState<Payroll | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    if (payrollId === null) return
    setLoading(true)
    setError(null)
    try {
      const result = await getPayroll(payrollId)
      setPayroll(result)
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setError('Cette paie est introuvable.')
      } else {
        setError('Impossible de charger la paie.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payrollId])

  const handleProcess = async () => {
    if (!payroll) return
    const slipsWithoutEmail = payroll.slips.filter((s) => !s.employeeEmail).length
    let warning = ''
    if (slipsWithoutEmail > 0) {
      warning = `\n\n${slipsWithoutEmail} bulletin(s) ne pourront pas être envoyés (employés sans email).`
    }
    const confirmed = window.confirm(
      `Traiter la paie de ${formatPeriod(payroll.month, payroll.year)} ?\nLes bulletins seront envoyés par email aux employés.${warning}`,
    )
    if (!confirmed) return

    setActionLoading(true)
    try {
      const updated = await processPayroll(payroll.id)
      setPayroll(updated)
      window.alert('Paie traitée avec succès.')
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Impossible de traiter la paie.')
      window.alert(msg)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!payroll) return
    const confirmed = window.confirm(
      `Supprimer définitivement la paie de ${formatPeriod(payroll.month, payroll.year)} ?`,
    )
    if (!confirmed) return

    setActionLoading(true)
    try {
      await deletePayroll(payroll.id)
      navigate('/paie', { replace: true })
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Impossible de supprimer la paie.')
      window.alert(msg)
      setActionLoading(false)
    }
  }

  const handleDownloadSlip = async (slip: SalarySlip) => {
    if (!payroll) return
    const fileLabel = `bulletin-${payroll.year}-${String(payroll.month).padStart(2, '0')}-${slip.employeeLastName.toLowerCase()}`
    setActionLoading(true)
    try {
      await downloadSalarySlipPdf(slip.id, fileLabel)
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Impossible de télécharger le bulletin.')
      window.alert(msg)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <main className="container" style={{ padding: 'var(--space-8) var(--space-5)' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>Chargement...</p>
        </main>
      </>
    )
  }

  if (error || !payroll) {
    return (
      <>
        <main className="container" style={{ padding: 'var(--space-8) var(--space-5)' }}>
          <p style={{ marginBottom: 'var(--space-3)' }}>
            <Link to="/paie">← Retour à la liste</Link>
          </p>
          <div className="alert alert-error">{error ?? 'Paie introuvable.'}</div>
        </main>
      </>
    )
  }

  const isDraft = payroll.status === 'DRAFT'

  return (
    <>
      <main className="container" style={{ padding: 'var(--space-8) var(--space-5)' }}>
        <p style={{ marginBottom: 'var(--space-3)' }}>
          <Link to="/paie">← Retour à la liste</Link>
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
            <h1 style={{ marginBottom: 'var(--space-2)' }}>
              Paie {formatPeriod(payroll.month, payroll.year)}
            </h1>
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
              <PayrollStatusBadge status={payroll.status} />
              <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                {payroll.employeeCount} employé{payroll.employeeCount > 1 ? 's' : ''}
                {payroll.processedAt && ` | Traitée le ${formatDateFr(payroll.processedAt)}`}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {isDraft && (
              <>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleProcess}
                  disabled={actionLoading}
                >
                  Traiter et envoyer
                </button>
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
              </>
            )}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-5)',
          }}
        >
          <KpiCard label="Total brut" value={formatMoneyMAD(payroll.totalGrossSalary)} />
          <KpiCard label="Total CNSS" value={formatMoneyMAD(payroll.totalCnssDeduction)} />
          <KpiCard label="Total IR" value={formatMoneyMAD(payroll.totalIrDeduction)} />
          <KpiCard label="Total net" value={formatMoneyMAD(payroll.totalNetSalary)} highlight />
        </div>

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
            Bulletins de paie
          </legend>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                  <Th>Employé</Th>
                  <Th>Poste</Th>
                  <Th align="right">Brut</Th>
                  <Th align="right">CNSS</Th>
                  <Th align="right">IR</Th>
                  <Th align="right">Net</Th>
                  <Th>Envoyé</Th>
                  <Th align="right">Action</Th>
                </tr>
              </thead>
              <tbody>
                {payroll.slips.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <Td>
                      <div style={{ fontWeight: 600 }}>
                        {s.employeeLastName} {s.employeeFirstName}
                      </div>
                      {s.employeeEmail && (
                        <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                          {s.employeeEmail}
                        </div>
                      )}
                      {!s.employeeEmail && (
                        <div style={{ color: 'var(--color-warning)', fontSize: 'var(--font-size-xs)' }}>
                          Pas d'email
                        </div>
                      )}
                    </Td>
                    <Td>{s.employeePosition ?? '-'}</Td>
                    <Td align="right">{formatMoneyMAD(s.grossSalary)}</Td>
                    <Td align="right">{formatMoneyMAD(s.cnssDeduction)}</Td>
                    <Td align="right">{formatMoneyMAD(s.irDeduction)}</Td>
                    <Td align="right" style={{ fontWeight: 600 }}>
                      {formatMoneyMAD(s.netSalary)}
                    </Td>
                    <Td>
                      {s.sentAt ? (
                        <span style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-xs)' }}>
                          Envoyé
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                          —
                        </span>
                      )}
                    </Td>
                    <Td align="right">
                      <button
                        type="button"
                        onClick={() => handleDownloadSlip(s)}
                        disabled={actionLoading}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-primary)',
                          cursor: actionLoading ? 'not-allowed' : 'pointer',
                          padding: 0,
                          font: 'inherit',
                          textDecoration: 'underline',
                        }}
                      >
                        Télécharger
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </fieldset>

        {payroll.notes && (
          <fieldset
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-5)',
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
              Notes
            </legend>
            <p style={{ whiteSpace: 'pre-wrap' }}>{payroll.notes}</p>
          </fieldset>
        )}
      </main>
    </>
  )
}

function KpiCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      style={{
        padding: 'var(--space-4)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: highlight ? 'var(--color-primary-light)' : 'var(--color-surface)',
      }}
    >
      <p
        style={{
          color: 'var(--color-text-muted)',
          fontSize: 'var(--font-size-xs)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: 'var(--space-2)',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: '1.4rem',
          fontWeight: 700,
          color: highlight ? 'var(--color-primary)' : 'var(--color-text)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </p>
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

function formatDateFr(value: string | null): string {
  if (!value) return '-'
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function Th({ children, align }: { children: React.ReactNode; align?: 'right' }) {
  return (
    <th
      style={{
        padding: 'var(--space-3)',
        fontSize: '0.85rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        color: 'var(--color-text-muted)',
        textAlign: align ?? 'left',
      }}
    >
      {children}
    </th>
  )
}

function Td({
  children,
  align,
  style,
}: {
  children: React.ReactNode
  align?: 'right'
  style?: React.CSSProperties
}) {
  return (
    <td
      style={{
        padding: 'var(--space-3)',
        textAlign: align ?? 'left',
        verticalAlign: 'top',
        fontVariantNumeric: align === 'right' ? 'tabular-nums' : undefined,
        ...style,
      }}
    >
      {children}
    </td>
  )
}
