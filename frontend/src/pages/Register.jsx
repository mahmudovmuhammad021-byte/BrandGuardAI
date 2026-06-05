import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', password2: '', role: 'user' })
  const [showPwd, setShowPwd] = useState(false)
  const { register, isLoading, error } = useAuthStore()
  const navigate = useNavigate()

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password2) {
      toast.error('Passwords do not match!')
      return
    }
    const result = await register(form.email, form.fullName, form.password, form.password2, form.role)
    if (result.success) {
      toast.success('Account created! Welcome to Verix 🚀')
      navigate('/')
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-teal/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full gradient-bg flex items-center justify-center mb-4 shadow-glow-primary">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-txt-primary">Create account</h1>
          <p className="text-txt-muted text-sm mt-1">Join Verix Platform</p>
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
              <label className="block text-xs font-semibold text-txt-secondary mb-1.5">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
                <input
                  name="fullName" value={form.fullName} onChange={handleChange}
                  type="text" placeholder="Bekmurod Umarov" required
                  className="input-field pl-9" id="reg-fullname"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-txt-secondary mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
                <input
                  name="email" value={form.email} onChange={handleChange}
                  type="email" placeholder="you@company.uz" required
                  className="input-field pl-9" id="reg-email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-txt-secondary mb-1.5">Rolingizni tanlang</label>
              <select
                name="role" value={form.role} onChange={handleChange}
                className="input-field" id="reg-role"
              >
                <option value="user">Oddiy Foydalanuvchi</option>
                <option value="entrepreneur">Tadbirkor (O'z brendiga ega)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-txt-secondary mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
                <input
                  name="password" value={form.password} onChange={handleChange}
                  type={showPwd ? 'text' : 'password'} placeholder="Min. 6 characters" required
                  minLength={6} className="input-field pl-9 pr-10" id="reg-password"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-primary">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-txt-secondary mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
                <input
                  name="password2" value={form.password2} onChange={handleChange}
                  type="password" placeholder="Repeat password" required
                  className="input-field pl-9" id="reg-password2"
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full btn-primary justify-center py-3 text-base mt-1" id="reg-submit">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-txt-muted mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:text-teal transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
