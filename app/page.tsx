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
      <div
