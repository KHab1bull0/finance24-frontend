import { useNavigate } from 'react-router-dom'
import type { RecentTransaction } from '@/api/stats'

const fmt = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

interface Props {
  transactions: RecentTransaction[]
}

export function RecentTransactions({ transactions }: Props) {
  const navigate = useNavigate()

  return (
    <section className="ft-recent">
      <div className="ft-card-head">
        <h2 className="ft-h3">Recent transactions</h2>
        <button className="ft-link" onClick={() => navigate('/transactions')}>View all</button>
      </div>
      <div className="ft-card ft-recent-list">
        {transactions.length === 0 ? (
          <div className="ft-empty" style={{ padding: '32px 20px' }}>
            <div className="ft-empty-glyph">
              <span style={{ fontSize: 24 }}>💸</span>
            </div>
            <div className="ft-empty-t">No transactions yet</div>
            <div className="ft-empty-s">Add your first income or expense</div>
          </div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="ft-tx-row">
              <div
                className="ft-tx-cat"
                style={{ background: tx.category.color + '22', color: tx.category.color }}
              >
                {tx.category.icon}
              </div>
              <div className="ft-tx-meta">
                <div className="ft-tx-title">{tx.note ?? tx.category.name}</div>
                <div className="ft-tx-sub">
                  {tx.category.name} · {formatDate(tx.date)}
                </div>
              </div>
              <div className={`ft-tx-amt ${tx.type === 'income' ? 'is-in' : 'is-out'}`}>
                {tx.type === 'income' ? '+' : '−'}{fmt.format(tx.amount)}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

export function RecentTransactionsSkeleton() {
  return (
    <section className="ft-recent">
      <div className="ft-card-head">
        <div style={{ height: 16, width: 160, background: 'var(--border)', borderRadius: 4 }} />
      </div>
      <div className="ft-card ft-recent-list">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="ft-tx-row" style={{ opacity: 0.5 + i * 0.1 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--border)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ height: 14, width: 120, background: 'var(--border)', borderRadius: 4 }} />
              <div style={{ height: 12, width: 80, background: 'var(--border)', borderRadius: 4 }} />
            </div>
            <div style={{ height: 14, width: 60, background: 'var(--border)', borderRadius: 4 }} />
          </div>
        ))}
      </div>
    </section>
  )
}
