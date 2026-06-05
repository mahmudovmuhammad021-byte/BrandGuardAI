import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8000/api' : 'https://brandguardai-production.up.railway.app/api'),
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach saved token on startup
const stored = localStorage.getItem('brandguard-auth')
if (stored) {
  try {
    const parsed = JSON.parse(stored)
    const token  = parsed?.state?.accessToken
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  } catch (_) {}
}

// Response interceptor — handle 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('brandguard-auth')
      delete api.defaults.headers.common['Authorization']
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
