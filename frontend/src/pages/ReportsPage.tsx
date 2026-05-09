import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  getInvoiceReport,
  getPayrollReport,
  getTvaReport,
  type AnnualPayrollReport,
  type AnnualTvaReport,
  type MonthlyInvoiceReport,
} from '../api/reports'

type Tab = 'invoices' | 'payroll' | 'tva'

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 7 }, (_, i) => CURRENT_YEAR - 4 + i)

const MONTH_NAMES_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

export function ReportsPage() {
  const [tab, setTab] = useState<Tab>('invoices')
  const [year, setYear] = useState<number>(CURRENT_YEAR)

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
            <h1 style={{ marginBottom: 'var(--space-2)' }}>Rapports</h1>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Vue annuelle de la facturation, de la paie et de la TVA.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
              Année :
            </label>
            <select
              className="select"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              style={{ width: 'auto' }}
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 'var(--space-1)',
            borderBottom: '1px solid var(--color-border)',
            marginBottom: 'var(--space-5)',
          }}
        >
          <TabButton active={tab === 'invoices'} onClick={() => setTab('invoices')}>
            Facturation
          </TabButton>
          <TabButton active={tab === 'payroll'} onClick={() => setTab('payroll')}>
            Paie
          </TabButton>
          <TabButton active={tab === 'tva'} onClick={() => setTab('tva')}>
            TVA
          </TabButton>
        </div>

        {tab === 'invoices' && <InvoiceReportTab year={year} />}
        {tab === 'payroll' && <PayrollReportTab year={year} />}
        {tab === 'tva' && <TvaReportTab year={year} />}
      </main>
    </>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        padding: 'var(--space-3) var(--space-4)',
        fontSize: 'var(--font-size-base)',
        fontWeight: active ? 600 : 500,
        color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
        borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
        marginBottom: -1,
        cursor: 'pointer',
        transition: 'color 0.15s, border-color 0.15s',
      }}
    >
      {children}
    </button>
  )
}

function InvoiceReportTab({ year }: { year: number }) {
  const [data, setData] = useState<MonthlyInvoiceReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getInvoiceReport(year)
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        if (axios.isAxiosError(err) && !err.response) {
          setError('Le serveur est injoignable.')
        } else {
          setError('Impossible de charger le rapport.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [year])

  if (error) return <div className="alert alert-error">{error}</div>
  if (loading || !data) return <p style={{ color: 'var(--color-text-muted)' }}>Chargement...</p>

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-5)',
        }}
      >
        <Stat label="Chiffre d'affaires" value={formatMoneyMAD(data.totalRevenue)} highlight />
        <Stat label="TVA collectée" value={formatMoneyMAD(data.totalTva)} />
        <Stat
          label="Factures émises"
          value={`${data.totalInvoiceCount}`}
          hint={`${data.paidInvoiceCount} payée${data.paidInvoiceCount > 1 ? 's' : ''}`}
        />
        <Stat
          label="En attente"
          value={`${data.outstandingInvoiceCount}`}
          hint={formatMoneyMAD(data.outstandingAmount)}
          tone={data.outstandingInvoiceCount > 0 ? 'warning' : 'neutral'}
        />
      </div>

      <ReportTable
        headers={['Mois', 'Factures', 'CA HT/TTC', 'TVA collectée', 'Payées', 'Encaissé']}
        rows={data.months.map((m) => [
          MONTH_NAMES_FR[m.month - 1],
          numberCell(m.invoiceCount),
          formatMoneyMAD(m.revenue),
          formatMoneyMAD(m.tva),
          numberCell(m.paidCount),
          formatMoneyMAD(m.paidAmount),
        ])}
        totals={[
          'Total',
          numberCell(data.totalInvoiceCount),
          formatMoneyMAD(data.totalRevenue),
          formatMoneyMAD(data.totalTva),
          numberCell(data.paidInvoiceCount),
          formatMoneyMAD(data.paidAmount),
        ]}
      />
    </>
  )
}

function PayrollReportTab({ year }: { year: number }) {
  const [data, setData] = useState<AnnualPayrollReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getPayrollReport(year)
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        if (axios.isAxiosError(err) && !err.response) {
          setError('Le serveur est injoignable.')
        } else {
          setError('Impossible de charger le rapport.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [year])

  if (error) return <div className="alert alert-error">{error}</div>
  if (loading || !data) return <p style={{ color: 'var(--color-text-muted)' }}>Chargement...</p>

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-5)',
        }}
      >
        <Stat label="Salaire brut total" value={formatMoneyMAD(data.totalGross)} />
        <Stat label="Cotisations CNSS" value={formatMoneyMAD(data.totalCnss)} />
        <Stat label="Impôt sur le revenu" value={formatMoneyMAD(data.totalIr)} />
        <Stat label="Salaires nets versés" value={formatMoneyMAD(data.totalNet)} highlight />
      </div>

      <ReportTable
        headers={['Mois', 'Statut', 'Employés', 'Brut', 'CNSS', 'IR', 'Net']}
        rows={data.months.map((m) => [
          MONTH_NAMES_FR[m.month - 1],
          m.exists ? translatePayrollStatus(m.status) : muted('—'),
          m.exists ? numberCell(m.employeeCount) : muted('—'),
          m.exists ? formatMoneyMAD(m.gross) : muted('—'),
          m.exists ? formatMoneyMAD(m.cnss) : muted('—'),
          m.exists ? formatMoneyMAD(m.ir) : muted('—'),
          m.exists ? formatMoneyMAD(m.net) : muted('—'),
        ])}
        totals={[
          'Total',
          '',
          numberCell(data.totalEmployeeMonths),
          formatMoneyMAD(data.totalGross),
          formatMoneyMAD(data.totalCnss),
          formatMoneyMAD(data.totalIr),
          formatMoneyMAD(data.totalNet),
        ]}
      />
    </>
  )
}

function TvaReportTab({ year }: { year: number }) {
  const [data, setData] = useState<AnnualTvaReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getTvaReport(year)
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        if (axios.isAxiosError(err) && !err.response) {
          setError('Le serveur est injoignable.')
        } else {
          setError('Impossible de charger le rapport.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [year])

  if (error) return <div className="alert alert-error">{error}</div>
  if (loading || !data) return <p style={{ color: 'var(--color-text-muted)' }}>Chargement...</p>

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-5)',
        }}
      >
        <Stat label="TVA collectée" value={formatMoneyMAD(data.totalTvaCollected)} />
        <Stat label="TVA déductible" value={formatMoneyMAD(data.totalTvaDeductible)} />
        <Stat
          label={Number(data.totalTvaToPay) < 0 ? 'Crédit de TVA cumulé' : 'TVA à payer cumulée'}
          value={formatMoneyMAD(Math.abs(Number(data.totalTvaToPay)))}
          tone={Number(data.totalTvaToPay) < 0 ? 'success' : 'neutral'}
          highlight
        />
      </div>

      <ReportTable
        headers={['Mois', 'Statut', 'CA HT', 'TVA collectée', 'Achats HT', 'TVA déductible', 'À payer']}
        rows={data.months.map((m) => [
          MONTH_NAMES_FR[m.month - 1],
          m.declared ? translateTvaStatus(m.declarationStatus) : muted('Non déclarée'),
          formatMoneyMAD(m.salesBase),
          formatMoneyMAD(m.tvaCollected),
          formatMoneyMAD(m.expensesBase),
          formatMoneyMAD(m.tvaDeductible),
          Number(m.tvaToPay) < 0
            ? <span style={{ color: 'var(--color-success)' }}>Crédit {formatMoneyMAD(Math.abs(Number(m.tvaToPay)))}</span>
            : formatMoneyMAD(m.tvaToPay),
        ])}
        totals={[
          'Total',
          '',
          formatMoneyMAD(data.totalSalesBase),
          formatMoneyMAD(data.totalTvaCollected),
          formatMoneyMAD(data.totalExpensesBase),
          formatMoneyMAD(data.totalTvaDeductible),
          Number(data.totalTvaToPay) < 0
            ? <span style={{ color: 'var(--color-success)' }}>Crédit {formatMoneyMAD(Math.abs(Number(data.totalTvaToPay)))}</span>
            : formatMoneyMAD(data.totalTvaToPay),
        ]}
      />
    </>
  )
}

function ReportTable({
  headers,
  rows,
  totals,
}: {
  headers: string[]
  rows: React.ReactNode[][]
  totals?: React.ReactNode[]
}) {
  return (
    <div style={{ overflowX: 'auto', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
            {headers.map((h, idx) => (
              <th
                key={idx}
                style={{
                  padding: 'var(--space-3)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--color-text-muted)',
                  textAlign: idx === 0 || idx === 1 ? 'left' : 'right',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
            >
              {row.map((cell, cellIdx) => (
                <td
                  key={cellIdx}
                  style={{
                    padding: 'var(--space-3)',
                    textAlign: cellIdx === 0 || cellIdx === 1 ? 'left' : 'right',
                    fontVariantNumeric: cellIdx > 1 ? 'tabular-nums' : undefined,
                    fontWeight: cellIdx === 0 ? 600 : 400,
                    fontSize: 'var(--font-size-sm)',
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
          {totals && (
            <tr style={{ backgroundColor: 'var(--color-surface-2)', borderTop: '2px solid var(--color-border)' }}>
              {totals.map((cell, idx) => (
                <td
                  key={idx}
                  style={{
                    padding: 'var(--space-3)',
                    textAlign: idx === 0 || idx === 1 ? 'left' : 'right',
                    fontVariantNumeric: idx > 1 ? 'tabular-nums' : undefined,
                    fontWeight: 700,
                    fontSize: 'var(--font-size-sm)',
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function Stat({
  label,
  value,
  hint,
  tone = 'neutral',
  highlight,
}: {
  label: string
  value: string
  hint?: string
  tone?: 'neutral' | 'success' | 'warning' | 'danger'
  highlight?: boolean
}) {
  const toneColor = {
    neutral: 'var(--color-text)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-danger)',
  }
  return (
    <div
      style={{
        padding: 'var(--space-4)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
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
          fontSize: '1.25rem',
          fontWeight: 700,
          color: highlight ? 'var(--color-primary)' : toneColor[tone],
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </p>
      {hint && (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', marginTop: 4 }}>
          {hint}
        </p>
      )}
    </div>
  )
}

function translatePayrollStatus(status: string | null): React.ReactNode {
  if (!status) return muted('—')
  const tone: Record<string, string> = {
    DRAFT: 'status-gray',
    PROCESSED: 'status-green',
    CANCELLED: 'status-red-muted',
  }
  const labels: Record<string, string> = {
    DRAFT: 'Brouillon',
    PROCESSED: 'Traitée',
    CANCELLED: 'Annulée',
  }
  return (
    <span className={`status-badge ${tone[status] ?? 'status-gray'}`}>
      {labels[status] ?? status}
    </span>
  )
}

function translateTvaStatus(status: string | null): React.ReactNode {
  if (!status) return muted('—')
  const tone: Record<string, string> = {
    DRAFT: 'status-gray',
    SUBMITTED: 'status-blue',
    PAID: 'status-green',
    CANCELLED: 'status-red-muted',
  }
  const labels: Record<string, string> = {
    DRAFT: 'Brouillon',
    SUBMITTED: 'Soumise',
    PAID: 'Payée',
    CANCELLED: 'Annulée',
  }
  return (
    <span className={`status-badge ${tone[status] ?? 'status-gray'}`}>
      {labels[status] ?? status}
    </span>
  )
}

function muted(text: string): React.ReactNode {
  return <span style={{ color: 'var(--color-text-muted)' }}>{text}</span>
}

function numberCell(n: number): React.ReactNode {
  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{n}</span>
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
