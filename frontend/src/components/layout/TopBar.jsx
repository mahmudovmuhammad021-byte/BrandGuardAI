import { useLocation } from 'react-router-dom'
import { Search, Bell, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const PAGE_INFO = {
  '/':         { key: 'dashboard',   title: 'Dashboard',      sub: 'Real-time counterfeit monitoring' },
  '/scanner':  { key: 'scanner',     title: 'AI Scanner',     sub: 'Upload product image to analyze' },
  '/alerts':   { key: 'alerts',      title: 'Alerts',         sub: 'Threat notifications & warnings' },
  '/reports':  { key: 'reports',     title: 'Reports',        sub: 'Detection cases & analytics' },
  '/brands':   { key: 'brands',      title: 'Brand Database', sub: 'Manage protected brands' },
  '/history':  { key: 'history',     title: 'Scan History',   sub: 'All past detection results' },
  '/settings': { key: 'settings',    title: 'Settings',       sub: 'Configure platform preferences' },
}

export default function TopBar() {
  const { pathname } = useLocation()
  const { t, i18n } = useTranslation()
  const info = PAGE_INFO[pathname] || { key: 'main', title: 'BrandGuard AI', sub: '' }

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'uz' ? 'en' : 'uz')
  }

  return (
    <header className="h-[68px] bg-bg-surface/80 backdrop-blur-md border-b border-bg-border flex items-center justify-between px-7 sticky top-0 z-40 gap-4">
      <div>
        <h1 className="text-[17px] font-bold text-txt-primary leading-tight">{t(`sidebar.${info.key}`, info.title)}</h1>
        <p className="text-[12px] text-txt-muted">{info.sub}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Language Switcher */}
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 h-10 bg-bg-card border border-bg-border rounded-xl text-txt-secondary hover:text-txt-primary hover:border-primary transition-all font-semibold text-xs"
        >
          <Globe size={14} />
          {i18n.language === 'uz' ? 'UZ' : 'EN'}
        </button>

        {/* Search */}
        <div className="flex items-center gap-2.5 bg-bg-input border border-bg-border rounded-xl px-4 h-10 w-56 focus-within:border-primary focus-within:shadow-glow-primary transition-all">
          <Search size={14} className="text-txt-muted shrink-0" />
          <input
            type="text"
            placeholder={t('topbar.search', 'Search...')}
            className="bg-transparent border-none text-[13px] text-txt-primary placeholder-txt-muted outline-none w-full"
          />
        </div>

        {/* Notifications */}
        <button className="relative w-10 h-10 flex items-center justify-center bg-bg-card border border-bg-border rounded-xl text-txt-secondary hover:text-txt-primary hover:border-primary transition-all">
          <Bell size={17} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger rounded-full text-[9px] font-bold flex items-center justify-center border-2 border-bg-base">
            3
          </span>
        </button>

        {/* System Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-success/8 border border-success/20 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot shadow-[0_0_6px_#10b981]" />
          <span className="text-[11px] font-semibold text-success">{t('sidebar.system_online', 'System Online')}</span>
        </div>
      </div>
    </header>
  )
}
