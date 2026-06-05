import { useState } from 'react'
import { Save, Link } from 'lucide-react'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const TABS = ['General', 'AI Model', 'Alerts', 'Integrations']

const INTEGRATIONS = [
  { icon: '🤖', name: 'Google Vision AI', desc: 'Image analysis engine',        connected: true  },
  { icon: '📱', name: 'Telegram Bot',     desc: 'Real-time alert notifications', connected: false },
  { icon: '🗄',  name: 'PostgreSQL',       desc: 'Production database',           connected: false },
  { icon: '☁️', name: 'Google Cloud Run', desc: 'ML model hosting',              connected: false },
]

export default function Settings() {
  const [tab,       setTab]       = useState('General')
  const [threshold, setThreshold] = useState(75)
  const [integrations, setIntegrations] = useState(INTEGRATIONS)
  const { user } = useAuthStore()

  const connect = (idx) => {
    toast('🔗 Connecting...', { icon: '⏳' })
    setTimeout(() => {
      setIntegrations(prev => prev.map((it, i) => i === idx ? { ...it, connected: true } : it))
      toast.success(`${integrations[idx].name} connected!`)
    }, 1500)
  }

  return (
    <div className="flex gap-6 page-enter max-[900px]:flex-col">
      {/* Sidebar Tabs */}
      <div className="w-48 max-[900px]:w-full">
        <div className="card p-2 flex flex-col gap-1 max-[900px]:flex-row max-[900px]:overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                'px-3.5 py-2.5 rounded-lg text-[13px] font-medium text-left transition-all whitespace-nowrap',
                tab === t ? 'bg-primary/15 text-txt-primary' : 'text-txt-secondary hover:text-txt-primary hover:bg-white/[0.04]'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 card p-7">
        {tab === 'General' && (
          <div className="space-y-5">
            <h3 className="text-base font-bold border-b border-bg-border pb-4">General Settings</h3>
            <SettingRow label="Platform Name">
              <input defaultValue="Verix" className="input-field max-w-xs" />
            </SettingRow>
            <SettingRow label="Logged in as">
              <div className="flex items-center gap-2 text-sm text-txt-secondary">
                <span className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center text-xs font-bold text-white">{user?.initials}</span>
                <span>{user?.email}</span>
                <span className="text-xs px-2 py-0.5 bg-primary/15 text-primary rounded-full capitalize">{user?.role}</span>
              </div>
            </SettingRow>
            <SettingRow label="Language">
              <select className="input-field max-w-xs">
                <option>English</option>
                <option>O'zbek</option>
                <option>Русский</option>
              </select>
            </SettingRow>
            <SettingRow label="Auto-alert on detection">
              <Toggle defaultChecked />
            </SettingRow>
            <button onClick={() => toast.success('Settings saved!')} className="btn-primary mt-4">
              <Save size={14} /> Save Changes
            </button>
          </div>
        )}

        {tab === 'AI Model' && (
          <div className="space-y-5">
            <h3 className="text-base font-bold border-b border-bg-border pb-4">AI Model Configuration</h3>
            <SettingRow label="Detection Model">
              <select className="input-field max-w-xs">
                <option>YOLOv8-nano (Fast)</option>
                <option selected>YOLOv8-medium (Balanced)</option>
                <option>YOLOv8-large (Accurate)</option>
              </select>
            </SettingRow>
            <SettingRow label={`Confidence Threshold — ${threshold}%`}>
              <div className="flex items-center gap-3 max-w-xs">
                <input
                  type="range" min={50} max={99} value={threshold}
                  onChange={e => setThreshold(+e.target.value)}
                  className="flex-1 accent-primary"
                />
                <span className="font-bold text-primary text-sm w-10">{threshold}%</span>
              </div>
            </SettingRow>
            <SettingRow label="Analysis Points">
              <div className="space-y-2">
                {['Logo Shape Analysis', 'Color Profile Matching', 'Font & Text Detection', 'Barcode / QR Verification'].map(opt => (
                  <label key={opt} className="flex items-center gap-2 text-sm text-txt-secondary cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-primary" />
                    {opt}
                  </label>
                ))}
              </div>
            </SettingRow>
            <div className="p-4 bg-teal/5 border border-teal/20 rounded-xl">
              <p className="text-xs font-semibold text-teal mb-1">📁 Custom YOLOv8 Model</p>
              <p className="text-xs text-txt-secondary">
                Place your trained model at <code className="font-mono bg-bg-base px-1 rounded text-primary">backend/ai_models/brandguard.pt</code> and restart Django to enable real inference.
              </p>
            </div>
            <button onClick={() => toast.success('Model settings applied!')} className="btn-primary mt-4">
              <Save size={14} /> Apply Settings
            </button>
          </div>
        )}

        {tab === 'Alerts' && (
          <div className="space-y-5">
            <h3 className="text-base font-bold border-b border-bg-border pb-4">Alert Configuration</h3>
            <SettingRow label="Telegram Bot Token">
              <input type="password" placeholder="••••••••••••••••••••" className="input-field max-w-xs" />
            </SettingRow>
            <SettingRow label="Alert Chat ID">
              <input placeholder="-100xxxxxxxxxx" className="input-field max-w-xs" />
            </SettingRow>
            <SettingRow label="Email Notifications">
              <input type="email" placeholder="admin@yourbrand.uz" className="input-field max-w-xs" />
            </SettingRow>
            <SettingRow label="Alert Frequency">
              <select className="input-field max-w-xs">
                <option>Immediately</option>
                <option>Every hour</option>
                <option>Daily digest</option>
              </select>
            </SettingRow>
            <button onClick={() => toast.success('Alert settings saved!')} className="btn-primary mt-4">
              <Save size={14} /> Save Alert Settings
            </button>
          </div>
        )}

        {tab === 'Integrations' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold border-b border-bg-border pb-4">Integrations</h3>
            {integrations.map((int, i) => (
              <div key={int.name} className={clsx(
                'flex items-center gap-4 p-4 rounded-xl border transition-all',
                int.connected ? 'bg-success/5 border-success/25' : 'bg-bg-surface border-bg-border hover:border-primary/40'
              )}>
                <span className="text-2xl">{int.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-txt-primary">{int.name}</p>
                  <p className="text-xs text-txt-muted">{int.desc}</p>
                </div>
                {int.connected ? (
                  <span className="text-xs font-bold text-success">✓ Active</span>
                ) : (
                  <button
                    onClick={() => connect(i)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-primary/15 border border-primary/30 rounded-lg text-primary hover:bg-primary/25 transition-all"
                  >
                    <Link size={11} /> Connect
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SettingRow({ label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-txt-secondary">{label}</label>
      {children}
    </div>
  )
}

function Toggle({ defaultChecked }) {
  const [on, setOn] = useState(defaultChecked)
  return (
    <button
      onClick={() => setOn(!on)}
      className={clsx(
        'w-10 h-6 rounded-full relative transition-colors duration-200',
        on ? 'bg-primary' : 'bg-bg-border'
      )}
    >
      <span className={clsx(
        'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
        on ? 'translate-x-4' : 'translate-x-0.5'
      )} />
    </button>
  )
}
