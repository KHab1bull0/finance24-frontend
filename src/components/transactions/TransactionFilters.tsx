import { Search, ChevronDown } from 'lucide-react'
import type { Category } from '@/api/categories'
import type { TransactionFilters } from '@/api/transactions'

interface Props {
  filters: TransactionFilters
  onChange: (f: TransactionFilters) => void
  categories: Category[]
}

const TYPE_OPTIONS = [
  { value: '' as const,        label: 'All'    },
  { value: 'income' as const,  label: 'Income'  },
  { value: 'expense' as const, label: 'Expense' },
]

export function TransactionFilters({ filters, onChange, categories }: Props) {
  return (
    <div className="ft-filter-bar">
      <div className="ft-tabs">
        {TYPE_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            className={`ft-tab ${(filters.type ?? '') === value ? 'is-active' : ''}`}
            onClick={() => onChange({ ...filters, type: value || undefined })}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="ft-filter-grow">
        <div className="ft-filter-search">
          <Search size={15} />
          <input
            className="ft-filter-input"
            placeholder="Search by note or category"
            value={filters.search ?? ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
          />
        </div>
      </div>

      <div className="ft-filter-cat">
        <select
          className="ft-input ft-select"
          value={filters.categoryId ?? 'all'}
          onChange={(e) => onChange({ ...filters, categoryId: e.target.value === 'all' ? undefined : e.target.value })}
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
        <span className="ft-select-chev"><ChevronDown size={15} /></span>
      </div>
    </div>
  )
}
