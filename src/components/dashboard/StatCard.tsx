import clsx from 'clsx'
import type { LucideIcon } from 'lucide-react'
import s from './StatCard.module.scss'

const fmt = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

interface StatCardProps {
  title: string
  value: number
  icon: LucideIcon
  tone: 'brand' | 'success' | 'danger'
}

const toneIconClass: Record<string, string> = {
  brand:   s.toneBrand,
  success: s.toneSuccess,
  danger:  s.toneDanger,
}

const toneNumClass: Record<string, string> = {
  brand:   s.toneBrandNum,
  success: s.toneSuccessNum,
  danger:  s.toneDangerNum,
}

export function StatCard({ title, value, icon: Icon, tone }: StatCardProps) {
  return (
    <div className={clsx(s.card, s.statCard)}>
      <div className={s.statHead}>
        <span className={s.labelTiny}>{title}</span>
        <span className={clsx(s.statIcon, toneIconClass[tone])}>
          <Icon size={18} />
        </span>
      </div>
      <div className={clsx(s.statNum, toneNumClass[tone])}>
        {value < 0 ? '−' : ''}{fmt.format(Math.abs(value))}
      </div>
      <div className={s.statDelta}>All time</div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className={clsx(s.card, s.statCard)} style={{ opacity: 0.6 }}>
      <div className={s.statHead}>
        <div style={{ height: 11, width: 80, background: 'var(--border)', borderRadius: 4 }} />
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--border)' }} />
      </div>
      <div style={{ height: 34, width: 120, background: 'var(--border)', borderRadius: 6, marginTop: 4 }} />
      <div style={{ height: 12, width: 50, background: 'var(--border)', borderRadius: 4, marginTop: 8 }} />
    </div>
  )
}
