import { useEffect, useState, type FormEvent } from 'react'
import clsx from 'clsx'
import { useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { createCategory, updateCategory, type Category } from '@/api/categories'
import { toast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import s from './AddCategoryDialog.module.scss'

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
  category?: Category
}

export function AddCategoryDialog({ open, onOpenChange, category }: Props) {
  const qc = useQueryClient()
  const isEdit = Boolean(category)

  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLOR_PALETTE[5])
  const [icon, setIcon] = useState('📁')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function reset() {
    if (category) {
      setType(category.type); setName(category.name); setColor(category.color); setIcon(category.icon); setError('')
    } else {
      setType('expense'); setName(''); setColor(COLOR_PALETTE[5]); setIcon('📁'); setError('')
    }
  }

  useEffect(() => {
    if (open) reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }

    setLoading(true); setError('')
    try {
      if (category) {
        await updateCategory(category.id, { name: name.trim(), type, color, icon })
      } else {
        await createCategory({ name: name.trim(), type, color, icon })
      }
      await qc.invalidateQueries({ queryKey: ['categories'] })
      await qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast(category ? 'Category updated' : 'Category created', 'success')
      reset()
      onOpenChange(false)
    } catch {
      setError(category ? 'Failed to update category' : 'Failed to create category')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="h-screen">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Category' : 'Add Category'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type — uses module scss */}
          <div className={s.tabs}>
            {(['expense', 'income'] as const).map((t) => (
              <button
                key={t} type="button" onClick={() => setType(t)}
                className={clsx(s.tab, type === t && s.active)}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Name — uses shadcn/Tailwind */}
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Name</Label>
            <Input
              id="cat-name" placeholder="e.g. Groceries" value={name}
              onChange={(e) => setName(e.target.value)} maxLength={100} required
              className="border-0 bg-muted"
            />
          </div>

          {/* Color palette — uses shadcn/Tailwind */}
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

          {/* Emoji picker — uses shadcn/Tailwind */}
          <div className="space-y-1.5">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto rounded-md bg-muted p-2">
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

          <DialogFooter className="flex-row justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {!isEdit && <Plus size={14} />}
              {isEdit ? (loading ? 'Saving…' : 'Save') : (loading ? 'Creating…' : 'Create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
