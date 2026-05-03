import React, { useState, useEffect } from 'react'
import apiClient from '../apiClient'
import { Utensils, CheckCircle, Clock, Calendar } from 'lucide-react'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

/* Build a 7-day array starting from today */
function getWeekDates() {
  const today = new Date()
  return DAYS.map((day, i) => {
    const d = new Date(today)
    // Find the actual date for each day name starting from today's week
    const dayOfWeek = today.getDay() // 0=Sun, 1=Mon, …
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(today)
    monday.setDate(today.getDate() + mondayOffset)
    const target = new Date(monday)
    target.setDate(monday.getDate() + i)
    return {
      label: day,
      date: target.toISOString().split('T')[0],
      isToday: target.toDateString() === today.toDateString()
    }
  })
}

const MEAL_ICONS = { Breakfast: '🌅', Lunch: '☀️', Dinner: '🌙' }

const MessBooking = () => {
  const weekDates = getWeekDates()
  const todayIdx  = weekDates.findIndex(d => d.isToday)
  const [activeDayIdx, setActiveDayIdx] = useState(todayIdx >= 0 ? todayIdx : 0)
  const [menu,       setMenu]       = useState([])
  const [myBookings, setMyBookings] = useState([])
  const [errorText,  setErrorText]  = useState('')
  const [loading,    setLoading]    = useState(false)

  const activeDay  = weekDates[activeDayIdx]

  const fetchMenu = async (dayLabel) => {
    try {
      const res = await apiClient.get(`/mess/menu?day_of_week=${dayLabel}`)
      setMenu(res.data.data || [])
    } catch (err) {
      console.error('Menu fetch error', err)
    }
  }

  const fetchBookings = async () => {
    try {
      const res = await apiClient.get('/mess/bookings')
      setMyBookings(res.data.data || [])
    } catch (err) {
      console.error('Bookings fetch error', err)
    }
  }

  useEffect(() => {
    fetchMenu(activeDay.label)
    fetchBookings()
  }, [activeDayIdx])

  const handleBook = async (mealType) => {
    setErrorText('')
    setLoading(true)
    try {
      await apiClient.post('/mess/book', {
        booking_date: activeDay.date,
        meal_type:    mealType
      })
      await fetchBookings()
    } catch (err) {
      const msg = err.response?.data?.description || 'Booking failed. Please try again.'
      setErrorText(msg)
    } finally {
      setLoading(false)
    }
  }

  const isBooked = (mealType) =>
    myBookings.some(b => b.meal_type === mealType && b.booking_date === activeDay.date)

  return (
    <div style={{ padding: '32px', maxWidth: 1000, margin: '0 auto' }} className="animate-in">

      <div className="page-header">
        <h1 className="page-title">🍽️ Mess Menu & Booking</h1>
        <p className="page-subtitle">Select a day, review the menu, and lock in your meals.</p>
      </div>

      {errorText && (
        <div className="alert alert-error" style={{ marginBottom: 20 }}>
          <span>⚠️ {errorText}</span>
        </div>
      )}

      {/* Day tabs */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 24 }}>
        {weekDates.map((d, i) => (
          <button
            key={d.label}
            onClick={() => setActiveDayIdx(i)}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
              whiteSpace: 'nowrap',
              transition: 'all .2s',
              background: i === activeDayIdx
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                : d.isToday ? '#eef2ff' : '#f1f5f9',
              color: i === activeDayIdx ? 'white'
                : d.isToday ? '#6366f1' : '#64748b',
              boxShadow: i === activeDayIdx ? '0 4px 12px rgba(99,102,241,.4)' : 'none',
            }}
          >
            {d.label}
            {d.isToday && <span style={{ marginLeft: 5, fontSize: 10, opacity: .8 }}>TODAY</span>}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Calendar size={16} color="#6366f1" />
        <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{activeDay.date}</span>
      </div>

      {/* Menu cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 40 }}>
        {menu.length === 0 ? (
          <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', color: '#94a3b8' }}>
            No menu available for {activeDay.label}.
          </div>
        ) : menu.map(m => {
          const booked = isBooked(m.meal_type)
          return (
            <div key={m.id} style={{
              background: 'white',
              border: `1px solid ${booked ? '#bbf7d0' : '#e2e8f0'}`,
              borderRadius: 16,
              padding: 24,
              display: 'flex', flexDirection: 'column',
              boxShadow: booked ? '0 4px 16px rgba(16,185,129,.12)' : '0 1px 3px rgba(0,0,0,.06)',
              transition: 'all .2s'
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{MEAL_ICONS[m.meal_type] || '🍴'}</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{m.meal_type}</h3>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, flex: 1, marginBottom: 16 }}>{m.items}</p>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                <div style={{ marginBottom: 10 }}>
                  {booked
                    ? <span className="badge badge-success"><CheckCircle size={12} /> Booked</span>
                    : <span className="badge badge-gray"><Clock size={12} /> Not Booked</span>
                  }
                </div>
                <button
                  onClick={() => handleBook(m.meal_type)}
                  disabled={booked || loading}
                  className={booked ? 'btn btn-ghost' : 'btn btn-primary'}
                  style={{ width: '100%' }}
                >
                  {booked ? 'Already Booked' : 'Book This Meal'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* History table */}
      <div className="card">
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>📋 My Booking History</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Date</th>
                <th>Meal</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {myBookings.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>
                    No bookings yet. Start booking meals above!
                  </td>
                </tr>
              ) : myBookings.map(b => (
                <tr key={b.booking_id}>
                  <td style={{ fontFamily: 'monospace', color: '#6366f1' }}>#MESS-{b.booking_id}</td>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{b.booking_date}</td>
                  <td style={{ color: '#6366f1', fontWeight: 600 }}>{b.meal_type}</td>
                  <td><span className="badge badge-success">Confirmed</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default MessBooking
