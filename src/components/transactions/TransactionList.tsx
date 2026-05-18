import { useState } from 'react'
import { Trash2, Wallet } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { deleteTransaction, type Transaction } from '@/api/transactions'
import { toast } from '@/components/ui/toast'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

const fmt = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function formatDayLabel(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function groupByDate(transactions: Transaction[]): [string, Transaction[]][] {
  const map = new Map<string, Transaction[]>()
  for (const tx of transactions) {
    const key = tx.date.slice(0, 10)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(tx)
  }
  return Array.from(map.entries())
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const [deleting, setDeleting] = useState(false)
  const qc = useQueryClient()

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteTransaction(tx.id)
      await qc.invalidateQueries({ queryKey: ['transactions'] })
      await qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast('Transaction deleted', 'success')
    } catch {
      toast('Failed to delete', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="ft-tx-row ft-tx-row--full">
      <div
        className="ft-tx-cat"
        style={{ background: tx.category.color + '22', color: tx.category.color }}
      >
        {tx.category.icon}
      </div>
      <div className="ft-tx-meta">
        <div className="ft-tx-title">{tx.note ?? tx.category.name}</div>
        <div className="ft-tx-sub">
          {tx.note ? `${tx.category.name} · ` : ''}{tx.createdAt?.slice(11, 16) ?? tx.date.slice(0, 10)}
        </div>
      </div>
      <div className={`ft-tx-amt ${tx.type === 'income' ? 'is-in' : 'is-out'}`}>
        {tx.type === 'income' ? '+' : '−'}{fmt.format(tx.amount)}
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button className="ft-tx-del" disabled={deleting} aria-label="Delete">
            <Trash2 size={15} />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {tx.type === 'income' ? '+' : '−'}{fmt.format(tx.amount)} ({tx.type}).
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

interface Props {
  transactions: Transaction[]
  hasMore: boolean
  isFetchingMore: boolean
  onLoadMore: () => void
}

export function TransactionList({ transactions, hasMore, isFetchingMore, onLoadMore }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="ft-card ft-empty">
        <div className="ft-empty-glyph">
          <Wallet size={28} />
        </div>
        <div className="ft-empty-t">No transactions found</div>
        <div className="ft-empty-s">Try adjusting your filters or add a new transaction</div>
      </div>
    )
  }

  const groups = groupByDate(transactions)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {groups.map(([date, txs]) => {
        const dayTotal = txs.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0)
        return (
          <div key={date} className="ft-day-group">
            <div className="ft-day-head">
              <span className="ft-day-label">{formatDayLabel(date)}</span>
              <span className={`ft-day-total ${dayTotal >= 0 ? 'is-in' : 'is-out'}`}>
                {dayTotal >= 0 ? '+' : '−'}{fmt.format(Math.abs(dayTotal))}
              </span>
            </div>
            <div className="ft-card ft-tx-list">
              {txs.map((tx) => <TransactionRow key={tx.id} tx={tx} />)}
            </div>
          </div>
        )
      })}

      {hasMore && (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
          <button
            onClick={onLoadMore}
            disabled={isFetchingMore}
            className="ft-btn ft-btn-secondary ft-btn-sm"
          >
            {isFetchingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}
