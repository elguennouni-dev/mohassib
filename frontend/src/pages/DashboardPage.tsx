import { useEffect, useState, type ReactNode } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Calculator,
  Clock3,
  FilePlus2,
  FileText,
  Receipt,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import {
  getDashboardKpis,
  type DashboardKpis,
  type RecentInvoiceItem,
  type RevenueDataPoint,
} from '../api/reports'
import { StatusBadge } from '../components/ui/StatusBadge'

const MONTH_NAMES_FR = [
  'Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin',
  'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.',
]

const FULL_MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
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

  const now = new Date()
  const periodLabel = `${FULL_MONTHS_FR[now.getMonth()]} ${now.getFullYear()}`

  return (
    <main className="container" style={{ padding: 'var(--space-8) var(--space-5)' }}>
      <DashboardHero firstName={user?.firstName ?? null} periodLabel={periodLabel} />

      {error && <div className="alert alert-error" style={{ marginBottom: 'var(--space-5)' }}>{error}</div>}

      {loading && <KpiSkeletonGrid />}

      {!loading && kpis && (
        <>
          <KpiGrid kpis={kpis} />

          <div className="dashboard-main-row">
            <RevenueChartCard data={kpis.monthlyRevenue} />
            <ActionItemsCard kpis={kpis} />
          </div>

          <div className="dashboard-main-row">
            <RecentInvoicesCard invoices={kpis.recentInvoices} />
            <SecondaryStatsCard kpis={kpis} />
          </div>

          <QuickActionsRow />
        </>
      )}
    </main>
  )
}

/* ------------------------------------------------------------------ hero */

function DashboardHero({ firstName, periodLabel }: { firstName: string | null; periodLabel: string }) {
  return (
    <div className="dashboard-hero">
      <div>
        <h1 style={{ marginBottom: 'var(--space-2)' }}>
          Bonjour{firstName ? ` ${firstName}` : ''}
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Aperçu de votre activité pour <strong>{periodLabel}</strong>.
        </p>
      </div>
      <div className="dashboard-hero-actions">
        <Link to="/factures/nouveau" className="btn btn-primary">
          <FilePlus2 size={16} aria-hidden="true" />
          <span>Nouvelle facture</span>
        </Link>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------- KPI section */

function KpiGrid({ kpis }: { kpis: DashboardKpis }) {
  const trend = computeMonthOverMonthTrend(kpis.monthlyRevenue)
  const tvaIsCredit = Number(kpis.tvaToPayMonth) < 0
  const tvaAbs = Math.abs(Number(kpis.tvaToPayMonth || 0))

  return (
    <div className="dashboard-kpi-grid">
      <KpiCard
        icon={<TrendingUp size={18} aria-hidden="true" />}
        label="Chiffre d'affaires du mois"
        value={formatMoneyMAD(kpis.revenueMtd)}
        hint={`Année : ${formatMoneyMAD(kpis.revenueYtd)}`}
        tone="primary"
        trend={trend}
        sparkline={kpis.monthlyRevenue}
      />
      <KpiCard
        icon={<AlertTriangle size={18} aria-hidden="true" />}
        label="Factures en retard"
        value={String(kpis.overdueCount)}
        hint={formatMoneyMAD(kpis.overdueAmount)}
        tone={kpis.overdueCount > 0 ? 'danger' : 'neutral'}
      />
      <KpiCard
        icon={<Clock3 size={18} aria-hidden="true" />}
        label="En attente de paiement"
        value={String(kpis.outstandingCount)}
        hint={formatMoneyMAD(kpis.outstandingAmount)}
        tone="neutral"
      />
      <KpiCard
        icon={<Calculator size={18} aria-hidden="true" />}
        label={tvaIsCredit ? 'Crédit de TVA (mois)' : 'TVA à payer (mois)'}
        value={formatMoneyMAD(tvaAbs)}
        hint={`Collectée : ${formatMoneyMAD(kpis.tvaCollectedMonth)}`}
        tone={tvaIsCredit ? 'success' : 'neutral'}
      />
    </div>
  )
}

type KpiTone = 'neutral' | 'primary' | 'success' | 'danger'

type TrendInfo = { direction: 'up' | 'down' | 'flat'; percent: number }

function KpiCard({
  icon,
  label,
  value,
  hint,
  tone,
  trend,
  sparkline,
}: {
  icon: ReactNode
  label: string
  value: string
  hint?: string
  tone: KpiTone
  trend?: TrendInfo | null
  sparkline?: RevenueDataPoint[]
}) {
  return (
    <div className={`kpi-card kpi-card-${tone}`}>
      <div className="kpi-card-header">
        <span className="kpi-card-icon" aria-hidden="true">{icon}</span>
        <span className="kpi-card-label">{label}</span>
      </div>
      <div className="kpi-card-value">{value}</div>
      <div className="kpi-card-footer">
        {hint && <span className="kpi-card-hint">{hint}</span>}
        {trend && trend.direction !== 'flat' && (
          <span className={`kpi-card-trend kpi-card-trend-${trend.direction === 'up' ? 'pos' : 'neg'}`}>
            {trend.direction === 'up'
              ? <ArrowUpRight size={14} aria-hidden="true" />
              : <ArrowDownRight size={14} aria-hidden="true" />}
            {Math.abs(trend.percent).toFixed(0)}%
          </span>
        )}
      </div>
      {sparkline && sparkline.length > 1 && <Sparkline data={sparkline} />}
    </div>
  )
}

function Sparkline({ data }: { data: RevenueDataPoint[] }) {
  const values = data.map((d) => Number(d.revenue))
  const max = Math.max(1, ...values)
  const min = Math.min(0, ...values)
  const range = Math.max(1, max - min)
  const width = 100
  const height = 28
  const stepX = values.length > 1 ? width / (values.length - 1) : 0
  const points = values
    .map((v, i) => {
      const x = i * stepX
      const y = height - ((v - min) / range) * height
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')
  return (
    <svg
      className="kpi-card-sparkline"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

function KpiSkeletonGrid() {
  return (
    <div className="dashboard-kpi-grid" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="kpi-card kpi-card-neutral">
          <div className="kpi-card-header">
            <span className="skeleton skeleton-icon" />
            <span className="skeleton skeleton-text-sm" />
          </div>
          <div className="skeleton skeleton-text-xl" />
          <div className="skeleton skeleton-text-sm" />
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------- revenue chart */

function RevenueChartCard({ data }: { data: RevenueDataPoint[] }) {
  const values = data.map((d) => Number(d.revenue))
  const max = Math.max(...values, 0)
  const niceMax = niceCeiling(max)
  const total = values.reduce((a, b) => a + b, 0)

  return (
    <section className="dashboard-card">
      <div className="card-header">
        <h2 style={{ marginBottom: 0 }}>Chiffre d'affaires — 12 derniers mois</h2>
        <span className="card-header-meta">Total : {formatMoneyMAD(total)}</span>
      </div>

      {total === 0 ? (
        <EmptyBlock message="Aucune facture sur les 12 derniers mois. Les données apparaîtront ici dès la première facture envoyée." />
      ) : (
        <BarChart data={data} niceMax={niceMax} />
      )}
    </section>
  )
}

function BarChart({ data, niceMax }: { data: RevenueDataPoint[]; niceMax: number }) {
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((p) => p * niceMax)

  return (
    <div className="bar-chart-wrapper">
      <div className="bar-chart-y-axis">
        {[...gridLines].reverse().map((v) => (
          <span key={v} className="bar-chart-y-label">{formatCompactMAD(v)}</span>
        ))}
      </div>
      <div className="bar-chart-body">
        <div className="bar-chart-gridlines" aria-hidden="true">
          {gridLines.map((v) => <span key={v} />)}
        </div>
        <div className="bar-chart-bars">
          {data.map((point) => {
            const value = Number(point.revenue)
            const heightPct = niceMax > 0 ? (value / niceMax) * 100 : 0
            const tooltip = `${MONTH_NAMES_FR[point.month - 1]} ${point.year} — ${formatMoneyMAD(value)}`
            return (
              <div key={`${point.year}-${point.month}`} className="bar-chart-col" title={tooltip}>
                <div className="bar-chart-bar-track">
                  <div
                    className="bar-chart-bar-fill"
                    style={{ height: `${heightPct}%`, minHeight: value > 0 ? 2 : 0 }}
                  />
                </div>
                <span className="bar-chart-x-label">{MONTH_NAMES_FR[point.month - 1]}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------- action items */

type ActionItem = {
  key: string
  icon: ReactNode
  title: string
  description: string
  link: string
  tone: 'neutral' | 'warning' | 'danger' | 'success'
}

function buildActionItems(kpis: DashboardKpis): ActionItem[] {
  const items: ActionItem[] = []
  const tvaToPay = Number(kpis.tvaToPayMonth || 0)

  if (kpis.overdueCount > 0) {
    items.push({
      key: 'overdue',
      icon: <AlertTriangle size={16} aria-hidden="true" />,
      title: kpis.overdueCount === 1
        ? '1 facture en retard'
        : `${kpis.overdueCount} factures en retard`,
      description: `${formatMoneyMAD(kpis.overdueAmount)} à recouvrer.`,
      link: '/factures',
      tone: 'danger',
    })
  }
  if (kpis.outstandingCount > 0 && kpis.outstandingCount !== kpis.overdueCount) {
    const open = kpis.outstandingCount - kpis.overdueCount
    items.push({
      key: 'outstanding',
      icon: <Clock3 size={16} aria-hidden="true" />,
      title: open === 1 ? '1 facture en attente' : `${open} factures en attente`,
      description: 'Suivez les paiements en cours.',
      link: '/factures',
      tone: 'warning',
    })
  }
  if (tvaToPay > 0) {
    items.push({
      key: 'tva',
      icon: <Calculator size={16} aria-hidden="true" />,
      title: 'TVA à déclarer',
      description: `${formatMoneyMAD(tvaToPay)} à régler pour le mois.`,
      link: '/tva',
      tone: 'warning',
    })
  }
  if (tvaToPay < 0) {
    items.push({
      key: 'tva-credit',
      icon: <Calculator size={16} aria-hidden="true" />,
      title: 'Crédit de TVA',
      description: `${formatMoneyMAD(Math.abs(tvaToPay))} reportable.`,
      link: '/tva',
      tone: 'success',
    })
  }
  if (Number(kpis.revenueMtd) === 0) {
    items.push({
      key: 'no-revenue',
      icon: <FilePlus2 size={16} aria-hidden="true" />,
      title: 'Aucune facture ce mois-ci',
      description: 'Créez votre première facture du mois.',
      link: '/factures/nouveau',
      tone: 'neutral',
    })
  }
  return items
}

function ActionItemsCard({ kpis }: { kpis: DashboardKpis }) {
  const items = buildActionItems(kpis)
  return (
    <section className="dashboard-card">
      <div className="card-header">
        <h2 style={{ marginBottom: 0 }}>À faire</h2>
        <Link to="/notifications" className="card-header-link">Voir notifications</Link>
      </div>

      {items.length === 0 ? (
        <EmptyBlock message="Rien d'urgent. Tout est à jour pour le moment." />
      ) : (
        <ul className="action-list">
          {items.map((item) => (
            <li key={item.key}>
              <Link to={item.link} className={`action-item action-item-${item.tone}`}>
                <span className="action-item-icon" aria-hidden="true">{item.icon}</span>
                <span className="action-item-body">
                  <span className="action-item-title">{item.title}</span>
                  <span className="action-item-desc">{item.description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/* -------------------------------------------------------- recent invoices */

function RecentInvoicesCard({ invoices }: { invoices: RecentInvoiceItem[] }) {
  return (
    <section className="dashboard-card">
      <div className="card-header">
        <h2 style={{ marginBottom: 0 }}>Activité récente</h2>
        <Link to="/factures" className="card-header-link">Voir tout</Link>
      </div>

      {invoices.length === 0 ? (
        <EmptyBlock message="Aucune facture pour le moment." />
      ) : (
        <ul className="recent-list">
          {invoices.map((inv) => (
            <li key={inv.id}>
              <Link to={`/factures/${inv.id}`} className="recent-item">
                <div className="recent-item-primary">
                  <span className="recent-item-number">{inv.invoiceNumber}</span>
                  <span className="recent-item-meta">
                    {inv.clientName} · {formatDate(inv.invoiceDate)}
                  </span>
                </div>
                <div className="recent-item-secondary">
                  <StatusBadge status={inv.status} />
                  <span className="recent-item-amount">{formatMoneyMAD(inv.totalAmount)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/* ------------------------------------------------------ secondary stats */

function SecondaryStatsCard({ kpis }: { kpis: DashboardKpis }) {
  const stats = [
    {
      icon: <Banknote size={16} aria-hidden="true" />,
      label: 'Masse salariale',
      primary: formatMoneyMAD(kpis.payrollCostYtd),
      secondary: `Mois : ${formatMoneyMAD(kpis.payrollCostMtd)}`,
    },
    {
      icon: <Receipt size={16} aria-hidden="true" />,
      label: 'Dépenses HT (année)',
      primary: formatMoneyMAD(kpis.expensesBaseYtd),
      secondary: `TTC : ${formatMoneyMAD(kpis.expensesTotalYtd)}`,
    },
    {
      icon: <Users size={16} aria-hidden="true" />,
      label: 'Clients',
      primary: String(kpis.activeClientsCount),
      secondary: 'actifs',
    },
    {
      icon: <Wallet size={16} aria-hidden="true" />,
      label: 'Employés',
      primary: String(kpis.activeEmployeesCount),
      secondary: 'actifs',
    },
  ]
  return (
    <section className="dashboard-card">
      <div className="card-header">
        <h2 style={{ marginBottom: 0 }}>Indicateurs secondaires</h2>
      </div>
      <div className="secondary-stat-grid">
        {stats.map((s) => (
          <div key={s.label} className="secondary-stat">
            <span className="secondary-stat-icon" aria-hidden="true">{s.icon}</span>
            <div>
              <span className="secondary-stat-label">{s.label}</span>
              <span className="secondary-stat-value">{s.primary}</span>
              <span className="secondary-stat-meta">{s.secondary}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* --------------------------------------------------------- quick actions */

function QuickActionsRow() {
  const actions = [
    { to: '/factures/nouveau', label: 'Nouvelle facture', icon: <FileText size={16} aria-hidden="true" /> },
    { to: '/clients/nouveau', label: 'Nouveau client', icon: <UserPlus size={16} aria-hidden="true" /> },
    { to: '/depenses/nouvelle', label: 'Nouvelle dépense', icon: <Receipt size={16} aria-hidden="true" /> },
    { to: '/paie', label: 'Préparer la paie', icon: <Banknote size={16} aria-hidden="true" /> },
  ]
  return (
    <section className="quick-actions-row" aria-label="Actions rapides">
      {actions.map((a) => (
        <Link key={a.to} to={a.to} className="quick-action">
          <span className="quick-action-icon" aria-hidden="true">{a.icon}</span>
          <span>{a.label}</span>
        </Link>
      ))}
    </section>
  )
}

/* ------------------------------------------------------------- helpers */

function EmptyBlock({ message }: { message: string }) {
  return <p className="card-empty">{message}</p>
}

function computeMonthOverMonthTrend(data: RevenueDataPoint[]): TrendInfo | null {
  if (data.length < 2) return null
  const sorted = [...data]
  const current = Number(sorted[sorted.length - 1].revenue)
  const previous = Number(sorted[sorted.length - 2].revenue)
  if (previous <= 0) {
    if (current > 0) return { direction: 'up', percent: 100 }
    return null
  }
  const change = ((current - previous) / previous) * 100
  if (Math.abs(change) < 0.5) return { direction: 'flat', percent: 0 }
  return { direction: change >= 0 ? 'up' : 'down', percent: change }
}

function niceCeiling(value: number): number {
  if (value <= 0) return 1
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)))
  const ratio = value / magnitude
  const nice = ratio <= 1 ? 1 : ratio <= 2 ? 2 : ratio <= 5 ? 5 : 10
  return nice * magnitude
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

function formatCompactMAD(value: number): string {
  if (!Number.isFinite(value) || value === 0) return '0'
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.', ',')} M`
  if (value >= 1_000) return `${Math.round(value / 1_000)} k`
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value)
}

function formatDate(value: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

