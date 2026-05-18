import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/transactions', icon: ArrowLeftRight,  label: 'Transactions' },
  { to: '/settings',     icon: Settings,        label: 'Settings'     },
]

export function BottomNav() {
  return (
    <nav className="ft-bottomnav">
      {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `ft-bnav-item ${isActive ? 'is-active' : ''}`}
        >
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
