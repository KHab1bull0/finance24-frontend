import { useState } from 'react'
import clsx from 'clsx'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Sun, Moon, Plus, SlidersHorizontal } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { useTheme } from '@/contexts/ThemeContext'
import { useMobileFilter } from '@/contexts/MobileFilterContext'
import { formatHeaderDate } from '@/lib/format'
import { ToastHost } from '@/components/ui/toast'
import s from './AppLayout.module.scss'

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { filterOpen } = useMobileFilter()
  const location = useLocation()
  const navigate = useNavigate()
  const isTransactions = location.pathname === '/transactions'
  // /transactions/new and /transactions/:id/edit are the add/edit form itself —
  // offering "add" from there makes no sense.
  const isTransactionForm = location.pathname.startsWith('/transactions/')

  return (
    <div className={clsx(s.app, sidebarCollapsed && s.collapsed)}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />

      <main className={s.main}>
        <header className={s.mheader}>
          <div className={s.mheaderBrand}>
            <span className={s.mheaderTitle}>Finance24</span>
            <span className={s.mheaderDate}>{formatHeaderDate(new Date())}</span>
          </div>
          <div className={s.mheaderActions}>
            {isTransactions && filterOpen ? (
              <button className={s.iconBtn} onClick={filterOpen} aria-label="Open filters">
                <SlidersHorizontal size={18} />
              </button>
            ) : (
              <button className={s.iconBtn} onClick={toggleTheme} aria-label="Toggle theme">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
          </div>
        </header>

        <div className={clsx(s.scroll, isTransactionForm && s.scrollNoFab)}>
          <Outlet />
        </div>

        {/* The FAB is itself tablet-and-below only, so it always routes. */}
        {!isTransactionForm && (
          <button
            className={s.fab}
            onClick={() => navigate('/transactions/new')}
            aria-label="Add transaction"
          >
            <Plus size={22} />
          </button>
        )}

        <BottomNav />
      </main>

      <ToastHost />
    </div>
  )
}
