import { useCallback, useEffect, useState, type FormEvent } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
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
  { value: 'SENT', label: 'Envoyees' },
  { value: 'PAID', label: 'Payees' },
  { value: 'OVERDUE', label: 'En retard' },
  { value: 'CANCELLED', label: 'Annulees' },
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
        setError('Le serveur est injoignable. Verifiez votre connexion.')
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

  const handleClearSearch = () => {
    setSearchInput('')
    setActiveSearch('')
    setPageNumber(0)
  }

  const items = page?.items ?? []
  const showingEmpty = !loading && items.length === 0

  return (
    <>
      <AppHeader />
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
            <h1 style={{ marginBottom: 'var(--space-2)' }}>Factures</h1>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Creez, envoyez et suivez vos factures.
            </p>
          </div>
          <button type="button" className="btn" onClick={() => navigate('/factures/nouveau')}>
            Nouvelle facture
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
            placeholder="Rechercher par numero ou client..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              flex: '1 1 240px',
              padding: 'var(--space-3)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface)',
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as '' | InvoiceStatus)
              setPageNumber(0)
            }}
            style={{
              padding: 'var(--space-3)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button type="submit" className="btn">Rechercher</button>
          {(activeSearch || statusFilter) && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                handleClearSearch()
                setStatusFilter('')
              }}
            >
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
            {activeSearch || statusFilter
              ? 'Aucune facture ne correspond a ces criteres.'
              : "Vous n'avez pas encore de facture. Cliquez sur « Nouvelle facture » pour commencer."}
          </div>
        )}

        {!loading && items.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                  <Th>Numero</Th>
                  <Th>Client</Th>
                  <Th>Date</Th>
                  <Th>Echeance</Th>
                  <Th align="right">Total</Th>
                  <Th>Statut</Th>
                </tr>
              </thead>
              <tbody>
                {items.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => navigate(`/factures/${inv.id}`)}
                    style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}
                  >
                    <Td>
                      <span style={{ fontWeight: 600 }}>{inv.invoiceNumber}</span>
                    </Td>
                    <Td>{inv.clientName}</Td>
                    <Td>{formatDateFr(inv.invoiceDate)}</Td>
                    <Td>{formatDateFr(inv.dueDate)}</Td>
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
              marginTop: 'var(--space-5)',
              gap: 'var(--space-4)',
            }}
          >
            <span style={{ color: 'var(--color-text-muted)' }}>
              Page {page.page + 1} sur {page.totalPages} ({page.totalItems} factures)
            </span>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setPageNumber((p) => Math.max(0, p - 1))}
                disabled={page.page === 0}
              >
                Precedent
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

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const colors = STATUS_COLORS[status]
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.85rem',
        fontWeight: 600,
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
        ...style,
      }}
    >
      {children}
    </td>
  )
}
