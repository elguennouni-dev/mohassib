import { useAuth } from '../auth/AuthContext'
import { AppHeader } from '../components/AppHeader'

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <>
      <AppHeader />
      <main className="container" style={{ padding: 'var(--space-8) var(--space-5)' }}>
        <h1 style={{ marginBottom: 'var(--space-3)' }}>Tableau de bord</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
          Bienvenue{user ? `, ${user.firstName}` : ''}. Les indicateurs apparaitront ici une fois les modules connectes.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          <KpiCard label="Chiffre d'affaires (mois)" value="-" />
          <KpiCard label="Factures en retard" value="-" />
          <KpiCard label="Masse salariale (mois)" value="-" />
          <KpiCard label="TVA a payer" value="-" />
        </div>
      </main>
    </>
  )
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: 'var(--space-5)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 'var(--space-2)' }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 700 }}>{value}</p>
    </div>
  )
}
