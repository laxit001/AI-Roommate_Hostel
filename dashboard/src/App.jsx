import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import MessBooking from './pages/MessBooking'
import LaundryBooking from './pages/LaundryBooking'
import ChatWidget from './components/ChatWidget'

function App() {
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/matching" element={<div className="p-8"><h1 className="text-2xl font-bold">Roommate Matching</h1></div>} />
          <Route path="/mess" element={<MessBooking />} />
          <Route path="/laundry" element={<LaundryBooking />} />
          <Route path="/complaints" element={<div className="p-8"><h1 className="text-2xl font-bold">Complaints</h1></div>} />
          <Route path="/profile" element={<div className="p-8"><h1 className="text-2xl font-bold">Profile</h1></div>} />
        </Routes>
      </div>
      <ChatWidget />
    </div>
  )
}

export default App
