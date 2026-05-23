import { useState, type FormEvent, type ChangeEvent } from 'react'
import clsx from 'clsx'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, Calendar, ChevronDown } from 'lucide-react'
import { fetchCategories } from '@/api/categories'
import { createTransaction } from '@/api/transactions'
import { toast } from '@/components/ui/toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import s from './AddTransactionDialog.module.scss'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function today() {
  return new Date().toISOString().slice(0, 10)
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

export function AddTransactionDialog({ open, onOpenChange }: Props) {
  const qc = useQueryClient()

  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(today)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [touched, setTouched] = useState(false)

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const filtered = categories.filter((c) => c.type === type)

  function reset() {
    setType('expense')
    setAmount('')
    setCategoryId('')
    setDate(today())
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
      await createTransaction({ amount: num, type, categoryId, date, note: note || undefined })
      await qc.invalidateQueries({ queryKey: ['transactions'] })
      await qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast('Transaction added', 'success')
      reset()
      onOpenChange(false)
    } catch {
      setError('Failed to add transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className={s.form} style={{ gap: 20 }}>
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
                <span className={s.inputLeft}><Calendar size={15} /></span>
                <input
                  className={s.input}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  style={{ paddingLeft: 8 }}
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
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
