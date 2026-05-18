import { useState, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { createCategory } from '@/api/categories'
import { toast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const COLOR_PALETTE = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
  '#6b7280', '#0ea5e9', '#f43f5e', '#84cc16',
]

const EMOJI_LIST = [
  '💰','💵','💳','🏦','📈','📉','🤑','👛',
  '🛒','🏠','🚗','✈️','🍔','🎮','📚','🏥',
  '🎓','👔','🍽️','☕','🎵','🎬','💡','📱',
  '💻','🏋️','🏃','💊','🎁','🔖','🌿','🐾',
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddCategoryDialog({ open, onOpenChange }: Props) {
  const qc = useQueryClient()

  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLOR_PALETTE[5])
  const [icon, setIcon] = useState('📁')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function reset() {
    setType('expense'); setName(''); setColor(COLOR_PALETTE[5]); setIcon('📁'); setError('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }

    setLoading(true); setError('')
    try {
      await createCategory({ name: name.trim(), type, color, icon })
      await qc.invalidateQueries({ queryKey: ['categories'] })
      toast('Category created', 'success')
      reset()
      onOpenChange(false)
    } catch {
      setError('Failed to create category')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div className="ft-tabs" style={{ width: '100%' }}>
            {(['expense', 'income'] as const).map((t) => (
              <button
                key={t} type="button" onClick={() => setType(t)}
                className={`ft-tab ${type === t ? 'is-active' : ''}`}
                style={{ flex: 1, textTransform: 'capitalize' }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Name</Label>
            <Input
              id="cat-name" placeholder="e.g. Groceries" value={name}
              onChange={(e) => setName(e.target.value)} maxLength={100} required
            />
          </div>

          {/* Color palette */}
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c} type="button" title={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-7 h-7 rounded-full border-2 transition-transform hover:scale-110',
                    color === c ? 'border-foreground scale-110' : 'border-transparent',
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Emoji picker */}
          <div className="space-y-1.5">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto rounded-md border p-2">
              {EMOJI_LIST.map((e) => (
                <button
                  key={e} type="button" title={e}
                  onClick={() => setIcon(e)}
                  className={cn(
                    'w-8 h-8 flex items-center justify-center text-lg rounded transition-colors hover:bg-muted',
                    icon === e && 'bg-muted ring-2 ring-ring',
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Selected: {icon}</p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="gap-2">
              <Plus size={14} />
              {loading ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
