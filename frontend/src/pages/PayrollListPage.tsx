import { useEffect, useState, type FormEvent } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import {
  createPayroll,
  formatPeriod,
  listPayrolls,
  PAYROLL_STATUS_LABELS,
  type PayrollStatus,
  type PayrollSummary,
} from '../api/payroll'

const CURRENT_YEAR = new Date().getFullYear()
const CURRENT_MONTH = new Date().getMonth() + 1

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ][i],
}))

const YEAR_OPTIONS = Array.from({ length: 7 }, (_, i) => CURRENT_YEAR - 4 + i)

export function PayrollListPage() {
  const navigate = useNavigate()
  const [payrolls, setPayrolls] = useState<PayrollSummary[]>([])
  const [yearFilter, setYearFilter] = useState<number | ''>(CURRENT_YEAR)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create-modal state
  const [creating, setCreating] = useState(false)
  const [createMonth, setCreateMonth] = useState<number>(CURRENT_MONTH)
  const [createYear, setCreateYear] = useState<number>(CURRENT_YEAR)
  const [createNotes, setCreateNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await listPayrolls(yearFilter === '' ? undefined : yearFilter)
      setPayrolls(result)
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && !err.response) {
        setError('Le serveur est injoignable. Vérifiez votre connexion.')
      } else {
        setError('Impossible de charger la liste des paies.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearFilter])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    setCreateError(null)
    setSubmitting(true)
    try {
      const created = await createPayroll({
        month: createMonth,
        year: createYear,
        notes: createNotes,
      })
      setCreating(false)
      navigate(`/paie/${created.id}`)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const body = err.response?.data as { message?: string } | undefined
        if (body?.message) {
          setCreateError(body.message)
        } else if (!err.response) {
          setCreateError('Le serveur est injoignable.')
        } else {
          setCreateError('Impossible de créer la paie. Veuillez réessayer.')
        }
      } else {
        setCreateError('Impossible de créer la paie.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <main className="container" style={{ padding: 'var(--space-8) var(--space-5)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-5)',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1 style={{ marginBottom: 'var(--space-2)' }}>Paie</h1>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Calculez la paie mensuelle, générez et envoyez les bulletins par email.
            </p>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>
            Nouvelle paie
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-5)',
            alignItems: 'center',
          }}
        >
          <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            Année :
          </label>
          <select
            className="select"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value === '' ? '' : Number(e.target.value))}
            style={{ width: 'auto' }}
          >
            <option value="">Toutes</option>
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading && <p style={{ color: 'var(--color-text-muted)' }}>Chargement...</p>}

        {!loading && payrolls.length === 0 && (
          <div
            style={{
              padding: 'var(--space-6)',
              border: '1px dashed var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
            }}
          >
            {yearFilter === ''
              ? "Vous n'avez pas encore de paie. Cliquez sur « Nouvelle paie » pour commencer."
              : `Aucune paie trouvée pour ${yearFilter}.`}
          </div>
        )}

        {!loading && payrolls.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                  <Th>Période</Th>
                  <Th>Statut</Th>
                  <Th align="right">Employés</Th>
                  <Th align="right">Brut</Th>
                  <Th align="right">CNSS</Th>
                  <Th align="right">IR</Th>
                  <Th align="right">Net</Th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/paie/${p.id}`)}
                    style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}
                  >
                    <Td>
                      <span style={{ fontWeight: 600 }}>{formatPeriod(p.month, p.year)}</span>
                    </Td>
                    <Td>
                      <PayrollStatusBadge status={p.status} />
                    </Td>
                    <Td align="right">{p.employeeCount}</Td>
                    <Td align="right">{formatMoneyMAD(p.totalGrossSalary)}</Td>
                    <Td align="right">{formatMoneyMAD(p.totalCnssDeduction)}</Td>
                    <Td align="right">{formatMoneyMAD(p.totalIrDeduction)}</Td>
                    <Td align="right" style={{ fontWeight: 600 }}>
                      {formatMoneyMAD(p.totalNetSalary)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {creating && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !submitting) setCreating(false)
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-4)',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              width: '100%',
              maxWidth: 480,
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <h2 style={{ marginBottom: 'var(--space-3)' }}>Créer une nouvelle paie</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
              Un bulletin sera créé pour chaque employé actif. Vous pourrez le réviser avant de l'envoyer.
            </p>

            {createError && <div className="alert alert-error">{createError}</div>}

            <form onSubmit={handleCreate} noValidate>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div className="field">
                  <label className="field-label">
                    Mois <span className="field-required">*</span>
                  </label>
                  <select
                    className="select"
                    value={createMonth}
                    onChange={(e) => setCreateMonth(Number(e.target.value))}
                    required
                  >
                    {MONTH_OPTIONS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">
                    Année <span className="field-required">*</span>
                  </label>
                  <select
                    className="select"
                    value={createYear}
                    onChange={(e) => setCreateYear(Number(e.target.value))}
                    required
                  >
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field">
                <label className="field-label">Notes (optionnel)</label>
                <textarea
                  className="textarea"
                  value={createNotes}
                  onChange={(e) => setCreateNotes(e.target.value)}
                  rows={3}
                  maxLength={2000}
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCreating(false)}
                  disabled={submitting}
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export function PayrollStatusBadge({ status }: { status: PayrollStatus }) {
  const tone: Record<PayrollStatus, string> = {
    DRAFT: 'status-gray',
    PROCESSED: 'status-green',
    CANCELLED: 'status-red-muted',
  }
  return <span className={`status-badge ${tone[status]}`}>{PAYROLL_STATUS_LABELS[status]}</span>
}

export function formatMoneyMAD(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '0,00 MAD'
  const n = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(n)) return '0,00 MAD'
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n) + ' MAD'
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
        verticalAlign: 'middle',
        fontVariantNumeric: align === 'right' ? 'tabular-nums' : undefined,
        ...style,
      }}
    >
      {children}
    </td>
  )
}
