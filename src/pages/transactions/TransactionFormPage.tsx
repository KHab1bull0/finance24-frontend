import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { fetchTransaction } from '@/api/transactions'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import s from './TransactionFormPage.module.scss'

/**
 * Full-page add/edit, used on touch layouts. Desktop keeps the dialog, so if
 * the viewport grows past the breakpoint while this page is open we hand the
 * user back to the list rather than leave them on a route desktop never uses.
 */
export function TransactionFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const isEdit = Boolean(id)

  useEffect(() => {
    if (!isMobile) navigate('/transactions', { replace: true })
  }, [isMobile, navigate])

  const { data: transaction, isLoading, isError } = useQuery({
    queryKey: ['transaction', id],
    queryFn: () => fetchTransaction(id!),
    enabled: isEdit,
  })

  const close = () => navigate('/transactions')

  return (
    <div className={s.page}>
      <header className={s.pageHead}>
        <button className={s.backBtn} onClick={close} aria-label="Back to transactions">
          <ArrowLeft size={20} />
        </button>
        <h1 className={s.h1}>{isEdit ? 'Edit transaction' : 'Add transaction'}</h1>
      </header>

      {isEdit && isLoading ? (
        <div className={s.card}>
          <div className={s.state}>
            <div className={s.stateSub}>Loading…</div>
          </div>
        </div>
      ) : isEdit && (isError || !transaction) ? (
        <div className={s.card}>
          <div className={s.state}>
            <div className={s.stateTitle}>Transaction not found</div>
            <div className={s.stateSub}>It may have been deleted.</div>
            <button className={s.btnSecondary} onClick={close}>Back to transactions</button>
          </div>
        </div>
      ) : (
        <div className={s.card}>
          <TransactionForm
            transaction={transaction ?? null}
            onSaved={close}
            onCancel={close}
          />
        </div>
      )}
    </div>
  )
}
