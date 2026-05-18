import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, Wallet, RefreshCw } from 'lucide-react'
import { fetchDashboard } from '@/api/stats'
import { StatCard, StatCardSkeleton } from '@/components/dashboard/StatCard'
import { MonthlyBarChart, MonthlyBarChartSkeleton } from '@/components/dashboard/MonthlyBarChart'
import { CategoryDonutChart, CategoryDonutChartSkeleton } from '@/components/dashboard/CategoryDonutChart'
import { RecentTransactions, RecentTransactionsSkeleton } from '@/components/dashboard/RecentTransactions'

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  })

  if (isError) {
    return (
      <div className="ft-page" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="ft-empty">
          <div className="ft-empty-glyph">
            <span style={{ fontSize: 24 }}>⚠️</span>
          </div>
          <div className="ft-empty-t">Failed to load dashboard</div>
          <div className="ft-empty-s">Check your connection or try again</div>
          <button className="ft-btn ft-btn-secondary ft-btn-sm" style={{ marginTop: 8, gap: 6 }} onClick={() => refetch()}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    )
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="ft-page">
      {/* Header: desktop only — mobile shows app name+date in AppLayout's ft-mheader */}
      <header className="ft-page-head ft-desktop-only">
        <div>
          <h1 className="ft-h1">Dashboard</h1>
          <div className="ft-page-sub">{today}</div>
        </div>
      </header>

      <section className="ft-stat-grid">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard title="Total Balance" value={data!.totalBalance} icon={Wallet}      tone="brand"   />
            <StatCard title="Total Income"  value={data!.totalIncome}  icon={TrendingUp}  tone="success" />
            <StatCard title="Total Expense" value={data!.totalExpense} icon={TrendingDown} tone="danger"  />
          </>
        )}
      </section>

      <section className="ft-chart-grid">
        {isLoading ? (
          <>
            <CategoryDonutChartSkeleton />
            <MonthlyBarChartSkeleton />
          </>
        ) : (
          <>
            <CategoryDonutChart data={data!.categoryBreakdown} />
            <MonthlyBarChart data={data!.monthlyChart} />
          </>
        )}
      </section>

      {isLoading ? (
        <RecentTransactionsSkeleton />
      ) : (
        <RecentTransactions transactions={data!.recentTransactions} />
      )}
    </div>
  )
}
