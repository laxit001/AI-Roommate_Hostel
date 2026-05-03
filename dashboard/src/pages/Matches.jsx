import React, { useState, useEffect } from 'react'
import apiClient from '../apiClient'
import { Zap, AlertTriangle, Brain, Users } from 'lucide-react'

const TRAIT_COLORS = {
  cleanliness: '#6366f1',
  sleep:       '#8b5cf6',
  discipline:  '#3b82f6',
  noise:       '#f59e0b',
  emotional:   '#ec4899',
  social:      '#10b981',
}

const MatchCard = ({ m, index }) => {
  const matchPct = Math.round(m.final_score * 100)
  const ring = matchPct >= 70 ? '#10b981' : matchPct >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div style={{
      background: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: 16,
      padding: 24,
      display: 'grid',
      gridTemplateColumns: '80px 1fr',
      gap: 20,
      alignItems: 'start',
      boxShadow: '0 1px 3px rgba(0,0,0,.06)',
      transition: 'all .2s',
      position: 'relative',
      overflow: 'hidden',
    }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,.1)'}
    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.06)'}
    >
      {/* Rank badge */}
      <div style={{
        position: 'absolute', top: 12, right: 12,
        background: index === 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#f1f5f9',
        color: index === 0 ? 'white' : '#64748b',
        width: 28, height: 28, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 800,
      }}>
        #{index + 1}
      </div>

      {/* Score circle */}
      <div style={{
        width: 76, height: 76,
        borderRadius: '50%',
        border: `4px solid ${ring}`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: `${ring}15`,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 20, fontWeight: 900, color: ring, lineHeight: 1 }}>{matchPct}%</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: ring, opacity: .8, textTransform: 'uppercase' }}>Match</span>
      </div>

      {/* Info */}
      <div>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>{m.name}</h2>
        <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>{m.email}</p>

        {/* Explanation */}
        <div style={{
          background: '#eff6ff', border: '1px solid #bfdbfe',
          borderRadius: 8, padding: '8px 12px',
          fontSize: 13, color: '#1d4ed8', fontWeight: 500,
          marginBottom: 12, display: 'flex', gap: 8, alignItems: 'flex-start'
        }}>
          <Brain size={14} style={{ flexShrink: 0, marginTop: 2 }} />
          {m.explanation}
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="badge badge-success">
            <Zap size={12} /> Trust: {m.trust_score}
          </span>
          <span className="badge badge-purple">
            Confidence: {Math.round(m.confidence_score * 100)}%
          </span>
          {m.penalty_level > 0 && (
            <span className="badge badge-danger">
              <AlertTriangle size={12} /> Penalty Lv {m.penalty_level}
            </span>
          )}
          <span className="badge badge-gray">
            Base: {Math.round(m.similarity_base * 100)}%
          </span>
        </div>
      </div>
    </div>
  )
}

const Matches = () => {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    apiClient.get('/matches/')
      .then(res => setMatches(res.data.data || []))
      .catch(err => {
        console.error('Matches error', err)
        setError('Could not load matches. Make sure your profile is set up.')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="spinner-overlay">
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#64748b', fontSize: 14 }}>Running cosine similarity engine…</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px', maxWidth: 900, margin: '0 auto' }} className="animate-in">
      <div className="page-header">
        <h1 className="page-title">🧠 AI Roommate Matching</h1>
        <p className="page-subtitle">
          Cosine similarity on your personality vector, weighted by trust score and confidence.
        </p>
      </div>

      {/* How it works */}
      <div style={{
        background: 'linear-gradient(135deg, #312e81, #1e1b4b)',
        borderRadius: 16, padding: 20, marginBottom: 28, color: 'white',
        display: 'flex', gap: 20, alignItems: 'center'
      }}>
        <Users size={36} style={{ opacity: .7, flexShrink: 0 }} />
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: 4 }}>How the Algorithm Works</h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', lineHeight: 1.6 }}>
            Traits are weighted: <strong style={{ color: '#a5b4fc' }}>Cleanliness × 2</strong>,
            <strong style={{ color: '#a5b4fc' }}> Sleep × 2</strong>,
            <strong style={{ color: '#a5b4fc' }}> Discipline × 1.5</strong>,
            <strong style={{ color: '#a5b4fc' }}> Noise × 1.5</strong>,
            <strong style={{ color: '#a5b4fc' }}> Emotional × 1.5</strong>,
            <strong style={{ color: '#a5b4fc' }}> Social × 1</strong>.
            Final score = Similarity × (Trust / 100) × Confidence.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {matches.length === 0 && !error ? (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <Brain size={48} style={{ margin: '0 auto 16px', opacity: .3 }} color="#6366f1" />
            <p style={{ fontWeight: 700, color: '#475569', marginBottom: 8 }}>No matches found yet.</p>
            <p style={{ color: '#94a3b8', fontSize: 14 }}>
              Update your profile traits so the engine has something to match against!
            </p>
          </div>
        ) : matches.map((m, i) => (
          <MatchCard key={m.user_id} m={m} index={i} />
        ))}
      </div>
    </div>
  )
}

export default Matches
