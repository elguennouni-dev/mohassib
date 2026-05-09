import { useMemo, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../auth/AuthContext'
import { CompanyForm } from '../components/CompanyForm'
import { companyToForm, updateCompany, type CompanyFormValues } from '../api/company'

type ApiErrorBody = {
  message?: string
  error?: string
  details?: Array<{ field: string; message: string }>
}

export function CompanyProfilePage() {
  const { company, setCompany } = useAuth()

  const initialValues = useMemo<CompanyFormValues>(
    () => (company ? companyToForm(company) : ({} as CompanyFormValues)),
    [company],
  )

  const [values, setValues] = useState<CompanyFormValues>(initialValues)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  if (!company) {
    return null
  }

  const handleSubmit = async () => {
    setError(null)
    setSuccess(null)
    setFieldErrors({})
    setSubmitting(true)
    try {
      const updated = await updateCompany(values)
      setCompany(updated)
      setValues(companyToForm(updated))
      setSuccess('Les informations de l\'entreprise ont ete mises a jour.')
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const body = err.response?.data as ApiErrorBody | undefined
        if (body?.details && body.details.length > 0) {
          const next: Record<string, string> = {}
          body.details.forEach((d) => {
            next[d.field] = d.message
          })
          setFieldErrors(next)
          setError('Veuillez corriger les champs indiques.')
        } else if (body?.message) {
          setError(body.message)
        } else if (!err.response) {
          setError('Le serveur est injoignable. Verifiez votre connexion.')
        } else {
          setError("Impossible de mettre a jour l'entreprise. Veuillez reessayer.")
        }
      } else {
        setError("Impossible de mettre a jour l'entreprise. Veuillez reessayer.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <main className="container" style={{ padding: 'var(--space-8) var(--space-5)', maxWidth: 880 }}>
        <h1 style={{ marginBottom: 'var(--space-3)' }}>Mon entreprise</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
          Modifiez les informations de votre entreprise. Elles apparaissent sur les documents legaux generes par Mohassib.
        </p>

        {success && (
          <div
            className="alert"
            style={{
              backgroundColor: '#e6f5ec',
              border: '1px solid #b7dec6',
              color: 'var(--color-success)',
            }}
          >
            {success}
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        <CompanyForm
          values={values}
          onChange={setValues}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Enregistrer les modifications"
          fieldErrors={fieldErrors}
        />
      </main>
    </>
  )
}
