import React, { useState, useEffect, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Calendar, CheckCircle, Clock, Camera, X } from 'lucide-react'
import apiClient from '../apiClient'

const LaundryBooking = () => {
  const today = new Date().toISOString().split('T')[0]
  const [activeDate,   setActiveDate]   = useState(today)
  const [slots,        setSlots]        = useState([])
  const [myBookings,   setMyBookings]   = useState([])
  const [scannerMode,  setScannerMode]  = useState(false)
  const [scanResult,   setScanResult]   = useState(null)
  const [errorText,    setErrorText]    = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const scannerRef = useRef(null)

  const fetchSlots = async () => {
    try {
      const res = await apiClient.get(`/laundry/slots?date=${activeDate}`)
      setSlots(res.data.data || [])
    } catch (err) { console.error('Slots error', err) }
  }

  const fetchMyBookings = async () => {
    try {
      const res = await apiClient.get('/laundry/my-bookings')
      setMyBookings(res.data.data || [])
    } catch (err) { console.error('Bookings error', err) }
  }

  useEffect(() => {
    fetchSlots()
    fetchMyBookings()
  }, [activeDate])

  const handleBook = async (slotTime) => {
    setErrorText('')
    setBookingLoading(true)
    try {
      await apiClient.post('/laundry/book', {
        booking_date: activeDate,
        slot_time:    slotTime
      })
      await fetchSlots()
      await fetchMyBookings()
    } catch (err) {
      setErrorText(err.response?.data?.description || 'This slot is already taken.')
    } finally {
      setBookingLoading(false)
    }
  }

  useEffect(() => {
    if (!scannerMode) return

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { qrbox: { width: 240, height: 240 }, fps: 10 },
      false
    )

    scanner.render(
      async (text) => {
        try { scanner.clear() } catch (e) {}
        setScannerMode(false)
        try {
          const res = await apiClient.post('/laundry/scan', { qr_data: text })
          setScanResult({ success: true, message: res.data.data.message })
          fetchMyBookings()
        } catch (err) {
          setScanResult({ success: false, message: err.response?.data?.description || 'Scan denied' })
        }
      },
      () => {} // ignore frame errors
    )

    scannerRef.current = scanner
    return () => { try { scanner.clear() } catch (e) {} }
  }, [scannerMode])

  return (
    <div style={{ padding: '32px', maxWidth: 1100, margin: '0 auto' }} className="animate-in">

      <div className="page-header">
        <h1 className="page-title">🧺 Laundry Scheduler</h1>
        <p className="page-subtitle">Pick a date, reserve your 2-hour machine slot, and use the QR code to start.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>

        {/* ── Left: Slot Picker ── */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Calendar size={18} color="#6366f1" />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Select Date</h2>
            </div>
            <input
              type="date"
              value={activeDate}
              min={today}
              onChange={e => setActiveDate(e.target.value)}
              className="input-field"
              style={{ marginBottom: 20 }}
            />

            {errorText && (
              <div className="alert alert-error" style={{ marginBottom: 16 }}>
                ⚠️ {errorText}
              </div>
            )}

            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Available Slots
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {slots.length === 0 ? (
                <div style={{ gridColumn: '1/-1', color: '#94a3b8', fontSize: 14, textAlign: 'center', padding: 20 }}>
                  Select a date to see available slots.
                </div>
              ) : slots.map(s => (
                <button
                  key={s.time}
                  disabled={!s.available || bookingLoading}
                  onClick={() => handleBook(s.time)}
                  style={{
                    padding: '14px 10px',
                    borderRadius: 12,
                    border: s.available ? '1px solid #c7d2fe' : '1px solid #e2e8f0',
                    background: s.available ? '#eef2ff' : '#f8fafc',
                    color: s.available ? '#4f46e5' : '#94a3b8',
                    cursor: s.available ? 'pointer' : 'not-allowed',
                    fontWeight: 600,
                    fontSize: 13,
                    textAlign: 'left',
                    transition: 'all .2s',
                  }}
                  onMouseEnter={e => { if (s.available) e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.color = 'white' }}
                  onMouseLeave={e => { if (s.available) { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.color = '#4f46e5' }}}
                >
                  <div>{s.time}</div>
                  <div style={{ fontSize: 11, fontWeight: 500, marginTop: 3, opacity: .7 }}>
                    {s.available ? '✓ Available' : '✗ Booked'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* QR Scanner */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
            borderRadius: 16,
            padding: 24,
            color: 'white'
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>📷 Admin QR Scanner</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginBottom: 16 }}>
              Scan a student's laundry QR code to validate and start the wash cycle.
            </p>

            {!scannerMode ? (
              <button className="btn btn-primary" style={{ width: '100%' }}
                onClick={() => { setScannerMode(true); setScanResult(null) }}>
                <Camera size={16} /> Open Camera
              </button>
            ) : (
              <div style={{ background: 'white', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                <div id="qr-reader" />
                <button className="btn btn-danger" style={{ width: '100%', marginTop: 10 }}
                  onClick={() => setScannerMode(false)}>
                  <X size={16} /> Cancel Scan
                </button>
              </div>
            )}

            {scanResult && (
              <div style={{
                marginTop: 16, padding: '14px 16px', borderRadius: 12,
                background: scanResult.success ? 'rgba(16,185,129,.2)' : 'rgba(239,68,68,.2)',
                border: `1px solid ${scanResult.success ? 'rgba(16,185,129,.4)' : 'rgba(239,68,68,.4)'}`,
                color: scanResult.success ? '#6ee7b7' : '#fca5a5',
                fontWeight: 700, fontSize: 14
              }}>
                {scanResult.success ? '✅' : '❌'} {scanResult.message}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: My Tickets ── */}
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
            🎫 My Laundry Tickets
          </h2>

          {myBookings.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>
              <Shirt size={40} style={{ margin: '0 auto 12px', opacity: .3 }} color="#94a3b8" />
              <p>No laundry bookings yet.</p>
            </div>
          ) : myBookings.map(b => (
            <div key={b.booking_id} className="qr-ticket" style={{ marginBottom: 16 }}>
              <div style={{ padding: 10, background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, flexShrink: 0 }}>
                <QRCodeSVG
                  value={`${b.booking_id}_${b.user_id}`}
                  size={100}
                  level="H"
                  includeMargin
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a', marginBottom: 4 }}>
                  {b.booking_date}
                </div>
                <div style={{ fontSize: 13, color: '#6366f1', fontWeight: 600, marginBottom: 10 }}>
                  🕐 {b.slot_time}
                </div>
                <span className={`badge ${b.status === 'scanned' ? 'badge-success' : 'badge-warning'}`}>
                  {b.status === 'scanned' ? <><CheckCircle size={12} /> Validated</> : <><Clock size={12} /> Pending Scan</>}
                </span>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8, fontFamily: 'monospace' }}>
                  #LAU-{b.booking_id}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LaundryBooking
