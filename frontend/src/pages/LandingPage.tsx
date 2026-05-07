import { Link } from 'react-router-dom'
import { PublicHeader } from '../components/PublicHeader'

export function LandingPage() {
  return (
    <>
      <PublicHeader />

      <section
        style={{
          padding: 'var(--space-16) 0',
          backgroundColor: 'var(--color-surface)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="container" style={{ maxWidth: 860, textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <h1
            style={{
              marginBottom: 'var(--space-5)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              letterSpacing: '-0.02em',
            }}
          >
            La comptabilité simplifiée pour les PME marocaines
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--space-8)',
              maxWidth: 640,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Mohassib regroupe la facturation, la paie, la TVA et le reporting financier dans une seule application
            pensée pour les entreprises de 10 à 50 employés au Maroc.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/inscription" className="btn btn-primary" style={{ padding: '0 var(--space-6)' }}>
              Commencer gratuitement
            </Link>
            <Link to="/connexion" className="btn btn-secondary">
              J'ai déjà un compte
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: 'var(--space-16) 0' }}>
        <div className="container">
          <h2
            style={{
              textAlign: 'center',
              marginBottom: 'var(--space-10)',
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            }}
          >
            Quatre modules, une seule plateforme
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 'var(--space-6)',
            }}
          >
            <Feature
              title="Facturation"
              description="Créez des factures conformes, calculez la TVA automatiquement, envoyez par email et suivez les paiements."
            />
            <Feature
              title="Paie"
              description="Gérez vos employés, calculez la CNSS et l'IR selon les barèmes marocains, et générez les bulletins de paie en PDF."
            />
            <Feature
              title="TVA"
              description="Suivez la TVA collectée et déductible, générez vos déclarations mensuelles prêtes pour la DGI."
            />
            <Feature
              title="Reporting"
              description="Tableau de bord en temps réel: chiffre d'affaires, factures en retard, masse salariale, TVA à payer."
            />
          </div>
        </div>
      </section>

      <section style={{ padding: 'var(--space-16) 0', backgroundColor: 'var(--color-surface-2)' }}>
        <div className="container">
          <h2
            style={{
              textAlign: 'center',
              marginBottom: 'var(--space-3)',
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            }}
          >
            Tarifs simples
          </h2>
          <p
            style={{
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-10)',
            }}
          >
            Sans engagement, résiliable à tout moment
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--space-6)',
              alignItems: 'stretch',
            }}
          >
            <PriceCard
              name="Gratuit"
              price="0 MAD"
              subtitle="par mois"
              features={['10 factures par mois', 'Module facturation', 'Support email']}
            />
            <PriceCard
              name="Starter"
              price="149 MAD"
              subtitle="par mois"
              features={['Factures illimitées', "Jusqu'à 5 employés", 'Suivi des paiements', 'Support email']}
            />
            <PriceCard
              name="Professional"
              price="299 MAD"
              subtitle="par mois"
              features={[
                'Tout Starter',
                'Paie complète avec CNSS et IR',
                'Déclarations TVA mensuelles',
                'Tableau de bord avancé',
                'Support prioritaire',
              ]}
              highlighted
            />
            <PriceCard
              name="Enterprise"
              price="599 MAD"
              subtitle="par mois"
              features={['Tout Professional', 'Support dédié', 'Employés illimités', 'API personnalisée']}
            />
          </div>
        </div>
      </section>

      <footer
        style={{
          padding: 'var(--space-8) 0',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-6)',
          }}
        >
          <div>
            <strong style={{ fontSize: 'var(--font-size-lg)' }}>Mohassib</strong>
            <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>
              Comptabilité simplifiée pour PME marocaines.
            </p>
          </div>
          <div>
            <strong style={{ fontSize: 'var(--font-size-sm)' }}>Contact</strong>
            <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>
              Email:{' '}
              <a href="mailto:abdlilah.el.guennouni@gmail.com" style={{ color: 'var(--color-primary)' }}>
                abdlilah.el.guennouni@gmail.com
              </a>
              <br />
              WhatsApp:{' '}
              <a href="https://wa.me/212680376294" style={{ color: 'var(--color-primary)' }}>
                +212 680 37 62 94
              </a>
            </p>
          </div>
        </div>
        <div
          className="container"
          style={{
            marginTop: 'var(--space-6)',
            paddingTop: 'var(--space-4)',
            borderTop: '1px solid var(--color-border-subtle)',
            textAlign: 'center',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)',
          }}
        >
          © {new Date().getFullYear()} Mohassib. Tous droits réservés.
        </div>
      </footer>
    </>
  )
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div
      style={{
        padding: 'var(--space-6)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-surface)',
        transition: 'transform var(--transition-fast) ease, box-shadow var(--transition-fast) ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <h3 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--font-size-lg)' }}>{title}</h3>
      <p style={{ color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
        {description}
      </p>
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
        padding: 'var(--space-6)',
        border: highlighted ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-surface)',
        position: 'relative',
        transition: 'transform var(--transition-fast) ease, box-shadow var(--transition-fast) ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {highlighted && (
        <div
          style={{
            position: 'absolute',
            top: -12,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-primary-text)',
            padding: 'var(--space-1) var(--space-3)',
            borderRadius: 'var(--radius-pill)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-semibold)',
            whiteSpace: 'nowrap',
          }}
        >
          Populaire
        </div>
      )}
      <h3 style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--font-size-xl)' }}>{name}</h3>
      <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>
        {price}
      </p>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-5)', fontSize: 'var(--font-size-sm)' }}>
        {subtitle}
      </p>
      <ul style={{ paddingLeft: 'var(--space-5)', margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
        {features.map((f) => (
          <li key={f} style={{ marginBottom: 'var(--space-2)' }}>
            ✓ {f}
          </li>
        ))}
      </ul>
    </div>
  )
}