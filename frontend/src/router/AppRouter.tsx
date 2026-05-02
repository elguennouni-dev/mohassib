import { Routes, Route } from 'react-router-dom'
import { LandingPage } from '../pages/LandingPage'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { DashboardPage } from '../pages/DashboardPage'
import { CompanyOnboardingPage } from '../pages/CompanyOnboardingPage'
import { CompanyProfilePage } from '../pages/CompanyProfilePage'
import { ClientsListPage } from '../pages/ClientsListPage'
import { ClientFormPage } from '../pages/ClientFormPage'
import { InvoicesListPage } from '../pages/InvoicesListPage'
import { InvoiceFormPage } from '../pages/InvoiceFormPage'
import { InvoiceDetailPage } from '../pages/InvoiceDetailPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ProtectedRoute } from '../auth/ProtectedRoute'
import { RequireCompany } from '../auth/RequireCompany'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/connexion" element={<LoginPage />} />
      <Route path="/inscription" element={<RegisterPage />} />

      <Route
        path="/mon-entreprise/creation"
        element={
          <ProtectedRoute>
            <CompanyOnboardingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mon-entreprise"
        element={
          <ProtectedRoute>
            <RequireCompany>
              <CompanyProfilePage />
            </RequireCompany>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tableau-de-bord"
        element={
          <ProtectedRoute>
            <RequireCompany>
              <DashboardPage />
            </RequireCompany>
          </ProtectedRoute>
        }
      />

      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <RequireCompany>
              <ClientsListPage />
            </RequireCompany>
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients/nouveau"
        element={
          <ProtectedRoute>
            <RequireCompany>
              <ClientFormPage />
            </RequireCompany>
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients/:id"
        element={
          <ProtectedRoute>
            <RequireCompany>
              <ClientFormPage />
            </RequireCompany>
          </ProtectedRoute>
        }
      />

      <Route
        path="/factures"
        element={
          <ProtectedRoute>
            <RequireCompany>
              <InvoicesListPage />
            </RequireCompany>
          </ProtectedRoute>
        }
      />
      <Route
        path="/factures/nouveau"
        element={
          <ProtectedRoute>
            <RequireCompany>
              <InvoiceFormPage />
            </RequireCompany>
          </ProtectedRoute>
        }
      />
      <Route
        path="/factures/:id"
        element={
          <ProtectedRoute>
            <RequireCompany>
              <InvoiceDetailPage />
            </RequireCompany>
          </ProtectedRoute>
        }
      />
      <Route
        path="/factures/:id/modifier"
        element={
          <ProtectedRoute>
            <RequireCompany>
              <InvoiceFormPage />
            </RequireCompany>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
