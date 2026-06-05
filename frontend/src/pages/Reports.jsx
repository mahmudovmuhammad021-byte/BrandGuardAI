import { useEffect, useState } from 'react'
import { Search, Download } from 'lucide-react'
import api from '../api/client'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const VERDICT_LABELS = {
  original:    '✅ Original',
  counterfeit: '🚨 Counterfeit',
  suspicious:  '⚠️ Suspicious',
}

export default function Reports() {
  const [scans,   setScans]   = useState([])
  const [search,  setSearch]  = useState('')
  const [loading, setLoading] = useState(true)
  const [stats,   setStats]   = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/scans/'),
      api.get('/scans/stats/'),
    ]).then(([s, st]) => {
      setScans(s.data.results || s.data)
      setStats(st.data)
    }).catch(() => toast.error('Failed to load reports')).finally(() => setLoading(false))
  }, [])

  const filtered = scans.filter(s =>
    s.brand_info?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.verdict.includes(search.toLowerCase()) ||
    s.source.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5 page-enter">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2">
        {[
          { label: 'Monthly Scans',      value: stats?.total_scans    || 0, color: 'text-txt-primary', bar: 'bg-primary', pct: 73 },
          { label: 'Counterfeits Found', value: stats?.counterfeits   || 0, color: 'text-danger',      bar: 'bg-danger',  pct: 49 },
          { label: 'Brands Protected',   value: stats?.brands_protected||0, color: 'text-teal',        bar: 'bg-teal',    pct: 28 },
          { label: 'Originals Verified', value: stats?.originals      || 0, color: 'text-success',     bar: 'bg-success', pct: 59 },
        ].map(c => (
          <div key={c.label} className="card p-4">
            <p className="text-[11px] text-txt-muted mb-1.5">{c.label}</p>
            <p className={`text-2xl font-black mb-2.5 tabular-nums ${c.color}`}>{c.value?.toLocaleString()}</p>
            <div className="h-1 bg-bg-border rounded-full overflow-hidden">
              <div className={`h-full ${c.bar} rounded-full`} style={{ width: `${c.pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border gap-4">
          <h3 className="text-[15px] font-semibold">Detection Cases</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-bg-input border border-bg-border rounded-lg px-3 h-9 w-52 focus-within:border-primary transition-all">
              <Search size={13} className="text-txt-muted" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search cases..."
                className="bg-transparent border-none text-xs text-txt-primary placeholder-txt-muted outline-none w-full"
              />
            </div>
            <button onClick={() => toast.success('📄 PDF report exported!')} className="btn-primary py-2 px-4 text-xs">
              <Download size={13} /> Export PDF
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-txt-muted">Loading...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-bg-border">
                  {['Scan ID', 'Brand', 'Verdict', 'Confidence', 'Source', 'Engine', 'Date', 'Action'].map(h => (
                    <th key={h} className="text-left text-[11px] font-semibold text-txt-muted uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(scan => (
                  <tr key={scan.id} className="border-b border-bg-border/50 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs text-primary">#{String(scan.id).padStart(4, '0')}</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-txt-secondary">
                      {scan.brand_info ? `${scan.brand_info.emoji} ${scan.brand_info.name}` : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`verdict-chip ${scan.verdict}`}>{VERDICT_LABELS[scan.verdict]}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={clsx(
                        'font-mono text-sm font-bold',
                        scan.confidence >= 80 ? 'text-success' : scan.confidence >= 60 ? 'text-warning' : 'text-danger'
                      )}>
                        {scan.confidence?.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-txt-secondary">{scan.source}</td>
                    <td className="px-4 py-3.5">
                      <span className={clsx(
                        'text-[11px] font-semibold px-2 py-0.5 rounded-full',
                        scan.engine === 'yolov8' ? 'bg-teal/15 text-teal' : 'bg-purple/15 text-purple'
                      )}>
                        {scan.engine === 'yolov8' ? '🤖 YOLOv8' : '💡 Sim'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-txt-muted whitespace-nowrap">
                      {new Date(scan.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => toast(`Scan #${scan.id} details`, { icon: '📋' })}
                        className="text-xs font-semibold px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-md text-primary hover:bg-primary/20 transition-all"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-12 text-txt-muted text-sm">No cases found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
