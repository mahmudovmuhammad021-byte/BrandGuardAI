import { useState, useCallback, useEffect, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, ScanLine, RefreshCw, AlertTriangle, CheckCircle, AlertCircle, Flag, Save, Camera, Image as ImageIcon, Plus, X } from 'lucide-react'
import Webcam from 'react-webcam'
import api from '../api/client'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'

const SCAN_STEPS = [
  'Initializing YOLOv8 engine...',
  'Preprocessing images...',
  'Extracting features...',
  'Analyzing details...',
  'Comparing document/tags...',
  'Scanning barcode / QR...',
  'Comparing brand database...',
  'Calculating confidence score...',
  'Generating report...',
]

function ImageUploadBox({ title, type, file, preview, onDrop, onClear, onOpenCamera, heightClass = "h-56" }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => onDrop(type, accepted),
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
  })

  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-sm font-bold text-txt-secondary flex items-center gap-2">
        <ImageIcon size={16} className="text-primary/70" />
        {title}
      </label>
      <div
        {...getRootProps()}
        className={clsx(
          `relative border-2 rounded-2xl ${heightClass} flex flex-col items-center justify-center transition-all duration-300 overflow-hidden cursor-pointer group`,
          isDragActive 
            ? 'border-primary bg-primary/10 shadow-[0_0_30px_rgba(99,102,241,0.2)] scale-[1.02]' 
            : 'border-dashed border-bg-border bg-bg-surface hover:border-primary/50 hover:bg-bg-surface/80',
          file && 'border-solid border-primary/50 bg-black/20'
        )}
      >
        <input {...getInputProps()} />
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button 
                onClick={(e) => { e.stopPropagation(); onClear(type); }}
                className="bg-danger/90 hover:bg-danger text-white rounded-full px-4 py-2 text-sm font-semibold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg"
                >
                <RefreshCw size={14} /> Boshqa rasm tanlash
                </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-txt-muted gap-3 transform transition-transform duration-300 group-hover:-translate-y-1">
            <div className={clsx(
                "w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300",
                isDragActive ? "bg-primary/20 text-primary" : "bg-bg-base text-txt-muted group-hover:bg-primary/10 group-hover:text-primary"
            )}>
                <Upload size={28} className={isDragActive ? "animate-bounce" : ""} />
            </div>
            <div className="text-center px-4">
                <p className="text-sm font-medium text-txt-primary mb-1">
                    Rasmni shu yerga tashlang yoki <span className="text-primary">kompyuterdan tanlang</span>
                </p>
                <p className="text-xs text-txt-muted mb-4">PNG, JPG, WEBP (Maks: 10MB)</p>
                
                {onOpenCamera && (
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onOpenCamera(); }}
                    className="flex items-center mx-auto justify-center gap-2 px-5 py-2.5 bg-bg-base border border-bg-border rounded-xl text-txt-secondary hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-colors text-sm font-semibold z-10 relative shadow-sm"
                  >
                    <Camera size={16} /> Kamera orqali rasmga olish
                  </button>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Scanner() {
  const [files, setFiles] = useState({ main: null })
  const [previews, setPreviews] = useState({ main: null })
  const [brands,    setBrands]   = useState([])
  const [source,    setSource]   = useState('Manual')
  const [scanning,  setScanning] = useState(false)
  const [stepIdx,   setStepIdx]  = useState(0)
  const [progress,  setProgress] = useState(0)
  const [result,    setResult]   = useState(null)
  
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const webcamRef = useRef(null)

  const { t } = useTranslation()

  const VERDICT_CONFIG = {
    original:    { icon: CheckCircle,   color: 'success', bg: 'bg-success/10 border-success/30',  label: t('scanner.result.original', 'ORIGINAL VERIFIED'),   emoji: '✅' },
    counterfeit: { icon: AlertTriangle, color: 'danger',  bg: 'bg-danger/10 border-danger/30',    label: t('scanner.result.counterfeit', 'COUNTERFEIT DETECTED'),            emoji: '🚨' },
    suspicious:  { icon: AlertCircle,   color: 'warning', bg: 'bg-warning/10 border-warning/30',  label: t('scanner.result.suspicious', 'SUSPICIOUS PRODUCT'),      emoji: '⚠️' },
  }

  useEffect(() => {
    api.get('/brands/?page_size=100').then(r => setBrands(r.data.results || r.data))
  }, [])

  const handleDrop = useCallback((type, accepted) => {
    const f = accepted[0]
    if (!f) return
    setFiles(prev => ({ ...prev, [type]: f }))
    setPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(f) }))
    setResult(null)
  }, [])

  const handleClear = (type) => {
    setFiles(prev => ({ ...prev, [type]: null }))
    setPreviews(prev => ({ ...prev, [type]: null }))
  }

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot()
    if (imageSrc) {
      fetch(imageSrc).then(res => res.blob()).then(blob => {
        const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" })
        handleDrop('main', [file])
        setIsCameraOpen(false)
      })
    }
  }, [handleDrop])

  const handleScan = async () => {
    if (!files.main) {
      toast.error("Asosiy rasmni kiritish majburiy!");
      return;
    }
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
      fd.append('image', files.main)
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
    setFiles({ main: null })
    setPreviews({ main: null })
    setScanning(false)
    setProgress(0)
    setStepIdx(0)
    setResult(null)
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-txt-primary flex items-center gap-2">
                <Camera size={20} className="text-primary" />
                Mahsulotni Skanerlash
            </h2>
            <p className="text-sm text-txt-muted mt-1">Tekshirmoqchi bo'lgan mahsulotingizning aniq rasmini yuklang</p>
          </div>
        </div>

        {/* Media Area */}
        <div className="grid grid-cols-1 gap-4 mt-2">
          <ImageUploadBox 
            title="Mahsulot Asosiy Rasmi *" 
            type="main" 
            file={files.main} 
            preview={previews.main} 
            onDrop={handleDrop} 
            onClear={handleClear}
            onOpenCamera={() => setIsCameraOpen(true)}
            heightClass="h-64"
          />
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3 mt-2">
          <div>
            <label className="block text-xs font-semibold text-txt-secondary mb-1.5">{t('scanner.source', 'Manba')}</label>
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
            disabled={!files.main || scanning}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-[15px] text-white transition-all duration-200',
              !files.main || scanning
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
              <p className="font-semibold text-txt-secondary">AI Skanerlash</p>
              <p className="text-sm mt-1">Kamida asosiy rasmni yuklang.</p>
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
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {result.analysis_points?.map((pt, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 bg-bg-surface rounded-lg text-sm animate-fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
                    <span className="text-base">{pt.icon}</span>
                    <span className="flex-1 text-txt-secondary">{t(`ai_points.${pt.label}`, pt.label)}</span>
                    <span className="text-txt-primary font-medium text-[11px] truncate max-w-[120px]" title={pt.value}>
                      {pt.value.startsWith('Detected: ') 
                        ? (t('ai_points.Detected', 'Detected: ') + pt.value.substring(10))
                        : t(`ai_points.${pt.value}`, pt.value)}
                    </span>
                    <span className={`score-${pt.score} ml-1`}>{t(`ai_points.${pt.score.toUpperCase()}`, pt.score.toUpperCase())}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1 mt-auto">
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
      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-bg-base rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-bg-border animate-fade-in">
            <div className="p-4 border-b border-bg-border flex justify-between items-center bg-bg-surface">
              <h3 className="text-lg font-bold text-txt-primary flex items-center gap-2"><Camera size={18} className="text-primary"/> Kamera orqali skanerlash</h3>
              <button onClick={() => setIsCameraOpen(false)} className="text-txt-muted hover:text-danger bg-bg-base hover:bg-danger/10 p-2 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="relative bg-black flex justify-center items-center h-[500px]">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "environment" }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 pointer-events-none border-[60px] border-black/40"></div>
              <div className="absolute inset-0 pointer-events-none border-2 border-primary/50 m-[60px] border-dashed rounded-xl"></div>
              <div className="absolute bottom-6 left-0 right-0 text-center text-white/70 text-sm font-medium drop-shadow-md">Mahsulotni ramka ichiga joylashtiring</div>
            </div>
            <div className="p-6 flex justify-center bg-bg-surface border-t border-bg-border">
              <button onClick={handleCapture} className="w-16 h-16 rounded-full bg-primary flex items-center justify-center border-4 border-primary/30 hover:scale-110 active:scale-95 transition-transform shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                <Camera size={26} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
