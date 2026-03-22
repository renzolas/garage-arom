'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Vehicle {
  id: string
  plate: string
  brand: string
  model: string
  year: number | null
  owner_name: string
  owner_phone: string | null
}

interface FormData {
  plate: string
  brand: string
  model: string
  year: string
  owner_name: string
  owner_phone: string
}

const empty: FormData = { plate: '', brand: '', model: '', year: '', owner_name: '', owner_phone: '' }

export default function HomePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filtered, setFiltered] = useState<Vehicle[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<FormData>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchVehicles = async () => {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) {
      setVehicles(data)
      setFiltered(data)
    }
    setLoading(false)
  }

  useEffect(() => { fetchVehicles() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    if (!q) { setFiltered(vehicles); return }
    setFiltered(vehicles.filter(v =>
      v.plate.toLowerCase().includes(q) ||
      v.brand.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.owner_name.toLowerCase().includes(q)
    ))
  }, [search, vehicles])

  const handleSave = async () => {
    if (!form.plate || !form.brand || !form.model || !form.owner_name) {
      setError('Placa, marca, modelo y dueño son obligatorios.')
      return
    }
    setSaving(true)
    setError('')
    const { error } = await supabase.from('vehicles').insert({
      plate: form.plate.toUpperCase().trim(),
      brand: form.brand.trim(),
      model: form.model.trim(),
      year: form.year ? parseInt(form.year) : null,
      owner_name: form.owner_name.trim(),
      owner_phone: form.owner_phone.trim() || null,
    })
    setSaving(false)
    if (error) { setError('Error al guardar. Intenta de nuevo.'); return }
    setShowModal(false)
    setForm(empty)
    fetchVehicles()
  }

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <main className="layout" style={{ padding: '28px 16px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
            {vehicles.length} vehículo{vehicles.length !== 1 ? 's' : ''} registrado{vehicles.length !== 1 ? 's' : ''}
          </div>
          <h1 className="page-title">Fichas<span>.</span></h1>
        </div>
        <button className="btn-primary" onClick={() => { setShowModal(true); setError('') }}>
          + Nuevo vehículo
        </button>
      </div>

      <div className="search-wrap" style={{ marginBottom: 20 }}>
        <span className="search-icon">⌕</span>
        <input
          placeholder="Buscar por placa, marca, dueño..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🔧</div>
          {search ? 'Sin resultados para esa búsqueda.' : 'Aún no hay vehículos registrados.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(v => (
            <Link key={v.id} href={`/vehicles/${v.id}`} className="vehicle-item">
              <div>
                <div className="vehicle-plate">{v.plate}</div>
                <div className="vehicle-info">{v.year ? `${v.year} ` : ''}{v.brand} {v.model} · {v.owner_name}</div>
              </div>
              <span className="vehicle-arrow">›</span>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="modal">
            <div className="modal-title">Nuevo vehículo</div>
            <div className="form-grid">
              <div>
                <label className="form-label">Placa *</label>
                <input placeholder="ABC-123" value={form.plate} onChange={set('plate')} />
              </div>
              <div className="form-row">
                <div>
                  <label className="form-label">Marca *</label>
                  <input placeholder="Toyota" value={form.brand} onChange={set('brand')} />
                </div>
                <div>
                  <label className="form-label">Modelo *</label>
                  <input placeholder="Corolla" value={form.model} onChange={set('model')} />
                </div>
              </div>
              <div>
                <label className="form-label">Año</label>
                <input placeholder="2019" value={form.year} onChange={set('year')} type="number" />
              </div>
              <div>
                <label className="form-label">Nombre del dueño *</label>
                <input placeholder="Juan Pérez" value={form.owner_name} onChange={set('owner_name')} />
              </div>
              <div>
                <label className="form-label">Teléfono</label>
                <input placeholder="999 123 456" value={form.owner_phone} onChange={set('owner_phone')} />
              </div>
              {error && <div style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</div>}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button className="btn-ghost" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancelar</button>
                <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 2 }}>
                  {saving ? 'Guardando...' : 'Guardar vehículo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
