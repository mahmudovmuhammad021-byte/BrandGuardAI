import React from 'react'
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
import Pricing   from './pages/Pricing'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: 'red', backgroundColor: 'black', height: '100vh' }}>
          <h1>Something went wrong.</h1>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.toString()}</pre>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

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
    <ErrorBoundary>
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
            <Route path="pricing" element={<Pricing />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
