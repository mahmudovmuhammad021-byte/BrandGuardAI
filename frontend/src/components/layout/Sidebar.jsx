import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ScanLine, Shield, History, LogOut } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'

const NAV_ITEMS = [
  { to: '/app',         icon: LayoutDashboard, key: 'dashboard', label: 'Dashboard',     badge: 'Live', badgeType: 'primary' },
  { to: '/app/scanner',  icon: ScanLine,        key: 'scanner',   label: 'AI Scanner' },
]

const NAV_MANAGE = [
  { to: '/app/brands',   icon: Shield,   key: 'brands',   label: 'Brand Database' },
  { to: '/app/history',  icon: History,  key: 'history',  label: 'Scan History' },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-bg-surface border-r border-bg-border flex flex-col z-50 max-[900px]:hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-bg-border">
        <div className="w-10 h-10 flex-shrink-0">
          <img src="/logo.png" alt="BrandGuard Logo" className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(99,102,241,0.4)] rounded-md" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-[15px] font-bold text-txt-primary tracking-tight">BrandGuard</span>
          <span className="text-[11px] font-bold gradient-text tracking-[2px]">AI</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
        <NavGroup label={t('sidebar.main', 'MAIN')} items={NAV_ITEMS} />
        <NavGroup label={t('sidebar.management', 'MANAGEMENT')} items={NAV_MANAGE} />
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-bg-border">
        <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/[0.03]">
          <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-content-center shrink-0 flex items-center justify-center text-xs font-bold text-white">
            {user?.initials || 'BG'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-txt-primary truncate">{user?.full_name || 'User'}</p>
            <p className="text-[11px] text-txt-muted capitalize">{user?.role || 'analyst'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md text-txt-muted hover:text-danger hover:bg-danger/10 transition-colors"
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2 px-2">
          <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_6px_#10b981] animate-pulse-dot"/>
          <span className="text-[11px] text-success font-medium">{t('sidebar.system_online', 'System Online')}</span>
        </div>
      </div>
    </aside>
  )
}

function NavGroup({ label, items }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold text-txt-muted uppercase tracking-[1.5px] px-2 mb-1">{label}</span>
      {items.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/app'}
          className={({ isActive }) =>
            clsx('nav-item', isActive && 'active')
          }
        >
          <item.icon size={17} className="shrink-0" />
          <span className="flex-1">{t(`sidebar.${item.key}`, item.label)}</span>
          {item.badge && (
            <span className={clsx(
              'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
              item.badgeType === 'danger'
                ? 'bg-danger/15 text-danger'
                : 'bg-primary/20 text-primary'
            )} id={item.id}>
              {item.badge}
            </span>
          )}
        </NavLink>
      ))}
    </div>
  )
}
