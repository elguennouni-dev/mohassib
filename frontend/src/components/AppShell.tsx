import type { ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Users,
  BadgeCheck,
  Banknote,
  Receipt,
  Calculator,
  BarChart3,
  Building2,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { NotificationBell } from './NotificationBell'

const navItems = [
  { to: '/tableau-de-bord', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/factures', label: 'Factures', icon: FileText },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/employes', label: 'Employés', icon: BadgeCheck },
  { to: '/paie', label: 'Paie', icon: Banknote },
  { to: '/depenses', label: 'Dépenses', icon: Receipt },
  { to: '/tva', label: 'TVA', icon: Calculator },
  { to: '/rapports', label: 'Rapports', icon: BarChart3 },
  { to: '/mon-entreprise', label: 'Mon entreprise', icon: Building2 },
] as const

export function AppShell({ children }: { children: ReactNode }) {
  const { user, company, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/connexion', { replace: true })
  }

  const initials = user
    ? `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase()
    : '—'

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Link
          to={user ? '/tableau-de-bord' : '/'}
          className="sidebar-brand"
          aria-label="Mohassib — accueil"
        >
          <div className="sidebar-logo" aria-hidden="true">
            M
          </div>
          <span className="sidebar-title">Mohassib</span>
        </Link>

        <nav className="sidebar-nav" aria-label="Navigation principale">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? 'sidebar-link sidebar-link-active' : 'sidebar-link'
                }
              >
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="sidebar-user" title={`${user.firstName} ${user.lastName}`}>
              <div className="user-avatar" aria-hidden="true">
                {initials}
              </div>
              <div className="user-info">
                <div className="user-name">
                  {user.firstName} {user.lastName}
                </div>
                <div className="user-company">{company?.name ?? user.email}</div>
              </div>
            </div>
          )}
          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
            aria-label="Déconnexion"
          >
            <LogOut size={16} aria-hidden="true" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <div className="app-content-wrapper">
        <header className="app-topbar">
          <NotificationBell />
        </header>
        {children}
      </div>
    </div>
  )
}
