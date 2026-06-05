import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export default function Login() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const { login, isLoading, error } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(email, password)
    if (result.success) {
      toast.success('Welcome back! 👋')
      navigate('/')
    } else {
      toast.error(result.error)
    }
  }

  const fillDemo = () => {
    setEmail('admin@brandguard.uz')
    setPassword('admin123')
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[400px] relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 mb-4">
            <svg viewBox="0 0 40 40" fill="none" className="w-full h-full drop-shadow-[0_0_16px_rgba(99,102,241,0.5)]">
              <path d="M20 4L36 12V28L20 36L4 28V12L20 4Z" stroke="url(#lg1)" strokeWidth="2"/>
              <path d="M20 10L30 15V25L20 30L10 25V15L20 10Z" fill="url(#lg2)" opacity="0.4"/>
              <circle cx="20" cy="20" r="4" fill="url(#lg1)"/>
              <defs>
                <linearGradient id="lg1" x1="4" y1="4" x2="36" y2="36">
                  <stop offset="0%" stopColor="#6366f1"/>
                  <stop offset="100%" stopColor="#06b6d4"/>
                </linearGradient>
                <linearGradient id="lg2" x1="10" y1="10" x2="30" y2="30">
                  <stop offset="0%" stopColor="#6366f1"/>
                  <stop offset="100%" stopColor="#06b6d4"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-txt-primary">Welcome back</h1>
          <p className="text-txt-muted text-sm mt-1">Sign in to BrandGuard AI</p>
        </div>

        <div className="card p-8 shadow-card">
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-txt-secondary mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@brandguard.uz"
                  required
                  className="input-field pl-9"
                  id="login-email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-txt-secondary mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-field pl-9 pr-10"
                  id="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-primary"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary justify-center py-3 text-base mt-2"
              id="login-submit"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Shield size={16} />
                  Sign in
                </span>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <button
            onClick={fillDemo}
            className="w-full mt-3 py-2 text-xs text-txt-muted border border-dashed border-bg-border rounded-lg hover:border-primary/40 hover:text-primary transition-all"
          >
            🔑 Fill demo credentials (admin@brandguard.uz / admin123)
          </button>

          <p className="text-center text-sm text-txt-muted mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:text-teal transition-colors">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
