import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import {
  fetchNotificationSummary,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type Notification,
  type NotificationSummary,
} from '../api/notifications'

const POLL_INTERVAL_MS = 60_000

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diff = Date.now() - then
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < minute) return 'a l\'instant'
  if (diff < hour) return `il y a ${Math.floor(diff / minute)} min`
  if (diff < day) return `il y a ${Math.floor(diff / hour)} h`
  if (diff < 7 * day) return `il y a ${Math.floor(diff / day)} j`
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function NotificationBell() {
  const [summary, setSummary] = useState<NotificationSummary>({ unreadCount: 0, recent: [] })
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const refresh = useCallback(async () => {
    try {
      const data = await fetchNotificationSummary()
      setSummary(data)
    } catch {
      // Silent: bell is supplemental UI.
    }
  }, [])

  useEffect(() => {
    refresh()
    const id = window.setInterval(refresh, POLL_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [refresh])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleItemClick = async (item: Notification) => {
    setOpen(false)
    if (!item.read) {
      try {
        await markNotificationAsRead(item.id)
      } catch {
        // ignore — non-blocking
      }
    }
    refresh()
    if (item.link) navigate(item.link)
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      refresh()
    } catch {
      // ignore
    }
  }

  return (
    <div ref={containerRef} className="notification-bell-wrapper">
      <button
        type="button"
        className="notification-bell-button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${summary.unreadCount > 0 ? ` (${summary.unreadCount} non lues)` : ''}`}
      >
        <Bell size={18} aria-hidden="true" />
        {summary.unreadCount > 0 && (
          <span className="notification-bell-badge" aria-hidden="true">
            {summary.unreadCount > 9 ? '9+' : summary.unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown" role="dialog" aria-label="Notifications">
          <div className="notification-dropdown-header">
            <span className="notification-dropdown-title">Notifications</span>
            {summary.unreadCount > 0 && (
              <button
                type="button"
                className="notification-dropdown-action"
                onClick={handleMarkAllAsRead}
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          {summary.recent.length === 0 ? (
            <div className="notification-dropdown-empty">Aucune notification.</div>
          ) : (
            <ul className="notification-dropdown-list">
              {summary.recent.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={item.read ? 'notification-item' : 'notification-item notification-item-unread'}
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="notification-item-title">{item.title}</div>
                    <div className="notification-item-message">{item.message}</div>
                    <div className="notification-item-meta">{formatRelative(item.createdAt)}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="notification-dropdown-footer">
            <Link to="/notifications" className="notification-dropdown-link" onClick={() => setOpen(false)}>
              Voir toutes les notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
