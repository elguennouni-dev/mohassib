import { useState } from 'react'
import axios from 'axios'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AppHeader } from '../components/AppHeader'
import { CompanyForm } from '../components/CompanyForm'
import { createCompany, emptyCompanyForm, type CompanyFormValues } from '../api/company'

type ApiErrorBody = {
  message?: string
  error?: string
  details?: Array<{ field: string; message: string }>
}

export function CompanyOnboardingPage() {
  const { hasCompany, setCompany, user } = useAuth()
  const navigate = useNavigate()

  const [values, setValues] = useState<CompanyFormValues>(() => ({
    ...emptyCompanyForm,
    email: user?.email ?? '',
  }))
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  if (hasCompany) {
    return <Navigate to="/tableau-de-bord" replace />
  }

  const handleSubmit = async () => {
    setError(null)
    setFieldErrors({})
    setSubmitting(true)
    try {
      const created = await createCompany(values)
      setCompany(created)
      navigate('/tableau-de-bord', { replace: true })
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
          setError("Impossible d'enregistrer l'entreprise. Veuillez reessayer.")
        }
      } else {
        setError("Impossible d'enregistrer l'entreprise. Veuillez reessayer.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <AppHeader />
      <main className="container" style={{ padding: 'var(--space-8) var(--space-5)', maxWidth: 880 }}>
        <h1 style={{ marginBottom: 'var(--space-3)' }}>Configurez votre entreprise</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
          Ces informations apparaitront sur vos factures, bulletins de paie et declarations TVA. Vous pourrez les modifier plus tard.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <CompanyForm
          values={values}
          onChange={setValues}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Enregistrer mon entreprise"
          fieldErrors={fieldErrors}
        />
      </main>
    </>
  )
}
