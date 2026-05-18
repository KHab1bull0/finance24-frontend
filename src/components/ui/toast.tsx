import { useState, useEffect } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

interface ToastItem {
  id: string
  message: string
  tone: 'success' | 'error'
}

let _addToast: ((msg: string, tone?: 'success' | 'error') => void) | null = null

export function toast(message: string, tone: 'success' | 'error' = 'success') {
  _addToast?.(message, tone)
}

export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    _addToast = (msg, tone = 'success') => {
      const id = Math.random().toString(36).slice(2)
      setItems((s) => [...s, { id, message: msg, tone }])
      setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 2800)
    }
    return () => { _addToast = null }
  }, [])

  return (
    <div className="ft-toast-host" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={`ft-toast ft-toast-${t.tone}`}>
          <span className="ft-toast-ic">
            {t.tone === 'success' ? <CheckCircle size={14} /> : <XCircle size={14} />}
          </span>
          <span className="ft-toast-msg">{t.message}</span>
        </div>
      ))}
    </div>
  )
}
