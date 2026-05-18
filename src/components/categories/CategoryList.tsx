import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { deleteCategory, type Category } from '@/api/categories'
import { toast } from '@/components/ui/toast'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

function CategoryCard({ cat }: { cat: Category }) {
  const qc = useQueryClient()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteCategory(cat.id)
      await qc.invalidateQueries({ queryKey: ['categories'] })
      await qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast(`"${cat.name}" deleted`, 'success')
    } catch {
      toast('Failed to delete category', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="ft-cat-card">
      <span
        className="ft-cat-emoji"
        style={{ background: cat.color + '22', color: cat.color }}
      >
        {cat.icon}
      </span>
      <div className="ft-cat-meta">
        <div className="ft-cat-name">{cat.name}</div>
        <div className="ft-cat-dot">
          <span style={{ background: cat.color }} />
          <code>{cat.color}</code>
        </div>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button className="ft-cat-del" disabled={deleting} aria-label="Delete">
            <Trash2 size={14} />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{cat.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category. Transactions linked to it will lose their
              category association.
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
  categories: Category[]
  type: 'income' | 'expense'
}

export function CategoryList({ categories, type }: Props) {
  const filtered = categories.filter((c) => c.type === type)

  if (filtered.length === 0) {
    return (
      <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--fg-muted)', fontSize: 13 }}>
        No {type} categories yet
      </div>
    )
  }

  return (
    <div className="ft-cat-grid">
      {filtered.map((cat) => <CategoryCard key={cat.id} cat={cat} />)}
    </div>
  )
}
