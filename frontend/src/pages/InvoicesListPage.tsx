import { useCallback, useEffect, useState, type FormEvent } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { FileText } from 'lucide-react'
import {
  formatDateFr,
  formatMoneyMAD,
  listInvoices,
  type InvoiceStatus,
  type InvoiceSummary,
} from '../api/invoices'
import type { Page } from '../api/clients'
import { EmptyState, StatusBadge, TableSkeleton } from '../components/ui'

const PAGE_SIZE = 20

const STATUS_FILTERS: Array<{ value: '' | InvoiceStatus; label: string }> = [
  { value: '', label: 'Tous les statuts' },
  { value: 'DRAFT', label: 'Brouillons' },
  { value: 'SENT', label: 'Envoyées' },
  { value: 'PAID', label: 'Payées' },
  { value: 'OVERDUE', label: 'En retard' },
  { value: 'CANCELLED', label: 'Annulées' },
]

export function InvoicesListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState<Page<InvoiceSummary> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'' | InvoiceStatus>('')
  const [pageNumber, setPageNumber] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await listInvoices({
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
        setError('Impossible de charger la liste des factures.')
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

  const handleClearAll = () => {
    setSearchInput('')
    setActiveSearch('')
    setStatusFilter('')
    setPageNumber(0)
  }

  const items = page?.items ?? []
  const showingEmpty = !loading && items.length === 0
  const hasFilters = activeSearch !== '' || statusFilter !== ''

  return (
    <main className="container" style={{ padding: 'var(--space-8) var(--space-5)' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 style={{ marginBottom: 'var(--space-2)' }}>Factures</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Créez, envoyez et suivez vos factures.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate('/factures/nouveau')}
        >
          Nouvelle facture
        </button>
      </div>

      <div className="list-toolbar">
        <form onSubmit={handleSearch} className="list-toolbar-form">
          <input
            type="search"
            placeholder="Rechercher par numéro ou client..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input"
            style={{ flex: '1 1 260px' }}
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as '' | InvoiceStatus)
              setPageNumber(0)
            }}
            className="select"
            style={{ flex: '0 0 160px' }}
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
            <button type="button" className="btn btn-secondary" onClick={handleClearAll}>
              Effacer
            </button>
          )}
        </form>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--space-5)' }}>
          {error}
        </div>
      )}

      {loading && <TableSkeleton rows={6} columns={6} />}

      {showingEmpty && (
        <EmptyState
          icon={<FileText size={28} aria-hidden="true" />}
          title={hasFilters ? 'Aucune facture trouvée' : 'Aucune facture'}
          description={
            hasFilters
              ? 'Aucune facture ne correspond à ces critères. Modifiez ou effacez les filtres pour voir plus de résultats.'
              : "Vous n'avez pas encore de facture. Commencez par en créer une."
          }
          action={
            hasFilters ? (
              <button type="button" className="btn btn-secondary" onClick={handleClearAll}>
                Effacer les filtres
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/factures/nouveau')}
              >
                Nouvelle facture
              </button>
            )
          }
        />
      )}

      {!loading && items.length > 0 && (
        <div className="data-table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Client</th>
                <th>Date</th>
                <th>Échéance</th>
                <th className="data-table-right">Total</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {items.map((inv) => (
                <tr key={inv.id} onClick={() => navigate(`/factures/${inv.id}`)}>
                  <td className="data-table-strong">{inv.invoiceNumber}</td>
                  <td>{inv.clientName}</td>
                  <td>{formatDateFr(inv.invoiceDate)}</td>
                  <td className={inv.status === 'OVERDUE' ? 'data-table-overdue' : undefined}>
                    {formatDateFr(inv.dueDate)}
                  </td>
                  <td className="data-table-right data-table-num">
                    {formatMoneyMAD(inv.totalAmount)}
                  </td>
                  <td>
                    <StatusBadge status={inv.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {page && page.totalPages > 1 && (
        <div className="list-pagination">
          <span className="list-pagination-meta">
            Page {page.page + 1} sur {page.totalPages} ({page.totalItems} factures)
          </span>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setPageNumber((p) => Math.max(0, p - 1))}
              disabled={page.page === 0}
            >
              Précédent
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setPageNumber((p) => p + 1)}
              disabled={page.page >= page.totalPages - 1}
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
