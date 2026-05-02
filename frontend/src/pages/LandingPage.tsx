import { Link } from 'react-router-dom'
import { PublicHeader } from '../components/PublicHeader'

export function LandingPage() {
  return (
    <>
      <PublicHeader />

      <section style={{ padding: 'var(--space-10) 0', backgroundColor: 'var(--color-surface)' }}>
        <div className="container" style={{ maxWidth: 760, textAlign: 'center' }}>
          <h1 style={{ marginBottom: 'var(--space-4)' }}>
            La comptabilite simplifiee pour les PME marocaines
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
            Mohassib regroupe la facturation, la paie, la TVA et le reporting financier dans une seule application
            pensee pour les entreprises de 10 a 50 employes au Maroc.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/inscription" className="btn">
              Commencer gratuitement
            </Link>
            <Link to="/connexion" className="btn btn-secondary">
              J'ai deja un compte
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: 'var(--space-10) 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>Quatre modules, une seule plateforme</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 'var(--space-5)',
            }}
          >
            <Feature
              title="Facturation"
              description="Creez des factures conformes, calculez la TVA automatiquement, envoyez par email et suivez les paiements."
            />
            <Feature
              title="Paie"
              description="Gerez vos employes, calculez la CNSS et l'IR selon les baremes marocains, et generez les bulletins de paie en PDF."
            />
            <Feature
              title="TVA"
              description="Suivez la TVA collectee et deductible, generez vos declarations mensuelles pretes pour la DGI."
            />
            <Feature
              title="Reporting"
              description="Tableau de bord en temps reel: chiffre d'affaires, factures en retard, masse salariale, TVA a payer."
            />
          </div>
        </div>
      </section>

      <section style={{ padding: 'var(--space-10) 0', backgroundColor: 'var(--color-surface)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>Tarifs simples</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 'var(--space-5)',
            }}
          >
            <PriceCard name="Gratuit" price="0 MAD" subtitle="par mois" features={['10 factures par mois', 'Module facturation']} />
            <PriceCard
              name="Starter"
              price="149 MAD"
              subtitle="par mois"
              features={['Factures illimitees', 'Jusqu\'a 5 employes', 'Suivi des paiements']}
            />
            <PriceCard
              name="Professional"
              price="299 MAD"
              subtitle="par mois"
              features={['Tout Starter', 'Paie complete avec CNSS et IR', 'Declarations TVA mensuelles', 'Tableau de bord']}
              highlighted
            />
            <PriceCard
              name="Enterprise"
              price="599 MAD"
              subtitle="par mois"
              features={['Tout Professional', 'Support prioritaire', 'Employes illimites']}
            />
          </div>
        </div>
      </section>

      <footer style={{ padding: 'var(--space-6) 0', borderTop: '1px solid var(--color-border)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <strong>Mohassib</strong>
            <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
              Comptabilite simplifiee pour PME marocaines.
            </p>
          </div>
          <div>
            <strong>Contact</strong>
            <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
              Email: <a href="mailto:abdlilah.el.guennouni@gmail.com">abdlilah.el.guennouni@gmail.com</a>
              <br />
              WhatsApp: +212 680 37 62 94
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div
      style={{
        padding: 'var(--space-5)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <h3 style={{ marginBottom: 'var(--space-3)' }}>{title}</h3>
      <p style={{ color: 'var(--color-text-muted)' }}>{description}</p>
    </div>
  )
}

function PriceCard({
  name,
  price,
  subtitle,
  features,
  highlighted = false,
}: {
  name: string
  price: string
  subtitle: string
  features: string[]
  highlighted?: boolean
}) {
  return (
    <div
      style={{
        padding: 'var(--space-5)',
        border: highlighted ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      <h3 style={{ marginBottom: 'var(--space-2)' }}>{name}</h3>
      <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>{price}</p>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>{subtitle}</p>
      <ul style={{ paddingLeft: 'var(--space-5)', margin: 0, color: 'var(--color-text-muted)' }}>
        {features.map((f) => (
          <li key={f} style={{ marginBottom: 'var(--space-2)' }}>
            {f}
          </li>
        ))}
      </ul>
    </div>
  )
}
