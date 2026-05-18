import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LogOut, Plus, Sun, Moon } from 'lucide-react'
import { fetchCategories } from '@/api/categories'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { AddCategoryDialog } from '@/components/categories/AddCategoryDialog'
import { CategoryList } from '@/components/categories/CategoryList'

type CatTab = 'expense' | 'income'

function CategoriesSkeleton() {
  return (
    <div className="ft-cat-grid">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="ft-cat-card" style={{ opacity: 0.5 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--border)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ height: 14, width: 80, background: 'var(--border)', borderRadius: 4 }} />
            <div style={{ height: 11, width: 50, background: 'var(--border)', borderRadius: 4 }} />
          </div>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--border)' }} />
        </div>
      ))}
    </div>
  )
}

export function SettingsPage() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [catTab, setCatTab] = useState<CatTab>('expense')

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const initial = user?.username?.[0]?.toUpperCase() ?? 'U'

  return (
    <div className="ft-page ft-page--narrow">
      <header className="ft-page-head">
        <div>
          <h1 className="ft-h1">Settings</h1>
          <div className="ft-page-sub">Categories &amp; account</div>
        </div>
      </header>

      {/* Categories */}
      <div className="ft-card ft-settings-card">
        <div className="ft-card-head">
          <h2 className="ft-h3">Categories</h2>
          <button className="ft-btn ft-btn-secondary ft-btn-sm" onClick={() => setDialogOpen(true)}>
            <Plus size={14} /> New category
          </button>
        </div>
        <div className="ft-tabs" style={{ marginBottom: 0 }}>
          <button
            className={`ft-tab ${catTab === 'expense' ? 'is-active' : ''}`}
            onClick={() => setCatTab('expense')}
          >
            Expenses
          </button>
          <button
            className={`ft-tab ${catTab === 'income' ? 'is-active' : ''}`}
            onClick={() => setCatTab('income')}
          >
            Income
          </button>
        </div>
        {isLoading ? (
          <CategoriesSkeleton />
        ) : (
          <CategoryList categories={categories ?? []} type={catTab} />
        )}
      </div>

      {/* Appearance */}
      <div className="ft-card ft-settings-card">
        <div className="ft-card-head">
          <h2 className="ft-h3">Appearance</h2>
        </div>
        <div className="ft-settings-row">
          <div>
            <div className="ft-row-title">Theme</div>
            <div className="ft-row-sub">Dark and light modes are both supported.</div>
          </div>
          <div className="ft-theme-segment">
            <button
              className={`ft-segment ${theme === 'light' ? 'is-active' : ''}`}
              onClick={() => theme !== 'light' && toggleTheme()}
            >
              <Sun size={14} /> Light
            </button>
            <button
              className={`ft-segment ${theme === 'dark' ? 'is-active' : ''}`}
              onClick={() => theme !== 'dark' && toggleTheme()}
            >
              <Moon size={14} /> Dark
            </button>
          </div>
        </div>
      </div>

      {/* Account */}
      <div className="ft-card ft-settings-card">
        <div className="ft-card-head">
          <h2 className="ft-h3">Account</h2>
        </div>
        <div className="ft-settings-row">
          <div className="ft-account">
            <div className="ft-avatar ft-avatar--lg">{initial}</div>
            <div>
              <div className="ft-row-title">{user?.username}</div>
              <div className="ft-row-sub">Finance Tracker account</div>
            </div>
          </div>
          <button className="ft-btn ft-btn-destructive ft-btn-sm" onClick={logout}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>

      <AddCategoryDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
