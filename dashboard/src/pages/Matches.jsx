import React, { useState, useEffect } from 'react'
import apiClient from '../apiClient'
import { Loader2, Zap, AlertTriangle } from 'lucide-react'

const Matches = () => {
    const [matches, setMatches] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const res = await apiClient.get('/matches')
                setMatches(res.data.data)
            } catch (err) {
                console.error("Match pipeline failure", err)
            } finally {
                setLoading(false)
            }
        }
        fetchMatches()
    }, [])

    if (loading) return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">Your Top Roommate Matches 🧠</h1>
            <p className="text-slate-500 mb-8">Our algorithm executes mathematical cosine regressions against your profile parameters factoring their global trust score.</p>
            
            <div className="grid gap-6">
                {matches.map((m, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex gap-6 items-center transition hover:shadow-md">
                        <div className="w-20 h-20 shrink-0 bg-indigo-50 rounded-2xl flex flex-col items-center justify-center text-indigo-600">
                             <span className="text-2xl font-black">{Math.round(m.final_score * 100)}%</span>
                             <span className="text-[10px] font-bold uppercase tracking-wider">Match</span>
                        </div>
                        
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-slate-800">{m.name} <span className="text-sm font-medium text-slate-400">({m.email})</span></h2>
                            <p className="text-indigo-600 bg-indigo-50 py-1.5 px-3 rounded-lg text-sm font-medium inline-block mt-2 mb-3">
                                {m.explanation}
                            </p>
                            <div className="flex gap-4 items-center">
                                 <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md"><Zap size={14} /> Trust Score: {m.trust_score}</span>
                                 {m.penalty_level > 0 && <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md"><AlertTriangle size={14} /> Penalty Active: Lv {m.penalty_level}</span>}
                            </div>
                        </div>
                    </div>
                ))}
                {matches.length === 0 && <div className="text-slate-500 p-8 border border-dashed rounded-2xl text-center">No active matches found. Check your profile settings.</div>}
            </div>
        </div>
    )
}

export default Matches
