'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Vehicle {
  id: string
  plate: string
  brand: string
  model: string
  year: number | null
  owner_name: string
  owner_phone: string | null
  created_at: string
}

interface Note {
  id: string
  vehicle_id: string
  date: string
  description: string
  cost: number | null
  mechanic: string | null
  created_at: string
}

interface NoteForm {
  date: string
  description: string
  cost: string
  mechanic: string
}

const today = () => new Date().toISOString().split('T')[0]
const emptyNote: NoteForm = { date: today(), description: '', cost: '', mechanic: '' }

export default function VehiclePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<NoteForm>(emptyNote)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const fetchData = async () => {
    const [{ data: v }, { data: n }] = await Promise.all([
      supabase.from('vehicles').select('*').eq('id', params.id).single(),
      supabase.from('service_notes').select('*').eq('vehicle_id', params.id).order('date', { ascending: false }),
    ])
    if (v) setVehicle(v)
    if (n) setNotes(n)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [params.id])

  const handleSaveNote = async () => {
    if (!form.description.trim()) { setError('La descripción es obligatoria.'); return }
    setSaving(true); setError('')
    const { error } = await supabase.from('service_notes').insert({
      vehicle_id: params.id,
      date: form.date,
      description: form.description.trim(),
      cost: form.cost ? parseFloat(form.cost) : null,
      mechanic: form.mechanic.trim() || null,
    })
    setSaving(false)
    if (error) { setError('Error al guardar.'); return }
    setShowModal(false)
    setForm({ ...emptyNote, date: today() })
    fetchData()
  }

  const handleDeleteNote = async (id: string) => {
    await supabase.from('service_notes').delete().eq('id', id)
    fetchData()
  }

  const handleDeleteVehicle = async () => {
    setDeleting(true)
    await supabase.from('vehicles').delete().eq('id', params.id)
    router.push('/')
  }

  const set = (k: keyof NoteForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const formatDate = (d: string) => {
    const [y, m, day] = d.split('-')
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    return `${parseInt(day)} ${months[parseInt(m) - 1]} ${y}`
  }

  if (loading) return <div className="loading" style={{ marginTop: 60 }}>Cargando...</div>
  if (!vehicle) return <div className="loading" style={{ marginTop: 60 }}>Vehículo no encontrado.</div>

  const totalSpent = notes.reduce((s, n) => s + (n.cost || 0), 0)

  return (
    <main className="layout" style={{ padding: '28px 16px 80px' }}>
      <button className="back-link" onClick={() => router.push('/')} style={{ marginBottom: 24 }}>
        ‹ Volver
      </button>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="vehicle-plate" style={{ fontSize: 28, marginBottom: 6 }}>{vehicle.plate}</div>
            <div style={{ fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
              {vehicle.year ? `${vehicle.year} ` : ''}{vehicle.brand} {vehicle.model}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              {vehicle.owner_name}
              {vehicle.owner_phone && <span style={{ marginLeft: 12 }}>📞 {vehicle.owner_phone}</span>}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
              Total invertido
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--accent)' }}>
              S/ {totalSpent.toFixed(2)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
              {notes.length} servicio{notes.length !== 1 ? 's' : ''} registrado{notes.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Historial de servicios
        </h2>
        <button className="btn-primary" onClick={() => { setShowModal(true); setError('') }}>
          + Agregar
        </button>
      </div>

      <div className="card" style={{ marginBottom: 32 }}>
        {notes.length === 0 ? (
          <div className="empty" style={{ padding: '32px 0' }}>
            <div className="empty-icon">📋</div>
            Aún no hay servicios registrados.
          </div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="note-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div className="note-date">{formatDate(note.date)}</div>
                  <div className="note-desc">{note.description}</div>
                  <div className="note-meta">
                    {note.cost != null && <span className="note-cost">S/ {note.cost.toFixed(2)}</span>}
                    {note.mechanic && <span className="note-mechanic">👤 {note.mechanic}</span>}
                  </div>
                </div>
                <button className="btn-danger" style={{ marginLeft: 12, flexShrink: 0 }} onClick={() => handleDeleteNote(note.id)}>
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 12 }}>
          Zona de riesgo
        </div>
        {!confirmDelete ? (
          <button className="btn-danger" onClick={() => setConfirmDelete(true)}>
            Eliminar este vehículo
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, color: 'var(--danger)' }}>¿Estás seguro? Se borrará todo el historial.</span>
            <button className="btn-danger" onClick={handleDeleteVehicle} disabled={deleting} style={{ background: 'var(--danger)', color: '#fff' }}>
              {deleting ? 'Eliminando...' : 'Sí, eliminar'}
            </button>
            <button className="btn-ghost" onClick={() => setConfirmDelete(false)} style={{ fontSize: 13, padding: '6px 14px' }}>
              Cancelar
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="modal">
            <div className="modal-title">Nuevo servicio</div>
            <div className="form-grid">
              <div>
                <label className="form-label">Fecha *</label>
                <input type="date" value={form.date} onChange={set('date')} />
              </div>
              <div>
                <label className="form-label">Descripción del trabajo *</label>
                <textarea
                  placeholder="Cambio de aceite, filtro de aire, revisión de frenos..."
                  value={form.description}
                  onChange={set('description') as any}
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="form-row">
                <div>
                  <label className="form-label">Costo (S/)</label>
                  <input type="number" placeholder="0.00" value={form.cost} onChange={set('cost')} step="0.01" />
                </div>
                <div>
                  <label className="form-label">Mecánico</label>
                  <input placeholder="Arron / asistente..." value={form.mechanic} onChange={set('mechanic')} />
                </div>
              </div>
              {error && <div style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</div>}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button className="btn-ghost" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancelar</button>
                <button className="btn-primary" onClick={handleSaveNote} disabled={saving} style={{ flex: 2 }}>
                  {saving ? 'Guardando...' : 'Guardar servicio'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
