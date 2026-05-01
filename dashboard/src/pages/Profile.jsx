import React, { useState, useEffect } from 'react'
import apiClient from '../apiClient'
import { Loader2, SlidersHorizontal, ShieldCheck, Edit3, CheckCircle2, UserCircle } from 'lucide-react'

const Profile = () => {
    const [profile, setProfile] = useState(null)
    const [vectors, setVectors] = useState({})
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(true)
    const [status, setStatus] = useState(null)
    const [editMode, setEditMode] = useState(false)

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            const res = await apiClient.get('/profile')
            setProfile(res.data.data)
            setName(res.data.data.name)
            setVectors(res.data.data.compliance_factors)
        } catch (err) {
            console.error("Profile payload extraction fault", err)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setStatus({ type: 'loading' })
        try {
            await apiClient.put('/profile', { name, ...vectors })
            setStatus({ type: 'success', text: 'Vector Matrix Updates Confirmed. Machine Learning Model calibrated.' })
            setEditMode(false)
            loadProfile() // Re-fetch naturally updating context seamlessly
        } catch (err) {
            setStatus({ type: 'error', text: 'Write transaction failed.' })
        }
    }

    if (loading) return <div className="p-8 flex items-center justify-center h-full"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>
    
    if (!profile) return <div className="p-8 text-center text-red-500 font-bold bg-red-50 rounded-2xl border border-red-100 m-8">Failed to establish profile context. Check your backend console to ensure Python is running!</div>

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Display Node */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-indigo-900 p-8 rounded-[2rem] shadow-xl text-white flex flex-col md:flex-row gap-8 items-center border border-indigo-500/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="w-32 h-32 bg-white/10 border border-white/20 backdrop-blur-md rounded-[2rem] flex flex-col items-center justify-center text-4xl font-black shadow-inner rotate-3 hover:rotate-0 transition duration-300">
                    {name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-center md:text-left z-10">
                   {!editMode ? (
                       <h1 className="text-4xl font-black mb-1">{profile.name}</h1>
                   ) : (
                       <input 
                           type="text" 
                           value={name} 
                           onChange={(e) => setName(e.target.value)}
                           className="bg-white/10 border border-white/30 text-white placeholder-slate-300 text-3xl font-black p-2 rounded-xl w-full max-w-xs focus:ring-2 focus:ring-indigo-400 outline-none transition"
                       />
                   )}
                   <p className="text-indigo-200 font-medium mb-4 tracking-wide">{profile.email}</p>
                   <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                       <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"><ShieldCheck size={14} /> Trust Score: {profile.trust_score}</span>
                       {profile.is_verified && <span className="bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold px-3 py-1.5 rounded-full">Secure Auth Verified</span>}
                       <span className="bg-white/10 border border-white/10 text-white/50 text-xs px-3 py-1.5 rounded-full font-mono">Member since {new Date(profile.created_at).toLocaleDateString()}</span>
                   </div>
                </div>
                {!editMode && (
                    <button onClick={() => setEditMode(true)} className="z-10 bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 transition backdrop-blur-sm">
                        <Edit3 size={16} /> Edit Profile Base
                    </button>
                )}
            </div>

            {status?.text && (
                 <div className={`p-4 rounded-xl text-sm font-bold shadow-sm transition-all ${status.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                     {status.type === 'success' && <CheckCircle2 size={16} className="inline mr-2" />}
                     {status.text}
                 </div>
            )}

            {/* Constraints Vector Editor Node */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
                 <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
                     <div>
                         <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800"><SlidersHorizontal size={24} className="text-indigo-500" /> Behavioral Constraints</h2>
                         <p className="text-slate-500 text-sm mt-1">This topological vector naturally determines your Roommate Engine matches natively.</p>
                     </div>
                     {!editMode && (
                         <div className="hidden md:flex bg-slate-50 p-3 rounded-xl border border-slate-100 items-center justify-center font-black tracking-widest text-indigo-300 rotate-12 opacity-50">
                             LOCKED
                         </div>
                     )}
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {Object.entries(vectors).map(([key, val]) => (
                         <div key={key} className={`bg-slate-50 p-5 rounded-2xl border transition-all ${editMode ? 'border-indigo-200 shadow-sm' : 'border-slate-100 opacity-60 grayscale'}`}>
                             <div className="flex justify-between mb-4">
                                 <label className="text-sm font-bold uppercase tracking-widest text-slate-600">{key}</label>
                                 <span className="text-sm font-black text-white bg-indigo-600 px-3 py-1 rounded-lg shadow-sm">{val} / 10</span>
                             </div>
                             <input 
                                 type="range" min="1" max="10" value={val} 
                                 disabled={!editMode}
                                 onChange={e => setVectors({...vectors, [key]: parseInt(e.target.value)})}
                                 className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${editMode ? 'bg-indigo-200 accent-indigo-600' : 'bg-slate-200 accent-slate-400 cursor-not-allowed'}`}
                             />
                         </div>
                     ))}
                 </div>
                 
                 {editMode && (
                     <div className="mt-8 flex gap-4 animate-in slide-in-from-bottom-2">
                         <button onClick={handleSave} disabled={status?.type === 'loading'} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold shadow-md transition flex items-center justify-center gap-2">
                             {status?.type === 'loading' ? <Loader2 className="animate-spin" size={18} /> : <span><CheckCircle2 size={18} /> Commit Vector Topology</span>}
                         </button>
                         <button onClick={() => { setEditMode(false); setStatus(null); loadProfile(); }} className="px-8 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition">
                             Cancel
                         </button>
                     </div>
                 )}
            </div>
        </div>
    )
}

export default Profile
