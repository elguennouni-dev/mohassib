import type { ChangeEvent } from 'react'
import type { CompanyFormValues } from '../api/company'

type Props = {
  values: CompanyFormValues
  onChange: (values: CompanyFormValues) => void
  onSubmit: () => void
  submitting: boolean
  submitLabel: string
  fieldErrors?: Record<string, string>
}

export function CompanyForm({ values, onChange, onSubmit, submitting, submitLabel, fieldErrors }: Props) {
  const set = (key: keyof CompanyFormValues) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange({ ...values, [key]: e.target.value })
  }

  const fieldError = (key: string) => fieldErrors?.[key]

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <Section title="Informations générales">
        <Row>
          <Field label="Raison sociale" required error={fieldError('name')}>
            <input
              value={values.name}
              onChange={set('name')}
              required
              maxLength={255}
              className="input"
              placeholder="Nom officiel de l'entreprise"
            />
          </Field>
          <Field label="Nom commercial" error={fieldError('tradeName')}>
            <input
              value={values.tradeName}
              onChange={set('tradeName')}
              maxLength={255}
              className="input"
              placeholder="Nom d'usage (optionnel)"
            />
          </Field>
        </Row>
        <Row>
          <Field label="Secteur d'activité" error={fieldError('sector')}>
            <input
              value={values.sector}
              onChange={set('sector')}
              maxLength={100}
              className="input"
              placeholder="ex: Technologie, BTP, Services..."
            />
          </Field>
          <Field label="Nombre d'employés" error={fieldError('employeesCount')}>
            <input
              value={values.employeesCount}
              onChange={set('employeesCount')}
              type="number"
              min={0}
              max={10000}
              className="input"
            />
          </Field>
        </Row>
      </Section>

      <Section title="Identifiants légaux">
        <Row>
          <Field label="ICE (15 chiffres)" required error={fieldError('iceNumber')}>
            <input
              value={values.iceNumber}
              onChange={set('iceNumber')}
              required
              inputMode="numeric"
              pattern="\d{15}"
              maxLength={15}
              className="input"
              placeholder="000000000000000"
            />
          </Field>
          <Field label="Registre du commerce (RC)" required error={fieldError('rcNumber')}>
            <input
              value={values.rcNumber}
              onChange={set('rcNumber')}
              required
              maxLength={50}
              className="input"
              placeholder="Numéro RC"
            />
          </Field>
        </Row>
        <Row>
          <Field label="Numéro CNSS de l'entreprise" required error={fieldError('cnssNumber')}>
            <input
              value={values.cnssNumber}
              onChange={set('cnssNumber')}
              required
              maxLength={50}
              className="input"
              placeholder="Numéro CNSS"
            />
          </Field>
          <Field label="Début de l'exercice fiscal" required error={fieldError('fiscalYearStart')}>
            <select value={values.fiscalYearStart} onChange={set('fiscalYearStart')} className="select">
              <option value="JANUARY">Janvier</option>
              <option value="APRIL">Avril</option>
              <option value="JULY">Juillet</option>
              <option value="OCTOBER">Octobre</option>
            </select>
          </Field>
        </Row>
      </Section>

      <Section title="Adresse et contact">
        <Field label="Adresse" required error={fieldError('address')}>
          <input
            value={values.address}
            onChange={set('address')}
            required
            maxLength={2000}
            className="input"
            placeholder="Adresse complète"
          />
        </Field>
        <Row>
          <Field label="Ville" required error={fieldError('city')}>
            <input
              value={values.city}
              onChange={set('city')}
              required
              maxLength={100}
              className="input"
              placeholder="Ville"
            />
          </Field>
          <Field label="Code postal" error={fieldError('postalCode')}>
            <input
              value={values.postalCode}
              onChange={set('postalCode')}
              maxLength={20}
              className="input"
              placeholder="Code postal"
            />
          </Field>
        </Row>
        <Row>
          <Field label="Téléphone" required error={fieldError('phone')}>
            <input
              value={values.phone}
              onChange={set('phone')}
              required
              maxLength={20}
              className="input"
              placeholder="+212 6XX XX XX XX"
            />
          </Field>
          <Field label="Email" required error={fieldError('email')}>
            <input
              value={values.email}
              onChange={set('email')}
              required
              type="email"
              maxLength={255}
              className="input"
              placeholder="contact@entreprise.com"
            />
          </Field>
        </Row>
        <Field label="Site web" error={fieldError('website')}>
          <input
            value={values.website}
            onChange={set('website')}
            maxLength={255}
            className="input"
            placeholder="https://..."
          />
        </Field>
      </Section>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
          style={{ minWidth: '160px' }}
        >
          {submitting ? 'Enregistrement...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        marginBottom: 'var(--space-6)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <legend
        style={{
          padding: '0 var(--space-3)',
          fontFamily: 'var(--font-sans)',
          fontWeight: 'var(--font-weight-semibold)',
          fontSize: 'var(--font-size-md)',
          color: 'var(--color-text)',
          width: 'auto',
        }}
      >
        {title}
      </legend>
      {children}
    </fieldset>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
      {children}
    </div>
  )
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="field">
      <label className="field-label">
        {label}
        {required && <span className="field-required"> *</span>}
      </label>
      {children}
      {error && <div className="field-error">{error}</div>}
    </div>
  )
}