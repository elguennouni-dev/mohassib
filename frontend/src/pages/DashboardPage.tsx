import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getDashboardKpis, type DashboardKpis, type RevenueDataPoint, type RecentInvoiceItem } from '../api/reports'

const MONTH_NAMES_FR = [
  'Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin',
  'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.',
]

export function DashboardPage() {
  const { user } = useAuth()
  const [kpis, setKpis] = useState<DashboardKpis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getDashboardKpis()
      .then((data) => {
        if (!cancelled) setKpis(data)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        if (axios.isAxiosError(err) && !err.response) {
          setError('Le serveur est injoignable. Vérifiez votre connexion.')
        } else {
          setError('Impossible de charger les indicateurs.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <main className="container" style={{ padding: 'var(--space-8) var(--space-5)' }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ marginBottom: 'var(--space-2)' }}>Tableau de bord</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Bonjour{user ? ` ${user.firstName}` : ''}, voici l'aperçu de votre activité.
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading && <p style={{ color: 'var(--color-text-muted)' }}>Chargement des indicateurs...</p>}

        {!loading && kpis && (
          <>
            {/* Top KPI strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-6)',
              }}
            >
              <KpiCard
                label="Chiffre d'affaires du mois"
                value={formatMoneyMAD(kpis.revenueMtd)}
                hint={`YTD : ${formatMoneyMAD(kpis.revenueYtd)}`}
                tone="primary"
              />
              <KpiCard
                label="Factures en retard"
                value={`${kpis.overdueCount}`}
                hint={formatMoneyMAD(kpis.overdueAmount)}
                tone={kpis.overdueCount > 0 ? 'danger' : 'neutral'}
              />
              <KpiCard
                label="En attente de paiement"
                value={`${kpis.outstandingCount}`}
                hint={formatMoneyMAD(kpis.outstandingAmount)}
                tone="neutral"
              />
              <KpiCard
                label={Number(kpis.tvaToPayMonth) < 0 ? 'Crédit de TVA (mois)' : 'TVA à payer (mois)'}
                value={formatMoneyMAD(Math.abs(Number(kpis.tvaToPayMonth)))}
                hint={`Collectée : ${formatMoneyMAD(kpis.tvaCollectedMonth)}`}
                tone={Number(kpis.tvaToPayMonth) < 0 ? 'success' : 'neutral'}
              />
            </div>

            {/* Two-column: chart + recent activity */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: 'var(--space-5)',
                marginBottom: 'var(--space-6)',
              }}
            >
              <RevenueChartCard data={kpis.monthlyRevenue} />
              <RecentInvoicesCard invoices={kpis.recentInvoices} />
            </div>

            {/* Secondary stats */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--space-3)',
              }}
            >
              <SecondaryStat
                label="Masse salariale"
                primary={formatMoneyMAD(kpis.payrollCostYtd)}
                secondary={`Mois : ${formatMoneyMAD(kpis.payrollCostMtd)}`}
              />
              <SecondaryStat
                label="Dépenses YTD (HT)"
                primary={formatMoneyMAD(kpis.expensesBaseYtd)}
                secondary={`TTC : ${formatMoneyMAD(kpis.expensesTotalYtd)}`}
              />
              <SecondaryStat
                label="Clients"
                primary={`${kpis.activeClientsCount}`}
                secondary="actifs"
              />
              <SecondaryStat
                label="Employés"
                primary={`${kpis.activeEmployeesCount}`}
                secondary="actifs"
              />
            </div>
          </>
        )}
      </main>
    </>
  )
}

function KpiCard({
  label,
  value,
  hint,
  tone = 'neutral',
}: {
  label: string
  value: string
  hint?: string
  tone?: 'neutral' | 'primary' | 'success' | 'danger'
}) {
  const toneColor: Record<typeof tone, string> = {
    neutral: 'var(--color-text)',
    primary: 'var(--color-primary)',
    success: 'var(--color-success)',
    danger: 'var(--color-danger)',
  }
  return (
    <div
      style={{
        padding: 'var(--space-5)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-surface)',
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
          fontSize: '1.6rem',
          fontWeight: 700,
          color: toneColor[tone],
          fontVariantNumeric: 'tabular-nums',
          marginBottom: hint ? 'var(--space-1)' : 0,
        }}
      >
        {value}
      </p>
      {hint && (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
          {hint}
        </p>
      )}
    </div>
  )
}

function SecondaryStat({
  label,
  primary,
  secondary,
}: {
  label: string
  primary: string
  secondary: string
}) {
  return (
    <div
      style={{
        padding: 'var(--space-4)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <p
        style={{
          color: 'var(--color-text-muted)',
          fontSize: 'var(--font-size-xs)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: 'var(--space-1)',
        }}
      >
        {label}
      </p>
      <p style={{ fontSize: '1.15rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
        {primary}
      </p>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
        {secondary}
      </p>
    </div>
  )
}

function RevenueChartCard({ data }: { data: RevenueDataPoint[] }) {
  const values = data.map((d) => Number(d.revenue))
  const maxValue = Math.max(1, ...values)
  const total = values.reduce((a, b) => a + b, 0)

  return (
    <div
      style={{
        padding: 'var(--space-5)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 'var(--space-4)',
        }}
      >
        <h2 style={{ marginBottom: 0 }}>Chiffre d'affaires — 12 derniers mois</h2>
        <span
          style={{
            color: 'var(--color-text-muted)',
            fontSize: 'var(--font-size-sm)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          Total : {formatMoneyMAD(total)}
        </span>
      </div>

      {total === 0 ? (
        <p
          style={{
            padding: 'var(--space-6)',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          Aucune facture sur les 12 derniers mois. Les données apparaîtront ici dès la première facture envoyée.
        </p>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 'var(--space-2)',
            height: 200,
            paddingBottom: 'var(--space-4)',
          }}
        >
          {data.map((point) => {
            const value = Number(point.revenue)
            const heightPct = maxValue > 0 ? (value / maxValue) * 100 : 0
            return (
              <div
                key={`${point.year}-${point.month}`}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  height: '100%',
                }}
                title={`${MONTH_NAMES_FR[point.month - 1]} ${point.year} — ${formatMoneyMAD(value)}`}
              >
                <div
                  style={{
                    flex: 1,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'flex-end',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: `${heightPct}%`,
                      minHeight: value > 0 ? 2 : 0,
                      backgroundColor: 'var(--color-primary)',
                      borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                      transition: 'height 0.3s ease',
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {MONTH_NAMES_FR[point.month - 1]}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function RecentInvoicesCard({ invoices }: { invoices: RecentInvoiceItem[] }) {
  return (
    <div
      style={{
        padding: 'var(--space-5)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-4)',
        }}
      >
        <h2 style={{ marginBottom: 0 }}>Activité récente</h2>
        <Link to="/factures" style={{ fontSize: 'var(--font-size-sm)' }}>
          Voir tout
        </Link>
      </div>

      {invoices.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
          Aucune facture pour le moment.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 'var(--space-3)' }}>
          {invoices.map((inv) => (
            <li
              key={inv.id}
              style={{
                paddingBottom: 'var(--space-3)',
                borderBottom: '1px solid var(--color-border-subtle)',
              }}
            >
              <Link
                to={`/factures/${inv.id}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: 'var(--space-3)',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                    {inv.invoiceNumber}
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {inv.clientName} · {formatDate(inv.invoiceDate)}
                  </div>
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    fontVariantNumeric: 'tabular-nums',
                    fontSize: 'var(--font-size-sm)',
                  }}
                >
                  {formatMoneyMAD(inv.totalAmount)}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
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

function formatDate(value: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}
