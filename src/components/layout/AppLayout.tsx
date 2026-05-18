import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sun, Moon, Plus, SlidersHorizontal } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { useTheme } from '@/contexts/ThemeContext'
import { useMobileFilter } from '@/contexts/MobileFilterContext'
import { AddTransactionDialog } from '@/components/transactions/AddTransactionDialog'
import { ToastHost } from '@/components/ui/toast'

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
    <div className={`ft-app ${sidebarCollapsed ? 'is-collapsed' : ''}`}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />

      <main className="ft-main">
        {/* Mobile header — always shows app name + date, not page title */}
        <header className="ft-mheader">
          <div className="ft-mheader-brand">
            <span className="ft-mheader-title">Finance24</span>
            <span className="ft-mheader-date">{todayLabel()}</span>
          </div>
          <div className="ft-mheader-actions">
            {isTransactions && filterOpen ? (
              <button className="ft-icon-btn" onClick={filterOpen} aria-label="Open filters">
                <SlidersHorizontal size={18} />
              </button>
            ) : (
              <button className="ft-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
          </div>
        </header>

        <div className="ft-scroll">
          <Outlet />
        </div>

        {/* Mobile FAB */}
        <button className="ft-fab" onClick={() => setAddOpen(true)} aria-label="Add transaction">
          <Plus size={22} />
        </button>

        <BottomNav />
      </main>

      <AddTransactionDialog open={addOpen} onOpenChange={setAddOpen} />
      <ToastHost />
    </div>
  )
}
