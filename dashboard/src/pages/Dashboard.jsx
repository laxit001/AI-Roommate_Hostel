import React, { useState, useEffect } from 'react'
import { Bell, Shield, Calendar, Info, Loader2 } from 'lucide-react'
import apiClient from '../apiClient'

const Dashboard = () => {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/profile')
        setUserData(response.data.data)
      } catch (error) {
        console.error("Failed to fetch profile:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8 mt-20">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Info */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Welcome Back, {userData?.name || 'User'}! 👋</h1>
          <p className="text-slate-500 mt-1">Room 412, North Wing</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 border rounded-full text-slate-500 hover:bg-slate-100 transition relative">
            <Bell size={22} />
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl"><Shield size={28} /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Trust Score</p>
            <h3 className="text-2xl font-bold text-slate-800">8.5 <span className="text-sm font-normal text-slate-400">/10</span></h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl"><Shield size={28} /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Penalty Level</p>
            <h3 className="text-2xl font-bold text-slate-800">0 <span className="text-sm font-normal text-emerald-500">(All Good)</span></h3>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-2xl shadow-md text-white flex flex-col justify-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-20"><Info size={80}/></div>
             <p className="text-indigo-100 font-medium">Compatibility Vector</p>
             <h3 className="text-xl font-bold mt-1">Highly Social, Early Bird</h3>
        </div>
      </div>

      {/* Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Meals */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Today's Mess Menu 🍽️</h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 border border-slate-100 rounded-xl flex justify-between items-center bg-slate-50">
              <div>
                <p className="font-semibold text-slate-700">Breakfast</p>
                <p className="text-sm text-slate-500">Pancakes, Oats, Coffee</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Passed</span>
            </div>
            <div className="p-4 border border-slate-100 rounded-xl flex justify-between items-center shadow-sm border-l-4 border-l-indigo-500">
              <div>
                <p className="font-semibold text-slate-700">Lunch</p>
                <p className="text-sm text-slate-500">Grilled Chicken, Rice, Salads</p>
              </div>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">12:30 PM</span>
            </div>
            <div className="p-4 border border-slate-100 rounded-xl flex justify-between items-center opacity-75">
              <div>
                <p className="font-semibold text-slate-700">Dinner</p>
                <p className="text-sm text-slate-500">Pasta Bake, Garlic Bread</p>
              </div>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">07:00 PM</span>
            </div>
          </div>
        </section>

        {/* Laundry & Notifications */}
        <div className="space-y-8">
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Laundry Schedule 🧺</h2>
            <div className="flex items-center gap-4 bg-amber-50 p-4 rounded-xl border border-amber-100">
              <Calendar className="text-amber-600" size={30} />
              <div>
                <p className="font-bold text-amber-900">Your Slot is Tomorrow!</p>
                <p className="text-sm text-amber-700">Machine #4 at 10:00 AM</p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Latest Updates 📌</h2>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm text-slate-600 border-b pb-3 border-slate-50">
                <span className="text-indigo-500 font-bold">•</span>
                <span>Water supply maintenance scheduled for Friday 2 PM.</span>
              </li>
              <li className="flex gap-3 text-sm text-slate-600">
                <span className="text-emerald-500 font-bold">•</span>
                <span>Your room transfer request is currently being reviewed.</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
