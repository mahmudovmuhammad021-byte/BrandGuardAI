import { Link } from 'react-router-dom'
import { Shield, ScanLine, Bell, CheckCircle, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function Landing() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-bg-base text-txt-primary font-sans selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 h-20 border-b border-bg-border/50 bg-bg-base/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold tracking-tight">BrandGuard</span>
              <span className="text-xs font-bold gradient-text tracking-[2px]">AI</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold hover:text-primary transition-colors">
              {t('auth.login', 'Log In')}
            </Link>
            <Link to="/register" className="btn-primary py-2 px-5 text-sm">
              {t('auth.register', 'Get Started')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Brand Protection Powered by YOLOv8
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Protect Your Brand <br className="hidden lg:block" />
            <span className="gradient-text">With Intelligent AI</span>
          </h1>
          
          <p className="text-lg text-txt-secondary max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Detect counterfeit products instantly. Upload an image or use your camera to verify authenticity in real-time, protecting your customers and your reputation.
          </p>
          
          <div className="flex items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link to="/app/scanner" className="btn-primary py-3.5 px-8 text-base shadow-[0_0_24px_rgba(99,102,241,0.4)] flex items-center gap-2">
              <ScanLine size={20} />
              Start Scanning
            </Link>
            <Link to="/login" className="btn-outline py-3.5 px-8 text-base flex items-center gap-2 border-bg-border hover:bg-bg-surface">
              View Dashboard <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-bg-surface/50 border-t border-bg-border relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose BrandGuard AI?</h2>
            <p className="text-txt-secondary max-w-xl mx-auto">Our platform combines cutting-edge computer vision with a seamless user experience to give you absolute control over your brand's integrity.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<ScanLine size={28} className="text-primary" />}
              title="Instant Detection"
              description="Use your device camera or upload product photos to instantly verify whether a product is original or counterfeit."
            />
            <FeatureCard 
              icon={<Shield size={28} className="text-teal" />}
              title="Advanced Analytics"
              description="Keep track of all scans and analyze geographic data to identify where counterfeit products are emerging."
            />
            <FeatureCard 
              icon={<Bell size={28} className="text-purple" />}
              title="Real-Time Alerts"
              description="Get instantly notified when highly suspicious products are scanned anywhere in the world."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-bg-border text-txt-muted text-sm">
        <p>&copy; {new Date().getFullYear()} BrandGuard AI. All rights reserved.</p>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="card p-8 hover:-translate-y-1 transition-transform duration-300 border border-bg-border bg-bg-base/50">
      <div className="w-14 h-14 rounded-2xl bg-bg-surface border border-bg-border flex items-center justify-center mb-6 shadow-lg">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-txt-secondary leading-relaxed">{description}</p>
    </div>
  )
}
