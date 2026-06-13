import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type Notification,
} from '../api/notifications'
import type { Page } from '../api/clients'

const PAGE_SIZE = 20

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function NotificationsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState<Page<Notification> | null>(null)
  const [pageNumber, setPageNumber] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await listNotifications(pageNumber, PAGE_SIZE)
      setPage(result)
    } catch {
      setError('Impossible de charger les notifications.')
    } finally {
      setLoading(false)
    }
  }, [pageNumber])

  useEffect(() => {
    void load()
  }, [load])

  const handleClick = async (item: Notification) => {
    if (!item.read) {
      try {
        await markNotificationAsRead(item.id)
      } catch {
        // ignore
      }
    }
    if (item.link) {
      navigate(item.link)
    } else {
      load()
    }
  }

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsAsRead()
      load()
    } catch {
      // ignore
    }
  }

  const items = page?.items ?? []

  return (
    <main className="container" style={{ padding: 'var(--space-8) var(--space-5)', maxWidth: 880 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-5)',
          gap: 'var(--space-4)',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 style={{ marginBottom: 'var(--space-2)' }}>Notifications</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Rappels TVA, factures en retard, paie a traiter et autres alertes.
          </p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={handleMarkAll}>
          Tout marquer comme lu
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p style={{ color: 'var(--color-text-muted)' }}>Chargement...</p>}

      {!loading && items.length === 0 && (
        <div
          style={{
            padding: 'var(--space-6)',
            border: '1px dashed var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
          }}
        >
          Aucune notification pour le moment.
        </div>
      )}

      {!loading && items.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 'var(--space-3)' }}>
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => handleClick(item)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: 'var(--space-4) var(--space-5)',
                  border: '1px solid var(--color-border)',
                  borderLeft: item.read
                    ? '4px solid var(--color-border)'
                    : '4px solid var(--color-primary)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: item.read ? 'var(--color-surface)' : 'var(--color-surface-2)',
                  cursor: 'pointer',
                  font: 'inherit',
                  color: 'inherit',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  <span style={{ fontWeight: item.read ? 500 : 700 }}>{item.title}</span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    {formatDateTime(item.createdAt)}
                  </span>
                </div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                  {item.message}
                </div>
                {item.link && (
                  <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-xs)' }}>
                    <Link to={item.link} onClick={(e) => e.stopPropagation()}>
                      Ouvrir
                    </Link>
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
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
            Page {page.page + 1} sur {page.totalPages} ({page.totalItems} notifications)
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
  )
}
