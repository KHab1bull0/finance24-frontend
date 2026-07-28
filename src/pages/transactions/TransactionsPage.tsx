import { useState, useEffect } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Plus, RefreshCw } from 'lucide-react'
import { fetchTransactions, type TransactionFilters, type PaginatedTransactions } from '@/api/transactions'
import { fetchCategories } from '@/api/categories'
import { useMobileFilter } from '@/contexts/MobileFilterContext'
import { AddTransactionDialog } from '@/components/transactions/AddTransactionDialog'
import { TransactionFilters as FiltersBar } from '@/components/transactions/TransactionFilters'
import { FilterDrawer } from '@/components/transactions/FilterDrawer'
import { TransactionList } from '@/components/transactions/TransactionList'
import s from './TransactionsPage.module.scss'

function ListSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {[0, 1].map((g) => (
        <div key={g} className={s.dayGroup}>
          <div className={s.dayHead}>
            <div style={{ height: 11, width: 60, background: 'var(--border)', borderRadius: 4 }} />
            <div style={{ height: 12, width: 50, background: 'var(--border)', borderRadius: 4 }} />
          </div>
          <div className={`${s.card} ${s.txList}`}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={s.txRow} style={{ opacity: 0.6 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--border)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ height: 14, width: 100 + g * 20, background: 'var(--border)', borderRadius: 4 }} />
                  <div style={{ height: 12, width: 70, background: 'var(--border)', borderRadius: 4 }} />
                </div>
                <div style={{ height: 14, width: 56, background: 'var(--border)', borderRadius: 4 }} />
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--border)' }} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function TransactionsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [filters, setFilters] = useState<TransactionFilters>({})
  const { setFilterOpen } = useMobileFilter()

  useEffect(() => {
    setFilterOpen(() => setDrawerOpen(true))
    return () => setFilterOpen(null)
  }, [setFilterOpen])

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<PaginatedTransactions>({
    queryKey: ['transactions', filters],
    queryFn: ({ pageParam }) => fetchTransactions(filters, pageParam as number, 20),
    getNextPageParam: (last) => last.hasMore ? last.page + 1 : undefined,
    initialPageParam: 1,
  })

  const transactions = data?.pages.flatMap((p) => p.data) ?? []

  return (
    <div className={s.page}>
      <header className={s.pageHead}>
        <div>
          <h1 className={s.h1}>Transactions</h1>
          <div className={s.pageSub}>
            {transactions.length > 0 ? `${transactions.length} records` : 'Track your income & expenses'}
          </div>
        </div>
        <button className={s.btnPrimary} onClick={() => setDialogOpen(true)}>
          <Plus size={14} /> Add
        </button>
      </header>

      <div className={s.desktopOnly}>
        <FiltersBar filters={filters} onChange={setFilters} categories={categories} />
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onApply={setFilters}
        categories={categories}
      />

      {isError ? (
        <div className={s.emptyCard}>
          <div className={s.emptyTitle}>Failed to load transactions</div>
          <button className={s.btnSecondary} style={{ marginTop: 8 }} onClick={() => refetch()}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      ) : isLoading ? (
        <ListSkeleton />
      ) : (
        <TransactionList
          transactions={transactions}
          hasMore={!!hasNextPage}
          isFetchingMore={isFetchingNextPage}
          onLoadMore={fetchNextPage}
          isFiltered={Object.values(filters).some(Boolean)}
        />
      )}

      <AddTransactionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
