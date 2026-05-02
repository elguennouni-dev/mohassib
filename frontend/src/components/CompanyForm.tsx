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
      <Section title="Informations generales">
        <Row>
          <Field label="Raison sociale" required error={fieldError('name')}>
            <input value={values.name} onChange={set('name')} required maxLength={255} />
          </Field>
          <Field label="Nom commercial" error={fieldError('tradeName')}>
            <input value={values.tradeName} onChange={set('tradeName')} maxLength={255} />
          </Field>
        </Row>
        <Row>
          <Field label="Secteur d'activite" error={fieldError('sector')}>
            <input value={values.sector} onChange={set('sector')} maxLength={100} />
          </Field>
          <Field label="Nombre d'employes" error={fieldError('employeesCount')}>
            <input
              value={values.employeesCount}
              onChange={set('employeesCount')}
              type="number"
              min={0}
              max={10000}
            />
          </Field>
        </Row>
      </Section>

      <Section title="Identifiants legaux">
        <Row>
          <Field label="ICE (15 chiffres)" required error={fieldError('iceNumber')}>
            <input
              value={values.iceNumber}
              onChange={set('iceNumber')}
              required
              inputMode="numeric"
              pattern="\d{15}"
              maxLength={15}
              placeholder="000000000000000"
            />
          </Field>
          <Field label="Registre du commerce (RC)" required error={fieldError('rcNumber')}>
            <input value={values.rcNumber} onChange={set('rcNumber')} required maxLength={50} />
          </Field>
        </Row>
        <Row>
          <Field label="Numero CNSS de l'entreprise" required error={fieldError('cnssNumber')}>
            <input value={values.cnssNumber} onChange={set('cnssNumber')} required maxLength={50} />
          </Field>
          <Field label="Debut de l'exercice fiscal" required error={fieldError('fiscalYearStart')}>
            <select value={values.fiscalYearStart} onChange={set('fiscalYearStart')}>
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
          <input value={values.address} onChange={set('address')} required maxLength={2000} />
        </Field>
        <Row>
          <Field label="Ville" required error={fieldError('city')}>
            <input value={values.city} onChange={set('city')} required maxLength={100} />
          </Field>
          <Field label="Code postal" error={fieldError('postalCode')}>
            <input value={values.postalCode} onChange={set('postalCode')} maxLength={20} />
          </Field>
        </Row>
        <Row>
          <Field label="Telephone" required error={fieldError('phone')}>
            <input
              value={values.phone}
              onChange={set('phone')}
              required
              maxLength={20}
              placeholder="+212 6XX XX XX XX"
            />
          </Field>
          <Field label="Email" required error={fieldError('email')}>
            <input value={values.email} onChange={set('email')} required type="email" maxLength={255} />
          </Field>
        </Row>
        <Field label="Site web" error={fieldError('website')}>
          <input value={values.website} onChange={set('website')} maxLength={255} placeholder="https://..." />
        </Field>
      </Section>

      <button type="submit" className="btn" disabled={submitting} style={{ marginTop: 'var(--space-4)' }}>
        {submitting ? 'Enregistrement...' : submitLabel}
      </button>
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
        marginBottom: 'var(--space-5)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <legend
        style={{
          padding: '0 var(--space-2)',
          fontFamily: 'var(--font-serif)',
          fontWeight: 700,
          fontSize: '1.1rem',
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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
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
      <label>
        {label}
        {required && <span style={{ color: 'var(--color-danger)' }}> *</span>}
      </label>
      {children}
      {error && <span style={{ color: 'var(--color-danger)', fontSize: '0.85rem' }}>{error}</span>}
    </div>
  )
}
