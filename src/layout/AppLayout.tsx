import { useState } from 'react'
import clsx from 'clsx'
import { Outlet, useLocation } from 'react-router-dom'
import { Sun, Moon, Plus, SlidersHorizontal } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { useTheme } from '@/contexts/ThemeContext'
import { useMobileFilter } from '@/contexts/MobileFilterContext'
import { AddTransactionDialog } from '@/components/transactions/AddTransactionDialog'
import { ToastHost } from '@/components/ui/toast'
import s from './AppLayout.module.scss'

function todayLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
}

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { filterOpen } = useMobileFilter()
  const location = useLocation()
  const isTransactions = location.pathname === '/transactions'

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
            <span className={s.mheaderDate}>{todayLabel()}</span>
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

        <div className={s.scroll}>
          <Outlet />
        </div>

        <button className={s.fab} onClick={() => setAddOpen(true)} aria-label="Add transaction">
          <Plus size={22} />
        </button>

        <BottomNav />
      </main>

      <AddTransactionDialog open={addOpen} onOpenChange={setAddOpen} />
      <ToastHost />
    </div>
  )
}
