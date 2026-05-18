import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, Settings, Wallet, PanelLeft, Sun, Moon, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'

const NAV_ITEMS = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/transactions', icon: ArrowLeftRight,  label: 'Transactions' },
  { to: '/settings',     icon: Settings,        label: 'Settings'     },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const initial = user?.username?.[0]?.toUpperCase() ?? 'U'

  return (
    <aside className={`ft-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="ft-sidebar-top">
        <div className="ft-logo">
          <div className="ft-logo-mark">
            <Wallet size={18} />
          </div>
          {!collapsed && <span className="ft-logo-word">Finance</span>}
        </div>
        {!collapsed && (
          <button className="ft-collapse" onClick={onToggle} aria-label="Collapse sidebar">
            <PanelLeft size={16} />
          </button>
        )}
      </div>

      <nav className="ft-nav">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `ft-nav-item ${isActive ? 'is-active' : ''}`}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="ft-sidebar-bottom">
        <button className="ft-theme-toggle" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          {!collapsed && <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>}
        </button>
        <div className="ft-user">
          <div className="ft-avatar">{initial}</div>
          {!collapsed && (
            <div className="ft-user-meta">
              <div className="ft-user-name">{user?.username}</div>
              <button
                onClick={logout}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--fg-muted)', fontSize: 11, fontFamily: 'inherit' }}
              >
                <LogOut size={11} /> Sign out
              </button>
            </div>
          )}
        </div>
        {collapsed && (
          <button className="ft-collapse" onClick={onToggle} aria-label="Expand sidebar" style={{ margin: '4px auto 0' }}>
            <PanelLeft size={16} style={{ transform: 'rotate(180deg)' }} />
          </button>
        )}
      </div>
    </aside>
  )
}
