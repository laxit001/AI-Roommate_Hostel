import React, { useState, useEffect, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import apiClient from '../apiClient'

const LaundryBooking = () => {
    const [activeDate, setActiveDate] = useState('2026-05-04')
    const [slots, setSlots] = useState([])
    const [myBookings, setMyBookings] = useState([])
    const [scannerMode, setScannerMode] = useState(false)
    const [scanResult, setScanResult] = useState(null)
    const [errorText, setErrorText] = useState('')
    
    const userStr = localStorage.getItem('hostel_user')
    const currentUser = userStr ? JSON.parse(userStr) : null
    const currentUserId = currentUser ? currentUser.user_id : null
    
    const fetchSlots = async () => {
        try {
            const res = await apiClient.get(`/laundry/slots?date=${activeDate}`)
            setSlots(res.data.data)
        } catch(err) {}
    }
    
    const fetchMyBookings = async () => {
        try {
            const res = await apiClient.get(`/laundry/my-bookings?user_id=${currentUserId}`)
            setMyBookings(res.data.data)
        } catch(err) {}
    }
    
    useEffect(() => {
        fetchSlots()
        fetchMyBookings()
    }, [activeDate])
    
    const handleBook = async (slotTime) => {
        setErrorText('')
        try {
            const payload = { user_id: currentUserId, booking_date: activeDate, slot_time: slotTime }
            await apiClient.post('/laundry/book', payload)
            fetchSlots()
            fetchMyBookings()
        } catch(err) { setErrorText(err.response?.data?.description || 'Reservation constrained gracefully.') }
    }
    
    // Physical hardware camera scanning hook implementation
    useEffect(() => {
        if (scannerMode) {
            const scanner = new Html5QrcodeScanner('reader', { qrbox: { width: 300, height: 300 }, fps: 10 })
            scanner.render(async (text) => {
                scanner.clear()
                setScannerMode(false)
                
                // Submit the physical QR encoded logic natively back into our python verification framework
                try {
                    const res = await apiClient.post('/laundry/scan', { qr_data: text })
                    setScanResult({ success: true, message: res.data.data.message })
                    fetchMyBookings()
                } catch(err) {
                    setScanResult({ success: false, message: err.response?.data?.description || 'Hardware denied scan execution' })
                }
            }, (error) => {
                // Ignore standard rapid frame scan missing errors to prevent console logging blasts
            })
            
            return () => {
                 try { scanner.clear() } catch(e) {}
            }
        }
    }, [scannerMode])

    return (
        <div className="p-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-slate-800">Laundry Scheduler 🧺</h1>
                <p className="text-slate-500 mb-6">Select an exact date below to query real-time vacancy. Reserve your targeted 2-hour machine block exclusively.</p>
                
                {errorText && <div className="p-4 bg-red-50 text-red-700 rounded-xl">{errorText}</div>}
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <input 
                        type="date" 
                        value={activeDate} 
                        onChange={e => setActiveDate(e.target.value)}
                        className="w-full text-lg p-3 border border-slate-300 bg-slate-50 text-slate-800 rounded-xl mb-6 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                        {slots.map(s => (
                            <button
                                key={s.time}
                                disabled={!s.available}
                                onClick={() => handleBook(s.time)}
                                className={`p-4 rounded-xl font-bold transition flex flex-col items-start gap-1 justify-between ${s.available ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-100 cursor-pointer shadow-sm hover:shadow-md' : 'bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed opacity-75'}`}
                            >
                                <span>{s.time}</span>
                                <span className={`text-xs uppercase tracking-wider ${s.available ? 'text-indigo-400' : 'text-slate-300'}`}>{s.available ? 'Available' : 'Currently Booked'}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                    <h2 className="text-xl font-bold mb-4">Admin Validator Viewport</h2>
                    <p className="text-indigo-200 text-sm mb-6">Simulation Sandbox: Use your actual webcam to scan student QR codes here. This mocks the physical kiosk unlocking mechanism.</p>
                    
                    {!scannerMode ? (
                        <button 
                            onClick={() => { setScannerMode(true); setScanResult(null); }}
                            className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold transition shadow-lg"
                        >
                            Open Camera Scanner
                        </button>
                    ) : (
                        <div className="bg-white text-black p-4 rounded-xl shadow-inner border-[4px] border-indigo-500/30">
                            <div id="reader" className="rounded-lg overflow-hidden"></div>
                            <button onClick={() => setScannerMode(false)} className="mt-4 text-red-500 bg-red-50 hover:bg-red-100 py-3 rounded-lg font-bold w-full text-center transition">Cancel Hardware Scan</button>
                        </div>
                    )}
                    
                    {scanResult && (
                        <div className={`mt-6 p-4 rounded-xl text-lg font-bold shadow-inner ${scanResult.success ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                             {scanResult.success ? '✅ Access Granted: ' : '❌ Access Denied: '}{scanResult.message}
                        </div>
                    )}
                </div>
                
                <h2 className="text-xl font-bold pl-2 border-l-[4px] border-indigo-500 text-slate-800">My Laundry Tickets</h2>
                {myBookings.map(b => (
                    <div key={b.booking_id} className="bg-white border flex gap-6 items-center border-slate-200 shadow-sm p-6 rounded-2xl hover:shadow-md transition">
                        <div className="p-3 bg-white shadow-sm border border-slate-200 rounded-xl">
                             {/* Encode the sensitive native lookup data straight into SVG QR visual geometry */}
                             <QRCodeSVG value={`${b.booking_id}_${b.user_id}`} size={110} level="H" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">{b.booking_date}</h3>
                            <p className="text-indigo-600 font-bold mb-3">{b.slot_time} - {b.slot_time.replace('AM', 'PM')}</p>
                            <span className={`px-4 shadow-sm py-1.5 text-xs font-bold rounded-full uppercase tracking-wider ${b.status === 'booked' ? 'bg-amber-100 text-amber-700 border border-amber-200' : b.status === 'scanned' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>{b.status === 'booked' ? 'Pending Scan' : 'Execution Started'}</span>
                        </div>
                    </div>
                ))}
                {myBookings.length === 0 && <p className="text-slate-400 p-6 border text-center border-slate-100 rounded-xl">You have no active laundry bookings mapped to your account.</p>}
            </div>
        </div>
    )
}

export default LaundryBooking
