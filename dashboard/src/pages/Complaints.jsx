import React, { useState, useEffect } from 'react'
import apiClient from '../apiClient'
import { Loader2, AlertCircle } from 'lucide-react'

const Complaints = () => {
    const [complaints, setComplaints] = useState([])
    const [loading, setLoading] = useState(true)
    const [roommateId, setRoommateId] = useState('')
    const [message, setMessage] = useState('')
    const [status, setStatus] = useState(null)

    const fetchLogs = async () => {
        try {
            const res = await apiClient.get('/complaints')
            setComplaints(res.data.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchLogs() }, [])

    const handleSubmit = async () => {
        if (!roommateId || !message) return setStatus({ type: 'error', text: 'All fields required' })
        setStatus({ type: 'loading' })
        try {
            await apiClient.post('/complaints', { roommate_id: parseInt(roommateId), message })
            setStatus({ type: 'success', text: 'Complaint Recorded (-5 Trust Score applied to target)' })
            setRoommateId('')
            setMessage('')
            fetchLogs()
        } catch(err) {
            setStatus({ type: 'error', text: 'Creation logic failure' })
        }
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
             <div>
                <h1 className="text-3xl font-bold text-slate-800">Room Violations 📢</h1>
                <p className="text-slate-500 mt-2">Log formal grievances. Our algorithm automatically applies proportionate trust score penalties.</p>
             </div>

             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                 <h2 className="text-lg font-bold">Lodge a New Complaint</h2>
                 {status?.text && <div className={`p-4 rounded-xl text-sm font-bold ${status.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>{status.text}</div>}
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="md:col-span-1">
                         <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1 block">Target User ID</label>
                         <input type="number" value={roommateId} onChange={e => setRoommateId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g. 4" />
                     </div>
                     <div className="md:col-span-2">
                         <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1 block">Violation Description</label>
                         <input type="text" value={message} onChange={e => setMessage(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-red-500" placeholder="Loud music past 2AM..." />
                     </div>
                 </div>
                 <button onClick={handleSubmit} disabled={status?.type === 'loading'} className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition flex items-center gap-2">
                     {status?.type === 'loading' ? <Loader2 className="animate-spin" size={18} /> : <span><AlertCircle size={18} className="inline mr-2" /> Submit Formal Penalty</span>}
                 </button>
             </div>

             <div>
                 <h2 className="text-lg font-bold mb-4 pl-1">My Reporting History</h2>
                 <div className="space-y-4">
                     {loading ? <Loader2 className="animate-spin text-slate-300" /> : complaints.map(c => (
                         <div key={c.complaint_id} className="bg-white border flex justify-between border-slate-100 p-5 rounded-xl shadow-sm">
                              <div>
                                  <p className="text-sm text-slate-800 font-medium mb-1">"{c.message}"</p>
                                  <p className="text-xs text-slate-400">Filed against Target ID: <span className="font-bold text-red-500">{c.roommate_id}</span></p>
                              </div>
                              <div className="text-xs font-bold text-slate-400 underline decoration-dotted">{new Date(c.created_at).toLocaleDateString()}</div>
                         </div>
                     ))}
                     {complaints.length === 0 && !loading && <div className="text-slate-400 text-sm">No complaints logged yet.</div>}
                 </div>
             </div>
        </div>
    )
}

export default Complaints
