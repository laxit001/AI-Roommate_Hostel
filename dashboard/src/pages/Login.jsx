import React, { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { Mail, KeyRound, Loader2, Link } from 'lucide-react'
import apiClient from '../apiClient'
import { useAuth } from '../context/AuthContext'

const Login = () => {
    const { login } = useAuth()
    const [mode, setMode] = useState('selector') // 'selector', 'otp_send', 'otp_verify'
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Secure authentication success handler bridging states
    const handleAuthSuccess = (token, user) => {
        login(token, user)
    }

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await apiClient.post('/auth/google', { token: credentialResponse.credential })
            handleAuthSuccess(res.data.data.token, res.data.data)
        } catch (err) {
            setError(err.response?.data?.description || 'Google Authentication execution logic failed.')
        }
    }

    const requestOtp = async () => {
        if (!email.includes('@')) return setError("Syntactically malformed email structure.")
        setLoading(true)
        setError('')
        try {
            await apiClient.post('/auth/send-otp', { email })
            setMode('otp_verify')
        } catch(err) {
            setError(err.response?.data?.description || 'Failed reaching SMTP tracking provider.')
        } finally {
            setLoading(false)
        }
    }

    const verifyOtp = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await apiClient.post('/auth/verify-otp', { email, otp_code: otp })
            handleAuthSuccess(res.data.data.token, res.data.data)
        } catch(err) {
            setError(err.response?.data?.description || 'OTP Key mismatch.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl flex flex-col items-center">
                 <div className="w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg flex items-center justify-center mb-6">
                      <Link size={32} className="text-white" />
                 </div>
                 <h1 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Hostel Platform</h1>
                 <p className="text-slate-500 font-medium mb-8 text-center text-sm">Secure Authentication Gateway validating student identity tokens seamlessly.</p>
                 
                 {error && <div className="bg-red-50 text-red-600 w-full p-4 rounded-xl text-sm font-bold mb-6 text-center border border-red-100">{error}</div>}

                 {mode === 'selector' && (
                     <div className="w-full space-y-4">
                         <div className="flex justify-center mb-6 scale-110">
                              <GoogleLogin 
                                   onSuccess={handleGoogleSuccess} 
                                   onError={() => setError('Google OAuth bridge failure')}
                                   theme="filled_black"
                                   size="large"
                              />
                         </div>
                         <div className="flex items-center gap-4 py-2">
                             <div className="flex-1 h-px bg-slate-200"></div>
                             <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">or Secure Email</span>
                             <div className="flex-1 h-px bg-slate-200"></div>
                         </div>
                         <button onClick={() => setMode('otp_send')} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2">
                             <Mail size={18} /> Continue with Email OTP
                         </button>
                     </div>
                 )}

                 {mode === 'otp_send' && (
                     <div className="w-full space-y-4">
                         <div>
                             <label className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1 mb-1 block">Campus Email</label>
                             <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="student@university.edu" />
                         </div>
                         <button onClick={requestOtp} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 py-4 rounded-xl font-bold shadow-md transition flex items-center justify-center gap-2">
                             {loading ? <Loader2 className="animate-spin" size={18} /> : 'Dispatch Secure OTP Pattern'}
                         </button>
                         <button onClick={() => setMode('selector')} className="w-full py-2 text-slate-400 text-sm font-bold hover:text-slate-600 transition">Cancel</button>
                     </div>
                 )}

                 {mode === 'otp_verify' && (
                     <div className="w-full space-y-4">
                         <div className="bg-indigo-50 text-indigo-700 p-4 rounded-xl text-sm font-medium border border-indigo-100 flex items-start gap-3 mb-2">
                              <KeyRound size={20} className="shrink-0 mt-0.5" />
                              <p>We've dispatched a 6-digit cryptographic verification vector to <b>{email}</b></p>
                         </div>
                         <div>
                             <input type="text" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-center text-2xl font-black tracking-[1em] focus:ring-2 focus:ring-indigo-500 outline-none transition placeholder-slate-300" placeholder="000000" />
                         </div>
                         <button onClick={verifyOtp} disabled={loading || otp.length !== 6} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 py-4 rounded-xl font-bold shadow-md transition flex items-center justify-center gap-2">
                             {loading ? <Loader2 className="animate-spin" size={18} /> : 'Authenticate Logic Sequence'}
                         </button>
                         <button onClick={() => setMode('otp_send')} className="w-full py-2 text-slate-400 text-sm font-bold hover:text-slate-600 transition">Go Back</button>
                     </div>
                 )}
            </div>
        </div>
    )
}

export default Login
