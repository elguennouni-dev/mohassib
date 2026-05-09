import { useCallback, useEffect, useState, type FormEvent } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import {
  deleteEmployee,
  listEmployees,
  EMPLOYEE_STATUS_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  type Employee,
  type EmployeeStatus,
} from '../api/employees'
import type { Page } from '../api/clients'

const PAGE_SIZE = 20

const STATUS_FILTERS: Array<{ value: '' | EmployeeStatus; label: string }> = [
  { value: '', label: 'Tous les statuts' },
  { value: 'ACTIVE', label: 'Actifs' },
  { value: 'ON_LEAVE', label: 'En congé' },
  { value: 'SUSPENDED', label: 'Suspendus' },
  { value: 'TERMINATED', label: 'Sortis' },
]

export function EmployeesListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState<Page<Employee> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'' | EmployeeStatus>('')
  const [pageNumber, setPageNumber] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await listEmployees({
        search: activeSearch,
        status: statusFilter === '' ? undefined : statusFilter,
        page: pageNumber,
        size: PAGE_SIZE,
      })
      setPage(result)
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && !err.response) {
        setError('Le serveur est injoignable. Vérifiez votre connexion.')
      } else {
        setError('Impossible de charger la liste des employés.')
      }
    } finally {
      setLoading(false)
    }
  }, [activeSearch, statusFilter, pageNumber])

  useEffect(() => {
    void load()
  }, [load])

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    setActiveSearch(searchInput.trim())
    setPageNumber(0)
  }

  const handleClearFilters = () => {
    setSearchInput('')
    setActiveSearch('')
    setStatusFilter('')
    setPageNumber(0)
  }

  const handleDelete = async (employee: Employee) => {
    const confirmed = window.confirm(
      `Supprimer l'employé "${employee.firstName} ${employee.lastName}" ? Cette action est irréversible.`,
    )
    if (!confirmed) return
    try {
      await deleteEmployee(employee.id)
      void load()
    } catch {
      window.alert("Impossible de supprimer l'employé. Veuillez réessayer.")
    }
  }

  const items = page?.items ?? []
  const showingEmpty = !loading && items.length === 0
  const hasFilters = activeSearch !== '' || statusFilter !== ''

  return (
    <>
      <main className="container" style={{ padding: 'var(--space-8) var(--space-5)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-5)',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1 style={{ marginBottom: 'var(--space-2)' }}>Employés</h1>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Gérez votre personnel pour la paie et les bulletins de salaire.
            </p>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/employes/nouveau')}>
            Nouvel employé
          </button>
        </div>

        <form
          onSubmit={handleSearch}
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-5)',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <input
            type="search"
            className="input"
            placeholder="Rechercher par nom, email, CIN ou poste..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ flex: '1 1 240px' }}
          />
          <select
            className="select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as '' | EmployeeStatus)
              setPageNumber(0)
            }}
            style={{ width: 'auto' }}
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary">
            Rechercher
          </button>
          {hasFilters && (
            <button type="button" className="btn btn-secondary" onClick={handleClearFilters}>
              Effacer
            </button>
          )}
        </form>

        {error && <div className="alert alert-error">{error}</div>}

        {loading && <p style={{ color: 'var(--color-text-muted)' }}>Chargement...</p>}

        {showingEmpty && (
          <div
            style={{
              padding: 'var(--space-6)',
              border: '1px dashed var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
            }}
          >
            {hasFilters
              ? 'Aucun employé ne correspond à ces critères.'
              : "Vous n'avez pas encore d'employé. Cliquez sur « Nouvel employé » pour commencer."}
          </div>
        )}

        {!loading && items.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                  <Th>Nom</Th>
                  <Th>Poste</Th>
                  <Th>Type</Th>
                  <Th>CIN</Th>
                  <Th>Embauche</Th>
                  <Th>Statut</Th>
                  <Th align="right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {items.map((e) => (
                  <tr key={e.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <Td>
                      <Link to={`/employes/${e.id}`} style={{ fontWeight: 600 }}>
                        {e.lastName} {e.firstName}
                      </Link>
                      {e.email && (
                        <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                          {e.email}
                        </div>
                      )}
                    </Td>
                    <Td>{e.position ?? '-'}</Td>
                    <Td>{EMPLOYMENT_TYPE_LABELS[e.employmentType]}</Td>
                    <Td>{e.cinNumber ?? '-'}</Td>
                    <Td>{formatDate(e.hireDate)}</Td>
                    <Td>
                      <EmployeeStatusBadge status={e.status} />
                    </Td>
                    <Td align="right">
                      <Link to={`/employes/${e.id}`} style={{ marginRight: 'var(--space-3)' }}>
                        Modifier
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(e)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-danger)',
                          cursor: 'pointer',
                          padding: 0,
                          font: 'inherit',
                        }}
                      >
                        Supprimer
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {page && page.totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 'var(--space-5)',
              gap: 'var(--space-4)',
            }}
          >
            <span style={{ color: 'var(--color-text-muted)' }}>
              Page {page.page + 1} sur {page.totalPages} ({page.totalItems} employés)
            </span>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setPageNumber((p) => Math.max(0, p - 1))}
                disabled={page.page === 0}
              >
                Précédent
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setPageNumber((p) => p + 1)}
                disabled={page.page >= page.totalPages - 1}
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  )
}

export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  const tone: Record<EmployeeStatus, string> = {
    ACTIVE: 'status-green',
    ON_LEAVE: 'status-amber',
    SUSPENDED: 'status-red-muted',
    TERMINATED: 'status-gray',
  }
  return <span className={`status-badge ${tone[status]}`}>{EMPLOYEE_STATUS_LABELS[status]}</span>
}

function formatDate(value: string | null): string {
  if (!value) return '-'
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function Th({ children, align }: { children: React.ReactNode; align?: 'right' }) {
  return (
    <th
      style={{
        padding: 'var(--space-3)',
        fontSize: '0.85rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        color: 'var(--color-text-muted)',
        textAlign: align ?? 'left',
      }}
    >
      {children}
    </th>
  )
}

function Td({ children, align }: { children: React.ReactNode; align?: 'right' }) {
  return (
    <td
      style={{
        padding: 'var(--space-3)',
        textAlign: align ?? 'left',
        verticalAlign: 'top',
      }}
    >
      {children}
    </td>
  )
}
