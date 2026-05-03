import { Routes, Route, useLocation } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import MessBooking from './pages/MessBooking'
import LaundryBooking from './pages/LaundryBooking'
import ChatWidget from './components/ChatWidget'
import Login from './pages/Login'
import Matches from './pages/Matches'
import Complaints from './pages/Complaints'
import Profile from './pages/Profile'
import { AuthProvider } from './context/AuthContext'

function AppContent() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login'

  return (
    <div className="app-shell">
      {!isAuthPage && <Sidebar />}
      <div className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/matching" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
          <Route path="/mess" element={<ProtectedRoute><MessBooking /></ProtectedRoute>} />
          <Route path="/laundry" element={<ProtectedRoute><LaundryBooking /></ProtectedRoute>} />
          <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </div>
      {!isAuthPage && <ChatWidget />}
    </div>
  )
}

function App() {
  // Replace 'YOUR_GOOGLE_CLIENT_ID' with your actual client ID from Google Cloud Console
  // For dev/demo, the GoogleOAuthProvider still mounts — OTP login works without it
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'placeholder.apps.googleusercontent.com'

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}

export default App
