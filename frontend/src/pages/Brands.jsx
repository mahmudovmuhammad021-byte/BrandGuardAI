import { useEffect, useState } from 'react'
import { Search, Plus, X } from 'lucide-react'
import api from '../api/client'
import toast from 'react-hot-toast'

const PROTECTION_COLORS = {
  standard: 'text-txt-secondary',
  enhanced: 'text-warning',
  maximum:  'text-danger',
}

const PROTECTION_STARS = { standard: '⭐', enhanced: '⭐⭐', maximum: '⭐⭐⭐' }

const CAT_EMOJIS = {
  clothing: '👕', perfumery: '💄',
}

export default function Brands() {
  const [brands,  setBrands]  = useState([])
  const [search,  setSearch]  = useState('')
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)
  const [form,    setForm]    = useState({ name: '', emoji: '📦', category: 'clothing', protection_level: 'standard', contact_email: '' })
  const [saving,  setSaving]  = useState(false)

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
      const { data } = await api.post('/brands/', form)
      setBrands(prev => [data, ...prev])
      setModal(false)
      setForm({ name: '', emoji: '📦', category: 'clothing', protection_level: 'standard', contact_email: '' })
      toast.success(`✅ ${data.name} added to brand database!`)
    } catch (e) {
      toast.error('Failed to add brand')
    } finally {
      setSaving(false)
    }
  }

  const filtered = brands.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  )

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
          <Plus size={16} /> Add Brand
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
              className="card p-5 hover:bg-bg-hover hover:border-primary hover:-translate-y-1 hover:shadow-glow-primary transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{brand.emoji}</span>
                <div className="flex-1">
                  <p className="font-bold text-txt-primary">{brand.name}</p>
                  <p className="text-xs text-txt-muted capitalize">{brand.category.replace('_', ' ')}</p>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 bg-success/12 text-success rounded-full">Active</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-y border-bg-border">
                <div className="text-center">
                  <p className="text-xl font-black text-txt-primary tabular-nums">{brand.total_scans ?? 0}</p>
                  <p className="text-[10px] text-txt-muted">Total Scans</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-danger tabular-nums">{brand.total_threats ?? 0}</p>
                  <p className="text-[10px] text-txt-muted">Threats</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-txt-muted">Protection</span>
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-bg-border rounded-2xl w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.6)] animate-fade-in">
            <div className="flex items-center justify-between px-6 py-5 border-b border-bg-border">
              <h3 className="font-bold text-[16px]">Add New Brand</h3>
              <button onClick={() => setModal(false)} className="text-txt-muted hover:text-txt-primary transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-[64px_1fr] gap-3 items-end">
                <div>
                  <label className="block text-xs font-semibold text-txt-secondary mb-1.5">Emoji</label>
                  <input value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
                    className="input-field text-center text-xl" maxLength={2} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-txt-secondary mb-1.5">Brand Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Artel Electronics" className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-txt-secondary mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                    {Object.entries(CAT_EMOJIS).map(([k, v]) =>
                      <option key={k} value={k}>{v} {k.replace('_', ' ')}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-txt-secondary mb-1.5">Protection Level</label>
                  <select value={form.protection_level} onChange={e => setForm(f => ({ ...f, protection_level: e.target.value }))} className="input-field">
                    <option value="standard">Standard</option>
                    <option value="enhanced">Enhanced</option>
                    <option value="maximum">Maximum</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-txt-secondary mb-1.5">Contact Email</label>
                <input value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))}
                  type="email" placeholder="legal@brand.uz" className="input-field" />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-bg-border">
              <button onClick={() => setModal(false)} className="btn-outline py-2 px-4 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary py-2 px-5 text-sm">
                {saving ? 'Saving...' : 'Add Brand'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
