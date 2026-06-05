import { useEffect, useState } from 'react'
import api from '../api/client'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const VERDICT_ICONS = { original: '✅', counterfeit: '🚨', suspicious: '⚠️' }

export default function History() {
  const [scans,   setScans]   = useState([])
  const [loading, setLoading] = useState(true)
  const [verdict, setVerdict] = useState('')
  const [brand,   setBrand]   = useState('')
  const [brands,  setBrands]  = useState([])

  useEffect(() => {
    Promise.all([api.get('/scans/'), api.get('/brands/')]).then(([s, b]) => {
      setScans(s.data.results || s.data)
      setBrands(b.data.results || b.data)
    }).catch(() => toast.error('Failed to load history')).finally(() => setLoading(false))
  }, [])

  const filtered = scans.filter(s =>
    (!verdict || s.verdict === verdict) &&
    (!brand || s.brand === parseInt(brand))
  )

  return (
    <div className="space-y-5 page-enter">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <select value={brand} onChange={e => setBrand(e.target.value)} className="input-field w-auto">
          <option value="">All Brands</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.emoji} {b.name}</option>)}
        </select>
        <select value={verdict} onChange={e => setVerdict(e.target.value)} className="input-field w-auto">
          <option value="">All Results</option>
          <option value="original">✅ Original</option>
          <option value="counterfeit">🚨 Counterfeit</option>
          <option value="suspicious">⚠️ Suspicious</option>
        </select>
        <button onClick={() => { setVerdict(''); setBrand('') }} className="btn-outline text-xs py-2 px-3">
          Clear Filters
        </button>
        <span className="text-xs text-txt-muted ml-auto">{filtered.length} records</span>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-20 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-txt-muted">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-semibold">No scan history found</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(scan => (
            <div key={scan.id} className="card p-4 flex items-center gap-4 hover:bg-bg-hover transition-all animate-fade-in">
              <div className="w-14 h-14 rounded-xl bg-bg-surface border border-bg-border flex items-center justify-center text-2xl shrink-0">
                {scan.brand_info ? scan.brand_info.emoji : VERDICT_ICONS[scan.verdict]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-txt-primary text-[14px]">
                  {scan.brand_info ? `${scan.brand_info.name} — Product Scan` : 'Unknown Brand Scan'}
                </p>
                <p className="text-xs text-txt-secondary mt-0.5">{scan.source} · {scan.scanned_by}</p>
                <p className="text-[11px] text-txt-muted mt-1">{new Date(scan.created_at).toLocaleString()}</p>
              </div>
              <div className="text-center px-4">
                <p className={clsx(
                  'text-2xl font-black tabular-nums font-mono',
                  scan.confidence >= 80 ? 'text-success' : scan.confidence >= 60 ? 'text-warning' : 'text-danger'
                )}>
                  {scan.confidence?.toFixed(0)}%
                </p>
                <p className="text-[10px] text-txt-muted">Confidence</p>
              </div>
              <span className={`verdict-chip ${scan.verdict}`}>
                {VERDICT_ICONS[scan.verdict]} {scan.verdict.charAt(0).toUpperCase() + scan.verdict.slice(1)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
