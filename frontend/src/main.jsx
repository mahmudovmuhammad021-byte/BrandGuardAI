import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'
import './i18n'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: '#121826',
          color: '#f1f5f9',
          border: '1px solid #1e2a42',
          borderRadius: '10px',
          fontSize: '13px',
          fontFamily: 'Inter, sans-serif',
        },
        success: { iconTheme: { primary: '#10b981', secondary: '#080b14' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: '#080b14' } },
      }}
    />
  </React.StrictMode>
)
