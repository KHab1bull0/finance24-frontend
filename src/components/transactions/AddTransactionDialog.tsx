import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react'
import clsx from 'clsx'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, ChevronDown } from 'lucide-react'
import { fetchCategories } from '@/api/categories'
import { createTransaction, updateTransaction, type Transaction } from '@/api/transactions'
import { toast } from '@/components/ui/toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import s from './AddTransactionDialog.module.scss'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: Transaction | null
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function now() {
  return new Date().toTimeString().slice(0, 5)
}

function formatDisplay(raw: string): string {
  if (!raw) return ''
  const [int, dec] = raw.split('.')
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return dec !== undefined ? `${grouped}.${dec}` : grouped
}

function handleAmountInput(
  e: ChangeEvent<HTMLInputElement>,
  setter: (v: string) => void,
) {
  const stripped = e.target.value.replace(/\s/g, '')
  if (/^\d*\.?\d*$/.test(stripped)) setter(stripped)
}

export function AddTransactionDialog({ open, onOpenChange, transaction }: Props) {
  const qc = useQueryClient()
  const isEdit = !!transaction

  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(today)
  const [time, setTime] = useState(now)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [touched, setTouched] = useState(false)

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const filtered = categories.filter((c) => c.type === type)

  // Prefill when opening in edit mode.
  useEffect(() => {
    if (open && transaction) {
      setType(transaction.type)
      setAmount(String(transaction.amount))
      setCategoryId(transaction.category.id)
      setDate(transaction.date.slice(0, 10))
      setTime(transaction.time ?? transaction.createdAt?.slice(11, 16) ?? now())
      setNote(transaction.note ?? '')
      setError('')
      setTouched(false)
    }
  }, [open, transaction])

  function reset() {
    setType('expense')
    setAmount('')
    setCategoryId('')
    setDate(today())
    setTime(now())
    setNote('')
    setError('')
    setTouched(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    const num = parseFloat(amount)
    if (!num || num <= 0) { setError('Enter a valid amount'); return }
    if (!categoryId) { setError('Select a category'); return }
    if (!date) { setError('Select a date'); return }

    setLoading(true)
    setError('')
    try {
      const payload = { amount: num, type, categoryId, date, time: time || undefined, note: note || undefined }
      if (isEdit && transaction) {
        await updateTransaction(transaction.id, payload)
      } else {
        await createTransaction(payload)
      }
      await qc.invalidateQueries({ queryKey: ['transactions'] })
      await qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast(isEdit ? 'Transaction updated' : 'Transaction added', 'success')
      reset()
      onOpenChange(false)
    } catch {
      setError(isEdit ? 'Failed to update transaction' : 'Failed to add transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="max-w-md p-5">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className={s.form}>
          {/* Type toggle */}
          <div className={s.typeToggle}>
            <button
              type="button"
              className={clsx(s.type, s.typeIn, type === 'income' && s.active)}
              onClick={() => { setType('income'); setCategoryId('') }}
            >
              <span className={s.typeIc}><TrendingUp size={18} /></span>
              <span className={s.typeTitle}>Income</span>
              <span className={s.typeSub}>Money in</span>
            </button>
            <button
              type="button"
              className={clsx(s.type, s.typeOut, type === 'expense' && s.active)}
              onClick={() => { setType('expense'); setCategoryId('') }}
            >
              <span className={s.typeIc}><TrendingDown size={18} /></span>
              <span className={s.typeTitle}>Expense</span>
              <span className={s.typeSub}>Money out</span>
            </button>
          </div>

          {/* Amount */}
          <div className={s.amountWrap}>
            <span className={s.amountLabel}>Amount</span>
            <div className={clsx(
              s.amount,
              type === 'income' ? s.amtIn : s.amtOut,
              touched && !amount && s.error,
            )}>
              <input
                inputMode="decimal"
                value={formatDisplay(amount)}
                onChange={(e) => handleAmountInput(e, setAmount)}
                className={s.amountInput}
                placeholder="0"
              />
              <span className={s.amountSfx}>UZS</span>
            </div>
          </div>

          {/* Category + Date grid */}
          <div className={s.formGrid}>
            <label className={s.field}>
              <span className={s.fieldLabel}>Category</span>
              <div className={s.inputWrap} style={{ position: 'relative' }}>
                <select
                  className={clsx(s.input, s.select)}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option value="">Select…</option>
                  {filtered.map((c) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
                <span className={s.selectChev}><ChevronDown size={15} /></span>
              </div>
            </label>

            <label className={s.field}>
              <span className={s.fieldLabel}>Date</span>
              <div className={s.inputWrap}>
                <input
                  className={s.input}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </label>

            <label className={s.field}>
              <span className={s.fieldLabel}>Time</span>
              <div className={s.inputWrap}>
                <input
                  className={s.input}
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </label>
          </div>

          {/* Note */}
          <label className={s.field}>
            <span className={s.fieldLabel}>Note (optional)</span>
            <div className={s.inputWrap}>
              <input
                className={s.input}
                placeholder="e.g. Lunch, Grocery run…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={500}
              />
            </div>
          </label>

          {error && <div className={s.fieldErr}>{error}</div>}

          <div className={s.formActions}>
            <button type="button" className={s.btnSecondary} onClick={() => onOpenChange(false)}>
              Cancel
            </button>
            <button type="submit" className={s.btnPrimary} disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Save'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
