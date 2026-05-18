import type { LucideIcon } from 'lucide-react'

const fmt = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

interface StatCardProps {
  title: string
  value: number
  icon: LucideIcon
  tone: 'brand' | 'success' | 'danger'
}

export function StatCard({ title, value, icon: Icon, tone }: StatCardProps) {
  return (
    <div className="ft-card ft-stat-card">
      <div className="ft-stat-head">
        <span className="ft-label-tiny">{title}</span>
        <span className={`ft-stat-icon ft-tone-${tone}`}>
          <Icon size={18} />
        </span>
      </div>
      <div className={`ft-stat-num ft-tone-${tone}-num`}>
        {value < 0 ? '−' : ''}{fmt.format(Math.abs(value))}
      </div>
      <div className="ft-stat-delta">All time</div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="ft-card ft-stat-card" style={{ opacity: 0.6 }}>
      <div className="ft-stat-head">
        <div style={{ height: 11, width: 80, background: 'var(--border)', borderRadius: 4 }} />
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--border)' }} />
      </div>
      <div style={{ height: 34, width: 120, background: 'var(--border)', borderRadius: 6, marginTop: 4 }} />
      <div style={{ height: 12, width: 50, background: 'var(--border)', borderRadius: 4, marginTop: 8 }} />
    </div>
  )
}
