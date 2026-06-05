import { useEffect, useState } from 'react'
import { Filter, CheckCheck } from 'lucide-react'
import api from '../api/client'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const TYPE_FILTERS = ['all', 'critical', 'warning', 'info']

const TYPE_STYLES = {
  critical: { bg: 'bg-danger/12',  text: 'text-danger',  chip: 'bg-danger/15 text-danger',  border: 'border-l-danger' },
  warning:  { bg: 'bg-warning/12', text: 'text-warning', chip: 'bg-warning/15 text-warning', border: 'border-l-warning' },
  info:     { bg: 'bg-primary/12', text: 'text-primary', chip: 'bg-primary/15 text-primary', border: 'border-l-primary' },
}

export default function Alerts() {
  const [alerts,  setAlerts]  = useState([])
  const [filter,  setFilter]  = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAlerts() }, [])

  const fetchAlerts = async () => {
    try {
      const { data } = await api.get('/alerts/')
      setAlerts(data.results || data)
    } catch {
      toast.error('Failed to load alerts')
    } finally {
      setLoading(false)
    }
  }

  const markRead = async (id) => {
    await api.patch(`/alerts/${id}/read/`)
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a))
  }

  const markAllRead = async () => {
    await api.post('/alerts/mark_all_read/')
    setAlerts(prev => prev.map(a => ({ ...a, is_read: true })))
    toast.success('All alerts marked as read')
  }

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.alert_type === filter)
  const unread   = alerts.filter(a => !a.is_read).length

  return (
    <div className="space-y-5 page-enter">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-txt-muted" />
          <div className="flex gap-1.5 bg-bg-card border border-bg-border rounded-xl p-1">
            {TYPE_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  'px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all',
                  filter === f ? 'bg-primary text-white' : 'text-txt-secondary hover:text-txt-primary'
                )}
              >
                {f}
              </button>
            ))}
          </div>
          {unread > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 bg-danger/15 text-danger rounded-full">{unread} unread</span>
          )}
        </div>
        <button onClick={markAllRead} className="btn-outline text-xs py-2 px-3">
          <CheckCheck size={14} /> Mark all read
        </button>
      </div>

      {/* Alert List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card h-20 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-txt-muted">
          <p className="text-4xl mb-3">🎉</p>
          <p className="font-semibold text-txt-secondary">No alerts</p>
          <p className="text-sm mt-1">Everything looks good!</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(alert => {
            const s = TYPE_STYLES[alert.alert_type] || TYPE_STYLES.info
            return (
              <div
                key={alert.id}
                onClick={() => !alert.is_read && markRead(alert.id)}
                className={clsx(
                  'card p-5 flex items-start gap-4 cursor-pointer transition-all duration-200 border-l-4 animate-fade-in',
                  !alert.is_read && 'bg-bg-hover',
                  s.border,
                  'hover:bg-bg-hover hover:translate-x-1'
                )}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${s.bg}`}>
                  {alert.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[14px] font-semibold ${!alert.is_read ? 'text-txt-primary' : 'text-txt-secondary'}`}>
                    {alert.title}
                  </p>
                  <p className="text-[12px] text-txt-secondary mt-0.5 leading-relaxed">{alert.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-[11px] text-txt-muted">{alert.time_ago}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${s.chip}`}>
                    {alert.alert_type}
                  </span>
                  {!alert.is_read && (
                    <span className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
