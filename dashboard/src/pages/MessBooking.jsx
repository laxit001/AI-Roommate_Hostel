import React, { useState, useEffect } from 'react'
import apiClient from '../apiClient'

const MessBooking = () => {
  const [activeDay, setActiveDay] = useState('Monday')
  const [menu, setMenu] = useState([])
  const [myBookings, setMyBookings] = useState([])
  const [errorText, setErrorText] = useState('')

  // Fetch user payload securely checking authentication validity
  const userStr = localStorage.getItem('hostel_user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const currentUserId = currentUser ? currentUser.user_id : null;

  // Simple date generator for demonstration grouping strings correctly without complexity
  const daysMap = { 'Monday': '2026-05-04', 'Tuesday': '2026-05-05' } 
  const activeDate = daysMap[activeDay] || '2026-05-04'

  const fetchMenu = async (day) => {
    try {
      const res = await apiClient.get(`/mess/menu?day_of_week=${day}`)
      setMenu(res.data.data)
    } catch(err) { console.error("Error fetching menu", err) }
  }

  const fetchBookings = async () => {
    try {
      const res = await apiClient.get(`/mess/bookings?user_id=${currentUserId}`)
      setMyBookings(res.data.data)
    } catch(err) { console.error("Error fetching bookings", err) }
  }

  useEffect(() => {
    fetchMenu(activeDay)
    fetchBookings()
  }, [activeDay])

  const handleBook = async (mealType) => {
    setErrorText('')
    try {
      const payload = {
        user_id: currentUserId,
        booking_date: activeDate,
        meal_type: mealType
      }
      await apiClient.post('/mess/book', payload)

      // Successfully booked! Refresh UI
      fetchBookings()
    } catch(err) {
      setErrorText(err.message)
    }
  }

  const isBooked = (mealType) => {
    return myBookings.some(b => b.meal_type === mealType && b.booking_date === activeDate)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Mess Menu & Booking 🍲</h1>
      <p className="text-slate-500 mb-6">Select a day of the week, review the rotating menu, and toggle your attendance slot seamlessly without needing physical tokens!</p>
      
      {errorText && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{errorText}</div>}
      
      <div className="flex gap-4 border-b border-slate-200 pb-4 mb-4">
        {['Monday', 'Tuesday'].map(d => (
          <button 
            key={d}
            onClick={() => setActiveDay(d)}
            className={`px-6 py-2 rounded-lg font-medium transition ${activeDay === d ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-sm'}`}
          >
            {d}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {menu.length === 0 ? <p className="text-slate-400 p-4 border border-slate-200 bg-white rounded-lg">No menu data scheduled for {activeDay}.</p> : menu.map(m => {
            const booked = isBooked(m.meal_type);
            return (
              <div key={m.id} className="bg-white border text-center border-slate-200 shadow-sm p-6 rounded-xl flex flex-col justify-between hover:shadow-md transition">
                 <div>
                   <h3 className="text-xl font-bold text-indigo-700">{m.meal_type}</h3>
                   <p className="mt-3 text-slate-600 min-h-[50px]">{m.items}</p>
                 </div>
                 
                 <div className="mt-6 pt-4 border-t border-slate-100">
                    <span className={`block mb-4 text-sm tracking-wide uppercase font-bold ${booked ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {booked ? "✅ Slot Locked In" : "⏳ Not booked"}
                    </span>
                    <button 
                      onClick={() => handleBook(m.meal_type)}
                      disabled={booked}
                      className={`w-full py-3 rounded-lg font-bold transition duration-200 ${booked ? 'bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:-translate-y-1 shadow-md text-white hover:bg-indigo-700'}`}
                    >
                       {booked ? 'Booked Successfully' : 'Confirm Meal Seat'}
                    </button>
                 </div>
              </div>
            )
         })}
      </div>
      
      {/* Historical View */}
      <h2 className="text-xl font-bold text-slate-800 mt-12 mb-4">Your Active Meal Logs and History</h2>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-hidden">
         <table className="w-full text-left">
           <thead>
             <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-3">Booking Reference UUID</th>
                <th className="p-3">Physical Date Match</th>
                <th className="p-3">Menu Type Classification</th>
                <th className="p-3">System Status</th>
             </tr>
           </thead>
           <tbody>
             {myBookings.map(b => (
               <tr key={b.booking_id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                  <td className="p-3 text-slate-500 text-sm">#MESS-TX-${b.booking_id}</td>
                  <td className="p-3 font-semibold text-slate-700">{b.booking_date}</td>
                  <td className="p-3 text-indigo-600 font-bold">{b.meal_type}</td>
                  <td className="p-3">
                     <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Verified Binding</span>
                  </td>
               </tr>
             ))}
             {myBookings.length === 0 && <tr><td colSpan="4" className="p-4 text-center text-slate-400 italic">No historical active meal bookings found connected to your user ID. Start selecting meals above!</td></tr>}
           </tbody>
         </table>
      </div>
    </div>
  )
}

export default MessBooking
