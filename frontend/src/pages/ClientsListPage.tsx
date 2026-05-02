import { useCallback, useEffect, useState, type FormEvent } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { deleteClient, listClients, type Client, type Page } from '../api/clients'

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
        setError('Le serveur est injoignable. Verifiez votre connexion.')
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

  const handleDelete = async (client: Client) => {
    if (!window.confirm(`Supprimer le client "${client.name}" ? Cette action est irreversible.`)) {
      return
    }
    try {
      await deleteClient(client.id)
      void load()
    } catch {
      window.alert('Impossible de supprimer le client. Veuillez reessayer.')
    }
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
            <h1 style={{ marginBottom: 'var(--space-2)' }}>Clients</h1>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Gerez la liste des clients que vous facturez.
            </p>
          </div>
          <button type="button" className="btn" onClick={() => navigate('/clients/nouveau')}>
            Nouveau client
          </button>
        </div>

        <form
          onSubmit={handleSearch}
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-5)',
            alignItems: 'center',
          }}
        >
          <input
            type="search"
            placeholder="Rechercher par nom, email ou contact..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              flex: 1,
              padding: 'var(--space-3)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface)',
            }}
          />
          <button type="submit" className="btn">Rechercher</button>
          {activeSearch && (
            <button type="button" className="btn btn-secondary" onClick={handleClearSearch}>
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
              ? `Aucun client ne correspond a la recherche "${activeSearch}".`
              : "Vous n'avez pas encore de client. Cliquez sur « Nouveau client » pour commencer."}
          </div>
        )}

        {!loading && items.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                  <Th>Nom</Th>
                  <Th>Contact</Th>
                  <Th>Email</Th>
                  <Th>Telephone</Th>
                  <Th>ICE</Th>
                  <Th align="right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr
                    key={c.id}
                    style={{ borderBottom: '1px solid var(--color-border)' }}
                  >
                    <Td>
                      <Link to={`/clients/${c.id}`} style={{ fontWeight: 600 }}>
                        {c.name}
                      </Link>
                    </Td>
                    <Td>{c.contactPerson ?? '-'}</Td>
                    <Td>{c.email ?? '-'}</Td>
                    <Td>{c.phone ?? '-'}</Td>
                    <Td>{c.iceNumber ?? '-'}</Td>
                    <Td align="right">
                      <Link to={`/clients/${c.id}`} style={{ marginRight: 'var(--space-3)' }}>
                        Modifier
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(c)}
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
              Page {page.page + 1} sur {page.totalPages} ({page.totalItems} clients)
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
