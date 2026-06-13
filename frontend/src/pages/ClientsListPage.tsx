import { useCallback, useEffect, useState, type FormEvent } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Users } from 'lucide-react'
import { deleteClient, listClients, type Client, type Page } from '../api/clients'
import { EmptyState, TableSkeleton } from '../components/ui'

const PAGE_SIZE = 20

export function ClientsListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState<Page<Client> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [pageNumber, setPageNumber] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await listClients({ search: activeSearch, page: pageNumber, size: PAGE_SIZE })
      setPage(result)
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && !err.response) {
        setError('Le serveur est injoignable. Vérifiez votre connexion.')
      } else {
        setError('Impossible de charger la liste des clients.')
      }
    } finally {
      setLoading(false)
    }
  }, [activeSearch, pageNumber])

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

  const handleDelete = async (e: React.MouseEvent, client: Client) => {
    e.stopPropagation()
    if (!window.confirm(`Supprimer le client "${client.name}" ? Cette action est irréversible.`)) {
      return
    }
    try {
      await deleteClient(client.id)
      void load()
    } catch {
      window.alert('Impossible de supprimer le client. Veuillez réessayer.')
    }
  }

  const items = page?.items ?? []
  const showingEmpty = !loading && items.length === 0
  const hasFilters = activeSearch !== ''

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
          <h1 style={{ marginBottom: 'var(--space-2)' }}>Clients</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Gérez la liste des clients que vous facturez.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/clients/nouveau')}>
          Nouveau client
        </button>
      </div>

      <div className="list-toolbar">
        <form onSubmit={handleSearch} className="list-toolbar-form">
          <input
            type="search"
            placeholder="Rechercher par nom, email ou contact..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input"
            style={{ flex: '1 1 260px' }}
          />
          <button type="submit" className="btn btn-primary">Rechercher</button>
          {hasFilters && (
            <button type="button" className="btn btn-secondary" onClick={handleClearSearch}>
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
          icon={<Users size={28} aria-hidden="true" />}
          title={hasFilters ? 'Aucun client trouvé' : 'Aucun client'}
          description={
            hasFilters
              ? `Aucun client ne correspond à la recherche « ${activeSearch} ».`
              : "Vous n'avez pas encore de client. Commencez par en ajouter un."
          }
          action={
            hasFilters ? (
              <button type="button" className="btn btn-secondary" onClick={handleClearSearch}>
                Effacer la recherche
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/clients/nouveau')}
              >
                Nouveau client
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
                <th>Nom</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>ICE</th>
                <th className="data-table-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} onClick={() => navigate(`/clients/${c.id}`)}>
                  <td className="data-table-strong">{c.name}</td>
                  <td>{c.contactPerson ?? '—'}</td>
                  <td>{c.email ?? '—'}</td>
                  <td>{c.phone ?? '—'}</td>
                  <td>{c.iceNumber ?? '—'}</td>
                  <td className="data-table-right">
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, c)}
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
            Page {page.page + 1} sur {page.totalPages} ({page.totalItems} clients)
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
