import { useCallback, useEffect, useState, type FormEvent } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { deleteExpense, listExpenses, type Expense } from '../api/expenses'
import type { Page } from '../api/clients'

const PAGE_SIZE = 20

export function ExpensesListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState<Page<Expense> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [pageNumber, setPageNumber] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await listExpenses({
        search: activeSearch,
        page: pageNumber,
        size: PAGE_SIZE,
      })
      setPage(result)
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && !err.response) {
        setError('Le serveur est injoignable. Vérifiez votre connexion.')
      } else {
        setError('Impossible de charger la liste des dépenses.')
      }
    } finally {
      setLoading(false)
    }
  }, [activeSearch, pageNumber])

  useEffect(() => {
    void load()
  }, [load])

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    setActiveSearch(searchInput.trim())
    setPageNumber(0)
  }

  const handleClear = () => {
    setSearchInput('')
    setActiveSearch('')
    setPageNumber(0)
  }

  const handleDelete = async (expense: Expense) => {
    const label = expense.vendorName ?? expense.description ?? `dépense du ${formatDate(expense.expenseDate)}`
    const confirmed = window.confirm(`Supprimer la dépense "${label}" ? Cette action est irréversible.`)
    if (!confirmed) return
    try {
      await deleteExpense(expense.id)
      void load()
    } catch {
      window.alert('Impossible de supprimer la dépense. Veuillez réessayer.')
    }
  }

  const items = page?.items ?? []
  const showingEmpty = !loading && items.length === 0

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
            <h1 style={{ marginBottom: 'var(--space-2)' }}>Dépenses</h1>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Enregistrez les dépenses avec TVA déductible. Elles alimentent automatiquement la déclaration TVA.
            </p>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/depenses/nouvelle')}>
            Nouvelle dépense
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
            placeholder="Rechercher par fournisseur, catégorie, référence..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ flex: '1 1 240px' }}
          />
          <button type="submit" className="btn btn-primary">
            Rechercher
          </button>
          {activeSearch && (
            <button type="button" className="btn btn-secondary" onClick={handleClear}>
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
            {activeSearch
              ? `Aucune dépense ne correspond à la recherche "${activeSearch}".`
              : "Vous n'avez pas encore enregistré de dépense. Cliquez sur « Nouvelle dépense » pour commencer."}
          </div>
        )}

        {!loading && items.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                  <Th>Date</Th>
                  <Th>Fournisseur</Th>
                  <Th>Catégorie</Th>
                  <Th>Référence</Th>
                  <Th align="right">HT</Th>
                  <Th align="right">TVA</Th>
                  <Th align="right">TTC</Th>
                  <Th align="right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {items.map((e) => (
                  <tr key={e.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <Td>{formatDate(e.expenseDate)}</Td>
                    <Td>
                      <Link to={`/depenses/${e.id}`} style={{ fontWeight: 600 }}>
                        {e.vendorName ?? '—'}
                      </Link>
                    </Td>
                    <Td>{e.category ?? '—'}</Td>
                    <Td>{e.referenceNumber ?? '—'}</Td>
                    <Td align="right">{formatMoneyMAD(e.baseAmount)}</Td>
                    <Td align="right">
                      <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                        {Number(e.tvaRate)}%
                      </span>{' '}
                      {formatMoneyMAD(e.tvaAmount)}
                    </Td>
                    <Td align="right" style={{ fontWeight: 600 }}>
                      {formatMoneyMAD(e.totalAmount)}
                    </Td>
                    <Td align="right">
                      <Link to={`/depenses/${e.id}`} style={{ marginRight: 'var(--space-3)' }}>
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
              Page {page.page + 1} sur {page.totalPages} ({page.totalItems} dépenses)
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

function formatDate(value: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function formatMoneyMAD(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '0,00 MAD'
  const n = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(n)) return '0,00 MAD'
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n) + ' MAD'
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
        verticalAlign: 'top',
        fontVariantNumeric: align === 'right' ? 'tabular-nums' : undefined,
        ...style,
      }}
    >
      {children}
    </td>
  )
}
