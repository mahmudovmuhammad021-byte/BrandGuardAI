/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base:    '#080b14',
          surface: '#0e1320',
          card:    '#121826',
          hover:   '#161d2e',
          border:  '#1e2a42',
          input:   '#0d1322',
        },
        primary:  '#6366f1',
        teal:     '#06b6d4',
        success:  '#10b981',
        danger:   '#ef4444',
        warning:  '#f59e0b',
        purple:   '#8b5cf6',
        txt: {
          primary:   '#f1f5f9',
          secondary: '#94a3b8',
          muted:     '#475569',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in':   'fadeIn 0.3s ease',
        'slide-in':  'slideIn 0.3s ease',
        'pulse-dot': 'pulseDot 2s infinite',
        'spin-slow': 'spin 2s linear infinite',
        'scan-move': 'scanMove 2s linear infinite',
      },
      keyframes: {
        fadeIn:   { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideIn:  { from: { opacity: 0, transform: 'translateX(-12px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        pulseDot: { '0%,100%': { opacity: 1, transform: 'scale(1)' }, '50%': { opacity: 0.7, transform: 'scale(0.85)' } },
        scanMove: { '0%': { top: '16px' }, '100%': { top: 'calc(100% - 16px)' } },
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(99,102,241,0.25)',
        'glow-teal':    '0 0 20px rgba(6,182,212,0.2)',
        'glow-red':     '0 0 20px rgba(239,68,68,0.2)',
        'card':         '0 4px 24px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
