import React, { useState, useEffect } from 'react'
import apiClient from '../apiClient'
import {
  SlidersHorizontal, ShieldCheck, Edit3, CheckCircle2,
  UserCircle, Loader2, TrendingUp
} from 'lucide-react'

const TRAIT_META = {
  cleanliness: { label: 'Cleanliness',  color: '#6366f1', emoji: '🧹', weight: '×2' },
  discipline:  { label: 'Discipline',   color: '#3b82f6', emoji: '📚', weight: '×1.5' },
  social:      { label: 'Social',       color: '#10b981', emoji: '🤝', weight: '×1' },
  noise:       { label: 'Noise Level',  color: '#f59e0b', emoji: '🔊', weight: '×1.5' },
  sleep:       { label: 'Sleep',        color: '#8b5cf6', emoji: '😴', weight: '×2' },
  emotional:   { label: 'Emotional',    color: '#ec4899', emoji: '💬', weight: '×1.5' },
}

const Profile = () => {
  const [profile,  setProfile]  = useState(null)
  const [vectors,  setVectors]  = useState({})
  const [name,     setName]     = useState('')
  const [loading,  setLoading]  = useState(true)
  const [status,   setStatus]   = useState(null)
  const [editMode, setEditMode] = useState(false)

  const loadProfile = async () => {
    try {
      const res = await apiClient.get('/profile')
      const data = res.data.data
      setProfile(data)
      setName(data.name || '')
      setVectors(data.compliance_factors || {})
    } catch (err) {
      console.error('Profile load error', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProfile() }, [])

  const handleSave = async () => {
    setStatus({ type: 'loading' })
    try {
      await apiClient.put('/profile', { name, ...vectors })
      setStatus({ type: 'success', text: '✅ Profile updated! Matching engine recalibrated.' })
      setEditMode(false)
      loadProfile()
    } catch (err) {
      setStatus({ type: 'error', text: err.response?.data?.description || 'Update failed.' })
    }
  }

  const handleCancel = () => {
    setEditMode(false)
    setStatus(null)
    loadProfile()
  }

  if (loading) {
    return (
      <div className="spinner-overlay">
        <div className="spinner" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div style={{ padding: 32 }}>
        <div className="alert alert-error">
          Failed to load profile. Is the Flask backend running?
        </div>
      </div>
    )
  }

  const trustPct  = Math.min(100, profile.trust_score || 0)
  const trustColor = trustPct >= 70 ? '#10b981' : trustPct >= 40 ? '#f59e0b' : '#ef4444'
  const initial   = (profile.name || 'S').charAt(0).toUpperCase()

  return (
    <div style={{ padding: '32px', maxWidth: 900, margin: '0 auto' }} className="animate-in">

      {/* ── Hero banner ── */}
      <div className="hero-banner" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          {/* Avatar */}
          <div style={{
            width: 88, height: 88, flexShrink: 0,
            background: 'rgba(255,255,255,.15)',
            border: '2px solid rgba(255,255,255,.3)',
            borderRadius: 22,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, fontWeight: 900, color: 'white',
          }}>
            {initial}
          </div>

          <div style={{ flex: 1 }}>
            {/* Name (editable) */}
            {!editMode ? (
              <h1 style={{ fontSize: 30, fontWeight: 900, color: 'white', letterSpacing: -0.5, marginBottom: 4 }}>
                {profile.name}
              </h1>
            ) : (
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{
                  fontSize: 26, fontWeight: 900, color: 'white',
                  background: 'rgba(255,255,255,.12)',
                  border: '1px solid rgba(255,255,255,.3)',
                  borderRadius: 10, padding: '6px 14px',
                  outline: 'none', marginBottom: 4,
                  width: '100%', maxWidth: 360
                }}
              />
            )}
            <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 14, marginBottom: 12 }}>{profile.email}</p>

            {/* Badges */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{
                background: 'rgba(16,185,129,.2)', border: '1px solid rgba(16,185,129,.4)',
                color: '#6ee7b7', borderRadius: 999, padding: '4px 12px',
                fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6
              }}>
                <ShieldCheck size={13} /> Trust: {profile.trust_score?.toFixed(1)} / 100
              </span>
              {profile.is_verified && (
                <span style={{
                  background: 'rgba(99,102,241,.2)', border: '1px solid rgba(99,102,241,.4)',
                  color: '#a5b4fc', borderRadius: 999, padding: '4px 12px',
                  fontSize: 12, fontWeight: 700
                }}>
                  ✓ Verified
                </span>
              )}
              <span style={{
                background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.1)',
                color: 'rgba(255,255,255,.5)', borderRadius: 999, padding: '4px 12px',
                fontSize: 11, fontWeight: 600, fontFamily: 'monospace'
              }}>
                Joined {new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="btn btn-ghost"
              style={{ color: 'white', borderColor: 'rgba(255,255,255,.25)', background: 'rgba(255,255,255,.1)' }}
            >
              <Edit3 size={15} /> Edit Profile
            </button>
          )}
        </div>

        {/* Trust bar */}
        <div style={{ marginTop: 24, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>
              <TrendingUp size={12} style={{ display: 'inline', marginRight: 4 }} />
              TRUST SCORE
            </span>
            <span style={{ fontSize: 12, color: trustColor, fontWeight: 800 }}>{trustPct.toFixed(1)} / 100</span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,.15)', borderRadius: 999 }}>
            <div style={{
              height: '100%', width: `${trustPct}%`,
              background: trustColor,
              borderRadius: 999,
              transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: `0 0 10px ${trustColor}80`
            }} />
          </div>
        </div>
      </div>

      {/* ── Status banner ── */}
      {status?.text && (
        <div className={`alert ${status.type === 'error' ? 'alert-error' : 'alert-success'}`}
             style={{ marginBottom: 20 }}>
          {status.text}
        </div>
      )}

      {/* ── Trait sliders ── */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 19, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
              <SlidersHorizontal size={20} color="#6366f1" /> Personality Traits
            </h2>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
              These traits power the AI matching engine. Higher weight = more impact on your matches.
            </p>
          </div>
          {!editMode && (
            <span style={{
              fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#c7d2fe',
              background: '#eef2ff', padding: '4px 12px', borderRadius: 8, border: '1px solid #e0e7ff'
            }}>
              LOCKED
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {Object.entries(TRAIT_META).map(([key, meta]) => {
            const val = vectors[key] ?? 5
            return (
              <div key={key} style={{
                padding: 18,
                background: editMode ? '#fafbff' : '#f8fafc',
                borderRadius: 12,
                border: `1px solid ${editMode ? '#c7d2fe' : '#e2e8f0'}`,
                opacity: editMode ? 1 : 0.7,
                transition: 'all .2s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{meta.emoji}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{meta.label}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>Weight {meta.weight}</div>
                    </div>
                  </div>
                  <span style={{
                    background: meta.color, color: 'white',
                    borderRadius: 8, padding: '2px 10px',
                    fontSize: 14, fontWeight: 800
                  }}>
                    {val}
                  </span>
                </div>
                <div className="progress-bar" style={{ marginBottom: 10 }}>
                  <div className="progress-fill" style={{
                    width: `${(val / 10) * 100}%`,
                    background: `linear-gradient(90deg, ${meta.color}, ${meta.color}99)`
                  }} />
                </div>
                <input
                  type="range" min="1" max="10"
                  value={val}
                  disabled={!editMode}
                  onChange={e => setVectors({ ...vectors, [key]: parseInt(e.target.value) })}
                  style={{ width: '100%', accentColor: meta.color }}
                />
              </div>
            )
          })}
        </div>

        {editMode && (
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button
              onClick={handleSave}
              disabled={status?.type === 'loading'}
              className="btn btn-primary btn-lg"
              style={{ flex: 1 }}
            >
              {status?.type === 'loading'
                ? <><Loader2 size={18} style={{ animation: 'spin 0.7s linear infinite' }} /> Saving…</>
                : <><CheckCircle2 size={18} /> Save Profile</>
              }
            </button>
            <button onClick={handleCancel} className="btn btn-secondary btn-lg">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
