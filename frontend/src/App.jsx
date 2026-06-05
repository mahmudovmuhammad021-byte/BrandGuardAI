import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import Layout from './components/layout/Layout'
import Landing  from './pages/Landing'
import Login    from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Scanner   from './pages/Scanner'
import Brands    from './pages/Brands'
import History   from './pages/History'

function PrivateRoute({ children }) {
  const token = useAuthStore(s => s.accessToken)
  return token ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const token = useAuthStore(s => s.accessToken)
  return !token ? children : <Navigate to="/app" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"         element={<Landing />} />
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected */}
        <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index          element={<Dashboard />} />
          <Route path="scanner" element={<Scanner />} />
          <Route path="brands"  element={<Brands />} />
          <Route path="history" element={<History />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
