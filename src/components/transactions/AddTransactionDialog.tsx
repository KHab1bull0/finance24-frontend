import { useState, type FormEvent, type ChangeEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, Calendar, ChevronDown } from 'lucide-react'
import { fetchCategories } from '@/api/categories'
import { createTransaction } from '@/api/transactions'
import { toast } from '@/components/ui/toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

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

        <form onSubmit={handleSubmit} className="ft-form" style={{ gap: 20 }}>
          {/* Type toggle */}
          <div className="ft-type-toggle">
            <button
              type="button"
              className={`ft-type ft-type--in ${type === 'income' ? 'is-active' : ''}`}
              onClick={() => { setType('income'); setCategoryId('') }}
            >
              <span className="ft-type-ic"><TrendingUp size={18} /></span>
              <span className="ft-type-t">Income</span>
              <span className="ft-type-s">Money in</span>
            </button>
            <button
              type="button"
              className={`ft-type ft-type--out ${type === 'expense' ? 'is-active' : ''}`}
              onClick={() => { setType('expense'); setCategoryId('') }}
            >
              <span className="ft-type-ic"><TrendingDown size={18} /></span>
              <span className="ft-type-t">Expense</span>
              <span className="ft-type-s">Money out</span>
            </button>
          </div>

          {/* Amount */}
          <div className="ft-amount-wrap">
            <span className="ft-amount-label">Amount</span>
            <div className={`ft-amount ${type === 'income' ? 'is-in' : 'is-out'} ${touched && !amount ? 'is-error' : ''}`}>
              <input
                inputMode="decimal"
                value={formatDisplay(amount)}
                onChange={(e) => handleAmountInput(e, setAmount)}
                className="ft-amount-input"
                placeholder="0"
              />
              <span className="ft-amount-sfx">UZS</span>
            </div>
          </div>

          {/* Category + Date grid */}
          <div className="ft-form-grid">
            <label className="ft-field">
              <span className="ft-field-label">Category</span>
              <div className="ft-input-wrap" style={{ position: 'relative' }}>
                <select
                  className="ft-input ft-select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option value="">Select…</option>
                  {filtered.map((c) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
                <span className="ft-select-chev"><ChevronDown size={15} /></span>
              </div>
            </label>

            <label className="ft-field">
              <span className="ft-field-label">Date</span>
              <div className="ft-input-wrap">
                <span className="ft-input-left"><Calendar size={15} /></span>
                <input
                  className="ft-input"
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
          <label className="ft-field">
            <span className="ft-field-label">Note (optional)</span>
            <div className="ft-input-wrap">
              <input
                className="ft-input"
                placeholder="e.g. Lunch, Grocery run…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={500}
              />
            </div>
          </label>

          {error && <div className="ft-field-err">{error}</div>}

          <div className="ft-form-actions">
            <button type="button" className="ft-btn ft-btn-secondary ft-btn-md" onClick={() => onOpenChange(false)}>
              Cancel
            </button>
            <button type="submit" className="ft-btn ft-btn-primary ft-btn-md" disabled={loading}>
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
