import React, { useState, useEffect } from 'react'
import apiClient from '../apiClient'
import { AlertCircle, Clock, CheckCircle, Loader2 } from 'lucide-react'

const Complaints = () => {
  const [complaints, setComplaints]   = useState([])
  const [loading,    setLoading]      = useState(true)
  const [matches,    setMatches]      = useState([])
  const [roommateId, setRoommateId]   = useState('')
  const [message,    setMessage]      = useState('')
  const [status,     setStatus]       = useState(null) // { type: 'success'|'error'|'loading', text }

  const fetchComplaints = async () => {
    try {
      const res = await apiClient.get('/complaints/')
      setComplaints(res.data.data || [])
    } catch (err) {
      console.error('Fetch complaints error', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMatches = async () => {
    try {
      const res = await apiClient.get('/matches/')
      setMatches(res.data.data || [])
    } catch (err) {
      console.error('Fetch matches for dropdown error', err)
    }
  }

  useEffect(() => {
    fetchComplaints()
    fetchMatches()
  }, [])

  const handleSubmit = async () => {
    if (!roommateId || !message.trim()) {
      setStatus({ type: 'error', text: 'Please select a roommate and enter a description.' })
      return
    }
    setStatus({ type: 'loading' })
    try {
      await apiClient.post('/complaints/', {
        roommate_id: parseInt(roommateId),
        message:     message.trim()
      })
      setStatus({ type: 'success', text: '✅ Complaint filed. Their trust score has been penalized by -5 points.' })
      setRoommateId('')
      setMessage('')
      fetchComplaints()
    } catch (err) {
      const msg = err.response?.data?.description || 'Failed to submit complaint.'
      setStatus({ type: 'error', text: msg })
    }
  }

  return (
    <div style={{ padding: '32px', maxWidth: 900, margin: '0 auto' }} className="animate-in">

      <div className="page-header">
        <h1 className="page-title">📢 Complaints & Violations</h1>
        <p className="page-subtitle">
          File formal grievances. Each complaint automatically applies a -5 trust score penalty to the target.
        </p>
      </div>

      {/* ── Submit form ── */}
      <div className="card" style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Lodge a New Complaint</h2>

        {status?.text && (
          <div className={`alert ${status.type === 'error' ? 'alert-error' : 'alert-success'}`}
               style={{ marginBottom: 16 }}>
            {status.text}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label className="input-label">Target Roommate</label>
            <select
              value={roommateId}
              onChange={e => setRoommateId(e.target.value)}
              className="input-field"
            >
              <option value="">— Select roommate —</option>
              {matches.map(m => (
                <option key={m.user_id} value={m.user_id}>
                  {m.name} (Trust: {m.trust_score})
                </option>
              ))}
            </select>
            {matches.length === 0 && (
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                No matches found. Set up your profile first.
              </p>
            )}
          </div>

          <div>
            <label className="input-label">Violation Description</label>
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="input-field"
              placeholder="Loud music after midnight, unclean common areas…"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={status?.type === 'loading'}
          className="btn btn-danger"
        >
          {status?.type === 'loading'
            ? <><Loader2 size={16} className="animate-spin" /> Submitting…</>
            : <><AlertCircle size={16} /> Submit Complaint</>
          }
        </button>
      </div>

      {/* ── History ── */}
      <div className="card">
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>📁 My Complaint History</h2>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <div className="spinner" />
          </div>
        ) : complaints.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '32px 0' }}>
            <CheckCircle size={36} style={{ margin: '0 auto 12px', opacity: .3 }} color="#94a3b8" />
            <p>No complaints filed yet. Great community member! 🎉</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {complaints.map(c => (
              <div key={c.complaint_id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                padding: '14px 16px', borderRadius: 12, background: '#fff5f5',
                border: '1px solid #fed7d7', borderLeft: '4px solid #ef4444'
              }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
                    "{c.message}"
                  </p>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span className="badge badge-danger">
                      Against User #{c.roommate_id}
                    </span>
                    <span style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} />
                      {new Date(c.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <span className="badge badge-gray">#{c.complaint_id}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Complaints
