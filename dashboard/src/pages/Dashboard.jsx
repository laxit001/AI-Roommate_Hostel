import React, { useState, useEffect } from 'react'
import { Shield, Utensils, Shirt, AlertTriangle, Zap, Bell } from 'lucide-react'
import apiClient from '../apiClient'

/* Derive a personality summary from trait vector */
function buildPersonalitySummary(traits) {
  if (!traits) return 'Profile not yet calibrated'
  const tags = []
  if (traits.cleanliness >= 7) tags.push('Clean Freak')
  else if (traits.cleanliness <= 3) tags.push('Laid-Back')
  if (traits.sleep >= 7) tags.push('Early Bird')
  else if (traits.sleep <= 3) tags.push('Night Owl')
  if (traits.social >= 7) tags.push('Very Social')
  else if (traits.social <= 3) tags.push('Introvert')
  if (traits.noise <= 3) tags.push('Quiet Type')
  else if (traits.noise >= 7) tags.push('Lively')
  if (traits.discipline >= 7) tags.push('Disciplined')
  return tags.length > 0 ? tags.join(' · ') : 'Balanced Profile'
}

const Dashboard = () => {
  const [profile, setProfile]       = useState(null)
  const [todayMess, setTodayMess]   = useState(null)
  const [laundry, setLaundry]       = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileRes, messRes, laundryRes] = await Promise.allSettled([
          apiClient.get('/profile'),
          apiClient.get('/mess/today'),
          apiClient.get('/laundry/my-bookings'),
        ])

        if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data.data)
        if (messRes.status   === 'fulfilled') setTodayMess(messRes.value.data.data)
        if (laundryRes.status === 'fulfilled') setLaundry(laundryRes.value.data.data || [])
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) {
    return (
      <div className="spinner-overlay">
        <div className="spinner" />
      </div>
    )
  }

  const traits = profile?.compliance_factors
  const personalitySummary = buildPersonalitySummary(traits)
  const trustScore = profile?.trust_score ?? 100
  const penaltyLevel = profile?.penalty_level ?? 0
  const upcomingLaundry = laundry.filter(b => b.status === 'booked')

  const penaltyBadge = penaltyLevel === 0
    ? <span className="badge badge-success">All Clear</span>
    : penaltyLevel === 1
    ? <span className="badge badge-warning">Level {penaltyLevel}</span>
    : <span className="badge badge-danger">Level {penaltyLevel}</span>

  return (
    <div style={{ padding: '32px', maxWidth: 1100, margin: '0 auto' }} className="animate-in">

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 className="page-title">
            Welcome back, {profile?.name || 'Student'}! 👋
          </h1>
          <p className="page-subtitle">Here's your hostel snapshot for today.</p>
        </div>
        <button style={{ background: 'white', border: '1px solid #e2e8f0', padding: '10px', borderRadius: 12, cursor: 'pointer', position: 'relative' }}>
          <Bell size={20} color="#64748b" />
          <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: '#ef4444', borderRadius: '50%', border: '2px solid white' }} />
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stat-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon indigo"><Shield size={24} /></div>
          <div>
            <div className="stat-label">Trust Score</div>
            <div className="stat-value">{trustScore}<span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500 }}>/100</span></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rose"><AlertTriangle size={24} /></div>
          <div>
            <div className="stat-label">Penalty Level</div>
            <div className="stat-value" style={{ fontSize: 20, paddingTop: 2 }}>{penaltyBadge}</div>
          </div>
        </div>

        <div className="stat-card" style={{
          background: 'linear-gradient(135deg, #312e81, #4c1d95)',
          border: 'none', color: 'white'
        }}>
          <div className="stat-icon violet" style={{ background: 'rgba(255,255,255,.1)' }}>
            <Zap size={24} color="white" />
          </div>
          <div>
            <div className="stat-label" style={{ color: 'rgba(255,255,255,.6)' }}>Personality Vector</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#c4b5fd', marginTop: 4 }}>
              {personalitySummary}
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-column content ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Today's Mess */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div className="stat-icon indigo" style={{ width: 36, height: 36 }}><Utensils size={18} /></div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
              Today's Mess — {todayMess?.day || ''}
            </h2>
          </div>

          {todayMess?.menu?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {todayMess.menu.map(m => (
                <div key={m.meal_type} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 14px', borderRadius: 10,
                  background: m.booked ? '#f0fdf4' : '#f8fafc',
                  border: `1px solid ${m.booked ? '#bbf7d0' : '#e2e8f0'}`,
                  borderLeft: `4px solid ${m.booked ? '#10b981' : '#6366f1'}`
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{m.meal_type}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{m.items}</div>
                  </div>
                  {m.booked
                    ? <span className="badge badge-success">Booked ✓</span>
                    : <span className="badge badge-gray">Not Booked</span>
                  }
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#94a3b8', fontSize: 14 }}>No menu available for today.</p>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Laundry */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div className="stat-icon amber" style={{ width: 36, height: 36 }}><Shirt size={18} /></div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>Laundry Schedule</h2>
            </div>
            {upcomingLaundry.length > 0 ? (
              upcomingLaundry.slice(0, 3).map(b => (
                <div key={b.booking_id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', borderRadius: 10, background: '#fffbeb',
                  border: '1px solid #fde68a', marginBottom: 8
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#92400e' }}>{b.booking_date}</div>
                    <div style={{ fontSize: 12, color: '#a16207' }}>{b.slot_time}</div>
                  </div>
                  <span className="badge badge-warning">Pending</span>
                </div>
              ))
            ) : (
              <p style={{ color: '#94a3b8', fontSize: 14 }}>No upcoming laundry bookings.</p>
            )}
          </div>

          {/* Notifications */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div className="stat-icon violet" style={{ width: 36, height: 36 }}><Bell size={18} /></div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>Updates</h2>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '🔧', text: 'Water supply maintenance: Friday 2 PM.', color: '#6366f1' },
                { icon: '📋', text: 'Room transfer requests being reviewed.', color: '#10b981' },
                { icon: '🏆', text: 'Hostel hygiene audit on Sunday.', color: '#f59e0b' },
              ].map((n, i) => (
                <li key={i} style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  padding: '10px 12px', borderRadius: 10, background: '#f8fafc',
                  border: '1px solid #f1f5f9'
                }}>
                  <span style={{ fontSize: 18 }}>{n.icon}</span>
                  <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{n.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
