import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Search, ChevronDown } from 'lucide-react'
import type { Category } from '@/api/categories'
import type { TransactionFilters } from '@/api/transactions'

interface Props {
  open: boolean
  onClose: () => void
  filters: TransactionFilters
  onApply: (f: TransactionFilters) => void
  categories: Category[]
}

const TYPE_OPTIONS = [
  { value: '' as const,        label: 'All'     },
  { value: 'income' as const,  label: 'Income'  },
  { value: 'expense' as const, label: 'Expense' },
]

export function FilterDrawer({ open, onClose, filters, onApply, categories }: Props) {
  const [draft, setDraft] = useState<TransactionFilters>(filters)

  // Sync draft to current filters each time the drawer opens
  useEffect(() => { if (open) setDraft(filters) }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleApply() {
    onApply(draft)
    onClose()
  }

  function handleReset() {
    setDraft({})
  }

  return createPortal(
    <>
      <div
        className={`ft-drawer-overlay${open ? ' is-open' : ''}`}
        onClick={onClose}
      />
      <div className={`ft-drawer${open ? ' is-open' : ''}`}>
        <div className="ft-drawer-head">
          <span className="ft-drawer-title">Filters</span>
          <button className="ft-icon-btn" onClick={onClose} aria-label="Close filters">
            <X size={18} />
          </button>
        </div>

        <div className="ft-drawer-body">
          <div className="ft-field">
            <span className="ft-field-label">Type</span>
            <div className="ft-tabs">
              {TYPE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  className={`ft-tab ${(draft.type ?? '') === value ? 'is-active' : ''}`}
                  onClick={() => setDraft((d) => ({ ...d, type: value || undefined }))}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="ft-field">
            <span className="ft-field-label">Search</span>
            <div className="ft-filter-search" style={{ height: 44 }}>
              <Search size={15} />
              <input
                className="ft-filter-input"
                placeholder="Search by note or category"
                value={draft.search ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, search: e.target.value || undefined }))}
              />
            </div>
          </div>

          <div className="ft-field">
            <span className="ft-field-label">Category</span>
            <div className="ft-input-wrap" style={{ position: 'relative' }}>
              <select
                className="ft-input ft-select"
                value={draft.categoryId ?? 'all'}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    categoryId: e.target.value === 'all' ? undefined : e.target.value,
                  }))
                }
              >
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
              <span className="ft-select-chev">
                <ChevronDown size={15} />
              </span>
            </div>
          </div>
        </div>

        <div className="ft-drawer-footer">
          <button className="ft-btn ft-btn-secondary ft-btn-md" onClick={handleReset}>
            Reset
          </button>
          <button className="ft-btn ft-btn-primary ft-btn-md" onClick={handleApply}>
            <Search size={15} /> Search
          </button>
        </div>
        <div className="ft-drawer-handle" />
      </div>
    </>,
    document.body,
  )
}
