import { useCallback, useEffect, useState, type FormEvent } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import {
  formatDateFr,
  formatMoneyMAD,
  listInvoices,
  STATUS_COLORS,
  STATUS_LABELS,
  type InvoiceStatus,
  type InvoiceSummary,
} from '../api/invoices'
import type { Page } from '../api/clients'

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
    <>
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

        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: 'var(--space-6)',
            border: '1px solid var(--color-border)',
          }}
        >
          <form
            onSubmit={handleSearch}
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
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
                Effacer tous les filtres
              </button>
            )}
          </form>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--space-5)' }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto var(--space-4)' }} />
            <p style={{ color: 'var(--color-text-muted)' }}>Chargement des factures...</p>
          </div>
        )}

        {showingEmpty && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="8" y1="13" x2="16" y2="13" />
                <line x1="8" y1="17" x2="16" y2="17" />
              </svg>
            </div>
            <h3 className="empty-state-title">
              {hasFilters ? 'Aucune facture trouvée' : 'Aucune facture'}
            </h3>
            <p className="empty-state-description">
              {hasFilters
                ? 'Aucune facture ne correspond à ces critères.'
                : "Vous n'avez pas encore de facture. Commencez par en créer une."}
            </p>
            {!hasFilters && (
              <div className="empty-state-action">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate('/factures/nouveau')}
                >
                  Nouvelle facture
                </button>
              </div>
            )}
          </div>
        )}

        {!loading && items.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                  <Th>Numéro</Th>
                  <Th>Client</Th>
                  <Th>Date</Th>
                  <Th>Échéance</Th>
                  <Th align="right">Total</Th>
                  <Th>Statut</Th>
                </tr>
              </thead>
              <tbody>
                {items.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => navigate(`/factures/${inv.id}`)}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      cursor: 'pointer',
                      transition: 'background-color var(--transition-fast) ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface-2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <Td>
                      <span style={{ fontWeight: 600 }}>{inv.invoiceNumber}</span>
                    </Td>
                    <Td>{inv.clientName}</Td>
                    <Td>{formatDateFr(inv.invoiceDate)}</Td>
                    <Td>
                      <span
                        style={{
                          color: inv.status === 'OVERDUE' ? 'var(--color-danger)' : undefined,
                          fontWeight: inv.status === 'OVERDUE' ? 500 : undefined,
                        }}
                      >
                        {formatDateFr(inv.dueDate)}
                      </span>
                    </Td>
                    <Td align="right" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                      {formatMoneyMAD(inv.totalAmount)}
                    </Td>
                    <Td>
                      <StatusBadge status={inv.status} />
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
              marginTop: 'var(--space-6)',
              gap: 'var(--space-4)',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
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
    </>
  )
}

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const colors = STATUS_COLORS[status]
  return (
    <span
      className="status-badge"
      style={{
        backgroundColor: colors.bg,
        color: colors.fg,
      }}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

function Th({ children, align }: { children: React.ReactNode; align?: 'right' }) {
  return (
    <th
      style={{
        padding: 'var(--space-3)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 'var(--font-weight-semibold)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--color-text-muted)',
        textAlign: align ?? 'left',
      }}
    >
      {children}
    </th>
  )
}

function Td({
  children,
  align,
  style,
}: {
  children: React.ReactNode
  align?: 'right'
  style?: React.CSSProperties
}) {
  return (
    <td
      style={{
        padding: 'var(--space-3)',
        textAlign: align ?? 'left',
        verticalAlign: 'middle',
        fontSize: 'var(--font-size-sm)',
        ...style,
      }}
    >
      {children}
    </td>
  )
}