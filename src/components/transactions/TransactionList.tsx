import { useState } from 'react'
import clsx from 'clsx'
import { Pencil, Trash2, Wallet } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { deleteTransaction, type Transaction } from '@/api/transactions'
import { toast } from '@/components/ui/toast'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { AddTransactionDialog } from './AddTransactionDialog'
import s from './TransactionList.module.scss'

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

function TransactionRow({ tx, onEdit }: { tx: Transaction; onEdit: (tx: Transaction) => void }) {
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
    <div className={s.txRow}>
      <div
        className={s.txCat}
        style={{ background: tx.category.color + '22', color: tx.category.color }}
      >
        {tx.category.icon}
      </div>
      <div className={s.txMeta}>
        <div className={s.txTitle}>{tx.note ?? tx.category.name}</div>
        <div className={s.txSub}>
          {tx.note ? `${tx.category.name} · ` : ''}{tx.time ?? tx.createdAt?.slice(11, 16) ?? tx.date.slice(0, 10)}
        </div>
      </div>
      <div className={clsx(s.txAmt, tx.type === 'income' ? s.amtIn : s.amtOut)}>
        {tx.type === 'income' ? '+' : '−'}{fmt.format(tx.amount)}
      </div>
      <div className={s.txActions}>
        <button
          className={s.txEdit}
          onClick={() => onEdit(tx)}
          aria-label="Edit"
        >
          <Pencil size={15} />
        </button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className={s.txDel} disabled={deleting} aria-label="Delete">
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
  const [editing, setEditing] = useState<Transaction | null>(null)

  if (transactions.length === 0) {
    return (
      <div className={s.emptyCard}>
        <div className={s.emptyGlyph}>
          <Wallet size={28} />
        </div>
        <div className={s.emptyTitle}>No transactions found</div>
        <div className={s.emptySub}>Try adjusting your filters or add a new transaction</div>
      </div>
    )
  }

  const groups = groupByDate(transactions)

  return (
    <>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {groups.map(([date, txs]) => {
        const dayTotal = txs.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0)
        return (
          <div key={date} className={s.dayGroup}>
            <div className={s.dayHead}>
              <span className={s.dayLabel}>{formatDayLabel(date)}</span>
              <span className={clsx(s.dayTotal, dayTotal >= 0 ? s.amtIn : s.amtOut)}>
                {dayTotal >= 0 ? '+' : '−'}{fmt.format(Math.abs(dayTotal))}
              </span>
            </div>
            <div className={clsx(s.card, s.txList)}>
              {txs.map((tx) => <TransactionRow key={tx.id} tx={tx} onEdit={setEditing} />)}
            </div>
          </div>
        )
      })}

      {hasMore && (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
          <button
            onClick={onLoadMore}
            disabled={isFetchingMore}
            className={s.btnSecondary}
          >
            {isFetchingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>

    <AddTransactionDialog
      open={editing !== null}
      onOpenChange={(v) => { if (!v) setEditing(null) }}
      transaction={editing}
    />
    </>
  )
}
