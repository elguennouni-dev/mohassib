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
            Comment ça marche
          </h2>
          <p
            style={{
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-10)',
            }}
          >
            En quatre étapes, votre comptabilité est en place.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 'var(--space-6)',
            }}
          >
            <Step
              number={1}
              title="Créez votre compte"
              description="Inscription gratuite en moins d'une minute, par email."
            />
            <Step
              number={2}
              title="Configurez votre entreprise"
              description="Renseignez ICE, RC, CNSS et coordonnées. Ces informations apparaîtront sur vos factures et bulletins."
            />
            <Step
              number={3}
              title="Émettez vos premières factures"
              description="Ajoutez vos clients, créez une facture, calculez la TVA et envoyez-la par email en un clic."
            />
            <Step
              number={4}
              title="Pilotez votre activité"
              description="Tableau de bord en temps réel, paie automatique, déclarations TVA mensuelles prêtes pour la DGI."
            />
          </div>
        </div>
      </section>

      <section style={{ padding: 'var(--space-16) 0' }}>
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

      <section style={{ padding: 'var(--space-16) 0', backgroundColor: 'var(--color-surface-2)' }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <h2
            style={{
              textAlign: 'center',
              marginBottom: 'var(--space-3)',
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            }}
          >
            Questions fréquentes
          </h2>
          <p
            style={{
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-10)',
            }}
          >
            Tout ce que vous devez savoir avant de commencer.
          </p>
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            <FaqItem
              question="Mes factures sont-elles conformes à la réglementation marocaine ?"
              answer="Oui. Chaque facture inclut votre ICE, RC, CNSS, le détail HT/TVA/TTC par taux (20%, 10%, 7%, 0%) et la mention légale obligatoire."
            />
            <FaqItem
              question="Comment fonctionne le calcul de la paie ?"
              answer="Mohassib calcule automatiquement la cotisation CNSS (4,48% plafonnée à 6 000 MAD) et l'IR selon les barèmes progressifs marocains. Les barèmes sont configurables si la DGI les met à jour."
            />
            <FaqItem
              question="Puis-je télécharger les déclarations TVA pour les soumettre à la DGI ?"
              answer="Oui. Chaque déclaration mensuelle est exportable en PDF, prête à être vérifiée puis soumise à la DGI."
            />
            <FaqItem
              question="Mes données sont-elles sécurisées ?"
              answer="Toutes les communications passent en HTTPS, les mots de passe sont chiffrés (BCrypt) et chaque entreprise n'a accès qu'à ses propres données. Une sauvegarde quotidienne de la base est effectuée."
            />
            <FaqItem
              question="Y a-t-il un engagement de durée ?"
              answer="Non. Vous pouvez résilier votre abonnement à tout moment, sans pénalité. Vos données restent exportables même après résiliation."
            />
            <FaqItem
              question="Puis-je essayer avant de payer ?"
              answer="Oui. Le plan Gratuit permet d'émettre jusqu'à 10 factures par mois sans frais et sans carte bancaire. Vous pouvez basculer vers un plan payant quand vous êtes prêt."
            />
            <FaqItem
              question="Comment obtenir de l'aide ?"
              answer="Notre support répond par email ou WhatsApp dans un délai de 4 heures ouvrées. Le support prioritaire est inclus dans les plans Professional et Enterprise."
            />
          </div>
        </div>
      </section>

      <section style={{ padding: 'var(--space-16) 0' }}>
        <div className="container" style={{ maxWidth: 720, textAlign: 'center' }}>
          <h2
            style={{
              marginBottom: 'var(--space-3)',
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            }}
          >
            Une question ? Parlons-en.
          </h2>
          <p
            style={{
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-6)',
            }}
          >
            Écrivez-nous par email ou contactez-nous directement sur WhatsApp.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="mailto:abdlilah.el.guennouni@gmail.com?subject=Demande%20d%27information%20Mohassib"
              className="btn btn-primary"
            >
              Envoyer un email
            </a>
            <a
              href="https://wa.me/212680376294"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              Contacter sur WhatsApp
            </a>
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

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div
      style={{
        padding: 'var(--space-6)',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary-light)',
          color: 'var(--color-primary)',
          fontWeight: 700,
          fontSize: 'var(--font-size-lg)',
          marginBottom: 'var(--space-3)',
        }}
      >
        {number}
      </div>
      <h3 style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--font-size-lg)' }}>{title}</h3>
      <p
        style={{
          color: 'var(--color-text-secondary)',
          lineHeight: 'var(--line-height-relaxed)',
          fontSize: 'var(--font-size-sm)',
        }}
      >
        {description}
      </p>
    </div>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4) var(--space-5)',
      }}
    >
      <summary
        style={{
          fontWeight: 600,
          cursor: 'pointer',
          fontSize: 'var(--font-size-base)',
          listStyle: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}
      >
        <span>{question}</span>
        <span aria-hidden="true" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-lg)' }}>
          +
        </span>
      </summary>
      <p
        style={{
          marginTop: 'var(--space-3)',
          color: 'var(--color-text-secondary)',
          lineHeight: 'var(--line-height-relaxed)',
          fontSize: 'var(--font-size-sm)',
        }}
      >
        {answer}
      </p>
    </details>
  )
}