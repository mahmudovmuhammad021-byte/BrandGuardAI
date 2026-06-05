import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, ScanLine, RefreshCw, AlertTriangle, CheckCircle, AlertCircle, Flag, Save } from 'lucide-react'
import api from '../api/client'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'

const SCAN_STEPS = [
  'Initializing YOLOv8 engine...',
  'Preprocessing image...',
  'Extracting logo features...',
  'Analyzing color profile...',
  'Checking font signatures...',
  'Scanning barcode / QR...',
  'Comparing brand database...',
  'Calculating confidence score...',
  'Generating report...',
]

export default function Scanner() {
  const [file,      setFile]     = useState(null)
  const [preview,   setPreview]  = useState(null)
  const [brands,    setBrands]   = useState([])
  const [brandId,   setBrandId]  = useState('')
  const [source,    setSource]   = useState('Manual')
  const [scanning,  setScanning] = useState(false)
  const [stepIdx,   setStepIdx]  = useState(0)
  const [progress,  setProgress] = useState(0)
  const [result,    setResult]   = useState(null)
  
  const { t } = useTranslation()

  const VERDICT_CONFIG = {
    original:    { icon: CheckCircle,   color: 'success', bg: 'bg-success/10 border-success/30',  label: t('scanner.result.original', 'ORIGINAL VERIFIED'),   emoji: '✅' },
    counterfeit: { icon: AlertTriangle, color: 'danger',  bg: 'bg-danger/10 border-danger/30',    label: t('scanner.result.counterfeit', 'COUNTERFEIT DETECTED'),            emoji: '🚨' },
    suspicious:  { icon: AlertCircle,   color: 'warning', bg: 'bg-warning/10 border-warning/30',  label: t('scanner.result.suspicious', 'SUSPICIOUS PRODUCT'),      emoji: '⚠️' },
  }

  useEffect(() => {
    api.get('/brands/?page_size=100').then(r => setBrands(r.data.results || r.data))
  }, [])

  const onDrop = useCallback((accepted) => {
    const f = accepted[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    noClick: !!file,
  })

  const handleScan = async () => {
    if (!file) return
    setScanning(true)
    setStepIdx(0)
    setProgress(0)

    // Animate steps
    const stepTimer = setInterval(() => {
      setStepIdx(i => {
        const next = i + 1
        setProgress(Math.round((next / SCAN_STEPS.length) * 100))
        if (next >= SCAN_STEPS.length) clearInterval(stepTimer)
        return next
      })
    }, 400)

    try {
      const fd = new FormData()
      fd.append('image', file)
      if (brandId) fd.append('brand', brandId)
      fd.append('source', source)

      const { data } = await api.post('/scans/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setTimeout(() => {
        clearInterval(stepTimer)
        setScanning(false)
        setResult(data)
        setProgress(100)

        if (data.verdict === 'counterfeit') toast.error('🚨 ' + t('scanner.result.counterfeit'))
        else if (data.verdict === 'original') toast.success('✅ ' + t('scanner.result.original'))
        else toast('⚠️ ' + t('scanner.result.suspicious'), { icon: '⚠️' })
      }, SCAN_STEPS.length * 410)

    } catch (err) {
      clearInterval(stepTimer)
      setScanning(false)
      toast.error('Analysis failed: ' + (err.response?.data?.error || 'Server error'))
    }
  }

  const handleReset = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    setScanning(false)
    setProgress(0)
    setStepIdx(0)
  }

  const handleReport = async () => {
    if (!result?.id) return
    await api.post(`/scans/${result.id}/report/`)
    toast.success('📋 Case reported to authorities!')
  }

  const conf = result?.confidence || 0
  const confColor = conf >= 80 ? 'from-success to-teal' : conf >= 60 ? 'from-warning to-danger' : 'from-danger to-warning'

  return (
    <div className="grid grid-cols-[1fr_380px] gap-6 page-enter max-[900px]:grid-cols-1">

      {/* Left — Upload Panel */}
      <div className="card p-8 flex flex-col gap-6">
        <h2 className="text-base font-semibold text-txt-primary">{t('scanner.upload_title', 'Upload Product Image')}</h2>

        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={clsx(
            'relative border-2 border-dashed rounded-xl min-h-[320px] flex flex-col items-center justify-center transition-all duration-200 overflow-hidden cursor-pointer',
            isDragActive ? 'border-primary bg-primary/5 shadow-glow-primary' : 'border-bg-border hover:border-primary/50',
            file && 'border-primary border-solid'
          )}
        >
          <input {...getInputProps()} />

          {/* Scan line animation */}
          {scanning && (
            <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-teal to-transparent shadow-[0_0_8px_#06b6d4] animate-scan-move z-10" />
          )}

          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-contain p-4 max-h-[320px]" />
          ) : (
            <div className="flex flex-col items-center gap-3 text-txt-muted p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                <Upload size={28} className="text-primary" />
              </div>
              <p className="text-[16px] font-semibold text-txt-secondary">{t('scanner.drag_drop', 'Drop product image here')}</p>
              <p className="text-sm">{t('scanner.browse', 'or click to browse')} · PNG, JPG, WEBP</p>
            </div>
          )}

          {/* Corner markers */}
          {['top-3 left-3 border-t border-l', 'top-3 right-3 border-t border-r',
            'bottom-3 left-3 border-b border-l', 'bottom-3 right-3 border-b border-r'].map((cls, i) => (
            <div key={i} className={`absolute w-5 h-5 border-primary ${cls}`} />
          ))}
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-txt-secondary mb-1.5">{t('scanner.brand', 'Brand')}</label>
            <select value={brandId} onChange={e => setBrandId(e.target.value)} className="input-field">
              <option value="">Select brand...</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.emoji} {b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-txt-secondary mb-1.5">{t('scanner.source', 'Source')}</label>
            <select value={source} onChange={e => setSource(e.target.value)} className="input-field">
              {['Manual', 'Olx.uz', 'Telegram', 'Instagram', 'Uzum.uz', 'Other'].map(s =>
                <option key={s}>{s}</option>
              )}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleScan}
            disabled={!file || scanning}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-[15px] text-white transition-all duration-200',
              !file || scanning
                ? 'bg-bg-border text-txt-muted cursor-not-allowed'
                : 'gradient-bg shadow-[0_4px_16px_rgba(99,102,241,0.3)] hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)]'
            )}
            id="btn-analyze"
          >
            <ScanLine size={18} />
            {scanning ? 'Analyzing...' : t('scanner.analyze_btn', 'Analyze Product')}
          </button>
          <button onClick={handleReset} className="btn-outline py-3.5 px-5">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Right — Results Panel */}
      <div className="card p-7 relative overflow-hidden flex flex-col">

        {/* Scanning Overlay */}
        {scanning && (
          <div className="absolute inset-0 bg-bg-base/95 backdrop-blur-sm flex flex-col items-center justify-center gap-5 z-20 rounded-xl">
            <div className="relative w-20 h-20">
              {[0, 1, 2].map(i => (
                <div key={i} className={clsx(
                  'absolute rounded-full border-2 border-transparent animate-spin',
                  i === 0 && 'inset-0 border-t-primary',
                  i === 1 && 'inset-2 border-t-teal animate-spin-slow',
                  i === 2 && 'inset-4 border-t-purple'
                )} style={{ animationDuration: `${1 + i * 0.5}s`, animationDirection: i % 2 ? 'reverse' : 'normal' }} />
              ))}
              <div className="absolute inset-6 flex items-center justify-center">
                <ScanLine size={20} className="text-txt-secondary" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-[14px] font-medium text-txt-secondary">{SCAN_STEPS[Math.min(stepIdx, SCAN_STEPS.length - 1)]}</p>
            </div>
            <div className="w-48 h-1 bg-bg-border rounded-full overflow-hidden">
              <div className="h-full gradient-bg rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-txt-muted font-mono">{progress}%</p>
          </div>
        )}

        {/* Placeholder */}
        {!result && !scanning && (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-txt-muted gap-4">
            <div className="w-20 h-20 rounded-full bg-bg-surface flex items-center justify-center">
              <ScanLine size={32} className="opacity-30" />
            </div>
            <div>
              <p className="font-semibold text-txt-secondary">{t('scanner.subtitle', 'Upload product image to analyze')}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !scanning && (() => {
          const cfg = VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.suspicious
          return (
            <div className="flex flex-col gap-5 animate-fade-in">
              {/* Verdict header */}
              <div className={`flex items-center gap-4 p-4 rounded-xl border ${cfg.bg}`}>
                <span className="text-3xl">{cfg.emoji}</span>
                <div>
                  <p className={`text-[15px] font-bold text-${cfg.color}`}>{cfg.label}</p>
                  <p className="text-xs text-txt-secondary mt-0.5">
                    {result.brand_info ? `${result.brand_info.emoji} ${result.brand_info.name}` : 'No brand selected'} · Engine: {result.engine}
                  </p>
                </div>
              </div>

              {/* Confidence */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-txt-secondary font-medium">{t('scanner.result.score', 'Authenticity Score')}</span>
                  <span className="font-black text-txt-primary tabular-nums">{conf.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-bg-border rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${confColor} rounded-full transition-all duration-1000`} style={{ width: `${conf}%` }} />
                </div>
              </div>

              {/* Analysis Points */}
              <div className="space-y-2">
                {result.analysis_points?.map((pt, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 bg-bg-surface rounded-lg text-sm animate-fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
                    <span className="text-base">{pt.icon}</span>
                    <span className="flex-1 text-txt-secondary">{t(`ai_points.${pt.label}`, pt.label)}</span>
                    <span className="text-txt-primary font-medium text-xs">
                      {pt.value.startsWith('Detected: ') 
                        ? (t('ai_points.Detected', 'Detected: ') + pt.value.substring(10))
                        : t(`ai_points.${pt.value}`, pt.value)}
                    </span>
                    <span className={`score-${pt.score} ml-1`}>{t(`ai_points.${pt.score.toUpperCase()}`, pt.score.toUpperCase())}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                {result.verdict !== 'original' && (
                  <button onClick={handleReport} className="flex-1 btn-danger py-2.5 justify-center text-sm">
                    <Flag size={14} /> {t('scanner.result.report', 'Report')}
                  </button>
                )}
                <button
                  onClick={() => toast.success('Scan saved to reports!')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary/10 border border-primary/30 rounded-lg text-primary text-sm font-semibold hover:bg-primary/20 transition-all"
                >
                  <Save size={14} /> {t('scanner.result.save', 'Save')}
                </button>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
