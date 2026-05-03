import React, { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { Mail, KeyRound, Loader2, Home } from 'lucide-react'
import apiClient from '../apiClient'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const { login } = useAuth()
  const [mode,    setMode]    = useState('selector') // 'selector' | 'otp_send' | 'otp_verify'
  const [email,   setEmail]   = useState('')
  const [otp,     setOtp]     = useState('')
  const [error,   setError]   = useState('')
  const [info,    setInfo]    = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('')
    try {
      const res = await apiClient.post('/auth/google', { token: credentialResponse.credential })
      login(res.data.data.token, res.data.data)
    } catch (err) {
      setError(err.response?.data?.description || 'Google sign-in failed. Please try again.')
    }
  }

  const requestOtp = async () => {
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await apiClient.post('/auth/send-otp', { email })
      setMode('otp_verify')
      setInfo(`A 6-digit code has been sent to ${email}. Check your inbox (and spam folder).`)
    } catch (err) {
      setError(err.response?.data?.description || 'Could not send OTP. Check your backend SMTP config.')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    if (otp.length !== 6) { setError('Please enter the full 6-digit code.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await apiClient.post('/auth/verify-otp', { email, otp_code: otp })
      login(res.data.data.token, res.data.data)
    } catch (err) {
      setError(err.response?.data?.description || 'Invalid or expired OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '10%', left: '10%',
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(99,102,241,.3) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(40px)'
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '10%',
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(139,92,246,.25) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(40px)'
        }} />
      </div>

      <div className="login-card animate-in">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64, margin: '0 auto 14px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(99,102,241,.4)'
          }}>
            <Home size={30} color="white" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', letterSpacing: -0.5 }}>
            Hostel Super App
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
            Sign in to access your smart hostel dashboard
          </p>
        </div>

        {/* Error / Info */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            <span>⚠️ {error}</span>
          </div>
        )}
        {info && !error && (
          <div className="alert alert-info" style={{ marginBottom: 16 }}>
            <span>ℹ️ {info}</span>
          </div>
        )}

        {/* Selector mode */}
        {mode === 'selector' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20, transform: 'scale(1.05)' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google OAuth failed.')}
                theme="filled_black"
                size="large"
                shape="rectangular"
                width="320"
              />
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20
            }}>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
              <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                or
              </span>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            </div>
            <button
              onClick={() => { setMode('otp_send'); setError('') }}
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Mail size={16} /> Continue with Email OTP
            </button>
          </div>
        )}

        {/* OTP Send mode */}
        {mode === 'otp_send' && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <label className="input-label">Your Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && requestOtp()}
                className="input-field"
                placeholder="student@university.edu"
                autoFocus
              />
            </div>
            <button
              onClick={requestOtp}
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}
            >
              {loading ? <><Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> Sending…</> : 'Send OTP Code'}
            </button>
            <button onClick={() => { setMode('selector'); setError('') }} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
              ← Back
            </button>
          </div>
        )}

        {/* OTP Verify mode */}
        {mode === 'otp_verify' && (
          <div>
            <div style={{
              display: 'flex', gap: 10, padding: '12px 14px', borderRadius: 10,
              background: '#eff6ff', border: '1px solid #bfdbfe', marginBottom: 16,
              alignItems: 'flex-start'
            }}>
              <KeyRound size={18} color="#2563eb" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 13, color: '#1d4ed8', lineHeight: 1.5 }}>
                Code sent to <strong>{email}</strong>. It expires in <strong>10 minutes</strong>.
                <br />
                <span style={{ fontSize: 12, opacity: .8 }}>Check your spam folder if you don't see it. The code is also printed in your backend console for dev testing.</span>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="input-label">6-Digit Code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => e.key === 'Enter' && !loading && verifyOtp()}
                className="input-field"
                placeholder="000000"
                autoFocus
                style={{ textAlign: 'center', fontSize: 28, fontWeight: 900, letterSpacing: 14 }}
              />
            </div>

            <button
              onClick={verifyOtp}
              disabled={loading || otp.length !== 6}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}
            >
              {loading ? <><Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> Verifying…</> : 'Verify & Sign In'}
            </button>
            <button onClick={() => { setMode('otp_send'); setOtp(''); setError('') }} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
              ← Change Email
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Login
