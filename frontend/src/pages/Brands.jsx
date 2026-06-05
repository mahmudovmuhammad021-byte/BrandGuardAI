import { useEffect, useState, useRef } from 'react'
import { Search, Plus, X, UploadCloud, Image as ImageIcon } from 'lucide-react'
import api from '../api/client'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'

const PROTECTION_COLORS = {
  standard: 'text-txt-secondary',
  enhanced: 'text-warning',
  maximum:  'text-danger',
}

const PROTECTION_STARS = { standard: '⭐', enhanced: '⭐⭐', maximum: '⭐⭐⭐' }

const CAT_EMOJIS = {
  clothing: '👕', perfumery: '💄', electronics: '📺', cosmetics: '💄', food_beverage: '🍎'
}

export default function Brands() {
  const { user } = useAuthStore()
  const [brands,  setBrands]  = useState([])
  const [search,  setSearch]  = useState('')
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)
  const [detailModal, setDetailModal] = useState(null)
  const [form,    setForm]    = useState({ name: '', emoji: '📦', category: 'clothing', protection_level: 'standard', contact_email: '' })
  const [saving,  setSaving]  = useState(false)
  const [files, setFiles] = useState({ logo: null, main: null })
  
  const fileInputRef = useRef(null)

  useEffect(() => { fetchBrands() }, [])

  const fetchBrands = async () => {
    try {
      const { data } = await api.get('/brands/')
      setBrands(data.results || data)
    } catch {
      toast.error('Failed to load brands')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Brand name is required'); return }
    setSaving(true)
    try {
      // 1. Create brand with logo via FormData
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('emoji', form.emoji)
      fd.append('category', form.category)
      fd.append('protection_level', form.protection_level)
      fd.append('contact_email', form.contact_email)
      if (files.logo) fd.append('logo', files.logo)
      if (files.main) fd.append('ref_main', files.main)

      const { data } = await api.post('/brands/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      // 2. Upload reference images sequentially
      const refImages = [files.main].filter(f => f)
      if (refImages.length > 0) {
        toast.loading(`${refImages.length} ta referens rasm yuklanmoqda...`, { id: 'upload' })
        for (const file of refImages) {
          const fdRef = new FormData()
          fdRef.append('image', file)
          await api.post(`/brands/${data.id}/upload_image/`, fdRef, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        }
        toast.success('Rasmlar yuklandi!', { id: 'upload' })
      }

      // Re-fetch to get updated images list
      const updatedData = await api.get(`/brands/${data.id}/`)
      
      setBrands(prev => [updatedData.data, ...prev])
      setModal(false)
      setForm({ name: '', emoji: '📦', category: 'clothing', protection_level: 'standard', contact_email: '' })
      setFiles({ logo: null, main: null, document: null, detail: null })
      toast.success(`✅ ${data.name} added to brand database!`)
    } catch (e) {
      toast.error('Failed to add brand')
      toast.dismiss('upload')
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (e, brandId) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('image', file)
    
    const toastId = toast.loading('Rasm yuklanmoqda...')
    try {
      const { data } = await api.post(`/brands/${brandId}/upload_image/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Rasm muvaffaqiyatli yuklandi!', { id: toastId })
      setBrands(prev => prev.map(b => b.id === brandId ? data : b))
      setDetailModal(data) // update modal view
    } catch (err) {
      toast.error('Rasm yuklashda xatolik yuz berdi.', { id: toastId })
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const filtered = brands.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  )

  const handleFileChange = (type) => (e) => {
    const f = e.target.files[0]
    if (f) setFiles(prev => ({ ...prev, [type]: f }))
  }

  return (
    <div className="space-y-5 page-enter">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 bg-bg-card border border-bg-border rounded-xl px-4 h-11 flex-1 max-w-sm focus-within:border-primary transition-all">
          <Search size={15} className="text-txt-muted shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search brands..."
            className="bg-transparent border-none text-sm text-txt-primary placeholder-txt-muted outline-none w-full"
          />
        </div>
        <button onClick={() => setModal(true)} className="btn-primary">
          <Plus size={16} /> Yangi Brend
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4 max-[1000px]:grid-cols-2 max-[600px]:grid-cols-1">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-44 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 max-[1000px]:grid-cols-2 max-[600px]:grid-cols-1">
          {filtered.map(brand => (
            <div
              key={brand.id}
              onClick={() => setDetailModal(brand)}
              className="card p-5 hover:bg-bg-hover hover:border-primary hover:-translate-y-1 hover:shadow-glow-primary transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-4">
                {brand.logo ? (
                  <img src={brand.logo} alt={brand.name} className="w-10 h-10 object-contain rounded-md bg-white p-1" />
                ) : (
                  <span className="text-3xl">{brand.emoji}</span>
                )}
                <div className="flex-1">
                  <p className="font-bold text-txt-primary flex items-center gap-2">
                    {brand.name}
                    {brand.is_owner && <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">Sizniki</span>}
                  </p>
                  <p className="text-xs text-txt-muted capitalize">{brand.category.replace('_', ' ')}</p>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 bg-success/12 text-success rounded-full">Active</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-y border-bg-border">
                <div className="text-center">
                  <p className="text-xl font-black text-txt-primary tabular-nums">{brand.total_scans ?? 0}</p>
                  <p className="text-[10px] text-txt-muted">Tekshiruvlar</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-danger tabular-nums">{brand.total_threats ?? 0}</p>
                  <p className="text-[10px] text-txt-muted">Qalbaki Topildi</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-txt-muted">Himoya</span>
                <span className={`text-xs font-semibold capitalize ${PROTECTION_COLORS[brand.protection_level]}`}>
                  {PROTECTION_STARS[brand.protection_level]} {brand.protection_level}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Brand Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-bg-border rounded-2xl w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.6)] animate-fade-in max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-bg-border shrink-0">
              <h3 className="font-bold text-[16px]">Yangi brend qo'shish</h3>
              <button onClick={() => { setModal(false); setFiles({ logo: null, main: null, document: null, detail: null }); }} className="text-txt-muted hover:text-txt-primary transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Brand Profile Images */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="p-3 border border-dashed border-bg-border rounded-xl bg-bg-base/50 relative hover:border-primary/50 transition-colors">
                  <label className="block text-[11px] font-semibold text-txt-secondary mb-2">Brend Logosi</label>
                  <input type="file" accept="image/*" onChange={handleFileChange('logo')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="flex items-center gap-2 text-primary">
                    <ImageIcon size={16} />
                    <span className="text-xs truncate">{files.logo ? files.logo.name : "Tanlash..."}</span>
                  </div>
                </div>
                <div className="p-3 border border-bg-border rounded-xl bg-bg-base/50">
                  <label className="block text-[11px] font-semibold text-txt-secondary mb-2">Emoji (ixtiyoriy)</label>
                  <input value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
                    className="w-full bg-transparent border-none text-xl text-center outline-none" maxLength={2} placeholder="📦" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-txt-secondary mb-1.5">Brend Nomi *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Masalan: Nike" className="input-field" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-txt-secondary mb-1.5">Kategoriya</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                    {Object.entries(CAT_EMOJIS).map(([k, v]) =>
                      <option key={k} value={k}>{v} {k.replace('_', ' ')}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-txt-secondary mb-1.5">Himoya darajasi</label>
                  <select value={form.protection_level} onChange={e => setForm(f => ({ ...f, protection_level: e.target.value }))} className="input-field">
                    <option value="standard">Standard</option>
                    <option value="enhanced">Enhanced</option>
                    <option value="maximum">Maximum</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-txt-secondary mb-1.5">Aloqa Email</label>
                <input value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))}
                  type="email" placeholder="legal@brand.uz" className="input-field" />
              </div>
              
              <div className="pt-3 border-t border-bg-border">
                <p className="text-xs font-bold text-txt-primary mb-3">Asl mahsulot rasmlari (Reference Images)</p>
                <div className="mb-4">
                <label className="block text-xs font-semibold text-txt-secondary mb-1.5">Brend Rasmlari</label>
                <div className="grid grid-cols-1 gap-3">
                  <div className="p-3 border border-dashed border-bg-border rounded-xl bg-bg-base/50 relative hover:border-primary/50 transition-colors">
                    <label className="block text-[11px] font-semibold text-txt-secondary mb-1">Mahsulot Rasmi (Reference)</label>
                    <input type="file" accept="image/*" onChange={handleFileChange('main')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <span className="text-xs text-primary font-medium truncate block">{files.main ? files.main.name : "Katalog yoki asosiy ko'rinish rasmi"}</span>
                  </div>
                </div>
              </div>           </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-bg-border shrink-0">
              <button onClick={() => { setModal(false); setFiles({ logo: null, main: null }); }} className="btn-outline py-2 px-4 text-sm">Bekor qilish</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary py-2 px-5 text-sm">
                {saving ? 'Saqlanmoqda...' : "Brendni qo'shish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brand Details & Upload Modal */}
      {detailModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-bg-border rounded-2xl w-full max-w-lg shadow-[0_20px_60px_rgba(0,0,0,0.6)] animate-fade-in max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-bg-border shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{detailModal.emoji}</span>
                <h3 className="font-bold text-[18px]">{detailModal.name}</h3>
              </div>
              <button onClick={() => setDetailModal(null)} className="text-txt-muted hover:text-txt-primary transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-txt-secondary border-b border-bg-border pb-2">Brendga tegishli original rasmlar</h4>
                
                {(!detailModal.reference_images || detailModal.reference_images.length === 0) ? (
                  <div className="py-8 text-center bg-bg-card rounded-lg border border-dashed border-bg-border">
                    <ImageIcon size={32} className="mx-auto text-txt-muted mb-2 opacity-50" />
                    <p className="text-sm text-txt-muted">Hozircha rasmlar yuklanmagan.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {detailModal.reference_images.map(img => (
                      <div key={img.id} className="aspect-square rounded-lg overflow-hidden border border-bg-border bg-bg-card">
                        <img src={img.image} alt="Reference" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {(detailModal.is_owner || user?.role === 'admin') && (
                <div className="pt-2">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, detailModal.id)}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full btn-outline border-dashed py-4 justify-center text-sm font-medium hover:bg-primary/5 hover:border-primary hover:text-primary transition-all"
                  >
                    <UploadCloud size={18} className="mr-2" />
                    Yangi mahsulot rasmini yuklash
                  </button>
                  <p className="text-center text-[11px] text-txt-muted mt-2">
                    AI ushbu rasmlar orqali orginal mahsulotingizni taniydi
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
