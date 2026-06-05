import { useEffect, useState } from 'react'
import { Activity, AlertTriangle, CheckCircle, Shield, TrendingUp } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import api from '../api/client'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

// ── Custom Tooltip ───────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-card border border-bg-border rounded-lg p-3 shadow-card text-xs">
      <p className="text-txt-muted font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  )
}

const DONUT_COLORS = ['#6366f1', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981']
const SOURCES = [
  { name: 'Olx.uz',    value: 38 },
  { name: 'Telegram',  value: 27 },
  { name: 'Instagram', value: 18 },
  { name: 'Uzum.uz',   value: 11 },
  { name: 'Manual',    value:  6 },
]

// ── Live Feed (mock + real-time feel) ───────────────────
const FEED_POOL = [
  { dot: 'red',    text: 'Artel TV — Counterfeit detected',      meta: 'Olx.uz • 94%' },
  { dot: 'green',  text: 'Cosmo Lipstick — Verified original',   meta: 'Manual • 98%' },
  { dot: 'orange', text: 'Sarbon Chocolate — Suspicious',        meta: 'Telegram • 67%' },
  { dot: 'red',    text: 'Orzugul Tablet — Counterfeit',         meta: 'Instagram • 88%' },
  { dot: 'green',  text: 'Milliy Yuk Sneaker — Original',        meta: 'Manual • 97%' },
  { dot: 'red',    text: 'Artel Fridge — Counterfeit detected',  meta: 'Uzum.uz • 91%' },
  { dot: 'green',  text: 'Hamkor Drill — Verified original',     meta: 'Manual • 99%' },
]

const DOT_CLASSES = {
  red:    'bg-danger shadow-[0_0_6px_#ef4444]',
  green:  'bg-success shadow-[0_0_6px_#10b981]',
  orange: 'bg-warning shadow-[0_0_6px_#f59e0b]',
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [feed, setFeed] = useState(FEED_POOL.slice(0, 5))
  const [feedIdx, setFeedIdx] = useState(5)
  const { t } = useTranslation()

  useEffect(() => {
    fetchStats()
    // Live feed ticker
    const interval = setInterval(() => {
      setFeed(prev => {
        const next = FEED_POOL[feedIdx % FEED_POOL.length]
        setFeedIdx(i => i + 1)
        return [next, ...prev.slice(0, 5)]
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [feedIdx])

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/scans/stats/')
      setStats(data)
    } catch {
      toast.error('Failed to load dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSkeleton />

  const chartData = stats?.recent_verdicts || []

  return (
    <div className="space-y-6 page-enter">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 max-[1200px]:grid-cols-2 max-[600px]:grid-cols-2">
        <StatCard icon={Activity}    color="teal"   label={t('dashboard.total_scans')}     value={stats?.today_scans || 0}        change={`↑ 18%`} positive />
        <StatCard icon={AlertTriangle} color="red"  label={t('dashboard.threats')} value={stats?.counterfeits || 0}       change={`${stats?.today_threats || 0} new`} />
        <StatCard icon={CheckCircle} color="green"  label={t('dashboard.originals')}    value={stats?.originals || 0}          change={`${stats?.accuracy_pct || 0}%`} positive />
        <StatCard icon={Shield}      color="purple" label={t('dashboard.active_brands')}       value={stats?.brands_protected || 0}  change="↑ 2" positive />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-[1fr_340px] gap-4 max-[1200px]:grid-cols-1">
        {/* Activity Chart */}
        <div className="card p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-[15px] font-semibold text-txt-primary">{t('dashboard.trends')}</h3>
              <p className="text-xs text-txt-muted">Last 7 days overview</p>
            </div>
            <div className="flex gap-3 text-xs text-txt-muted">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-primary inline-block rounded" />Scans</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 bg-danger/60 inline-block rounded" />Threats</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a42" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="scans" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} name="Scans" />
              <Bar dataKey="counterfeits" fill="#ef444499" name="Threats" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart */}
        <div className="card p-6">
          <h3 className="text-[15px] font-semibold text-txt-primary mb-1">Threat Sources</h3>
          <p className="text-xs text-txt-muted mb-4">By platform origin</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={SOURCES} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                {SOURCES.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {SOURCES.map((s, i) => (
              <div key={s.name} className="flex items-center gap-2 text-xs text-txt-secondary">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: DONUT_COLORS[i] }} />
                <span className="flex-1">{s.name}</span>
                <span className="font-semibold text-txt-primary">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Feed + Quick Stats */}
      <div className="grid grid-cols-2 gap-4 max-[1200px]:grid-cols-1">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-bg-border">
            <h3 className="text-[14px] font-semibold">{t('dashboard.live_feed')}</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-danger/15 text-danger rounded-full animate-pulse">LIVE</span>
          </div>
          <div className="p-2 space-y-0.5">
            {feed.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors animate-slide-in">
                <span className={`w-2 h-2 rounded-full shrink-0 ${DOT_CLASSES[item.dot]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-txt-primary truncate">{item.text}</p>
                  <p className="text-[11px] text-txt-muted">{item.meta}</p>
                </div>
                <span className="text-[11px] text-txt-muted shrink-0">{i === 0 ? 'now' : `${i * 4}m`}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-bg-border">
            <h3 className="text-[14px] font-semibold">{t('dashboard.title')}</h3>
          </div>
          <div className="p-5 space-y-4">
            {[
              { label: t('dashboard.total_scans'),        value: stats?.total_scans || 0,    color: 'primary' },
              { label: t('dashboard.counterfeits'), value: stats?.counterfeits || 0,   color: 'danger' },
              { label: t('dashboard.originals'), value: stats?.originals || 0,      color: 'success' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-txt-secondary">{item.label}</span>
                  <span className="font-bold text-txt-primary">{item.value?.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-bg-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-${item.color} transition-all duration-1000`}
                    style={{ width: `${Math.min(100, (item.value / (stats?.total_scans || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, color, label, value, change, positive }) {
  const colors = {
    teal:   'bg-teal/12 text-teal',
    red:    'bg-danger/12 text-danger',
    green:  'bg-success/12 text-success',
    purple: 'bg-purple/12 text-purple',
  }
  return (
    <div className="stat-card">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs font-medium text-txt-secondary mb-1">{label}</p>
        <p className="text-2xl font-black text-txt-primary leading-none mb-1.5 tabular-nums">{value?.toLocaleString()}</p>
        <p className={`text-[11px] font-medium ${positive ? 'text-success' : 'text-danger'}`}>{change}</p>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-5 h-24 bg-bg-card" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="card h-72 bg-bg-card" />
        <div className="card h-72 bg-bg-card" />
      </div>
    </div>
  )
}
