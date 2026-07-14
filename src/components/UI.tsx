import { X } from 'lucide-react'
import type { ReactNode } from 'react'

export function Modal({ title, subtitle, children, onClose, wide = false }: { title: string; subtitle?: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal-header"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={20} /></button></header>
        {children}
      </section>
    </div>
  )
}

export function EmptyState({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return <div className="empty-state"><div>{icon}</div><h3>{title}</h3><p>{text}</p></div>
}

export function StatusBadge({ status }: { status: 'healthy' | 'low' | 'out' | 'IN' | 'OUT' }) {
  const labels = { healthy: 'In stock', low: 'Low stock', out: 'Out of stock', IN: 'Stock in', OUT: 'Stock out' }
  return <span className={`status-badge status-${status.toLowerCase()}`}><i />{labels[status]}</span>
}

export function Toast({ message, tone = 'success' }: { message: string; tone?: 'success' | 'error' }) {
  return <div className={`toast toast-${tone}`}>{message}</div>
}
