import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Utensils, Shirt,
  AlertTriangle, User, LogOut, Shield
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import apiClient from '../apiClient'

const Sidebar = () => {
  const { logout } = useAuth()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    apiClient.get('/profile')
      .then(res => setProfile(res.data.data))
      .catch(() => {})
  }, [])

  const links = [
    { name: 'Dashboard',    path: '/',           icon: LayoutDashboard },
    { name: 'Matching',     path: '/matching',   icon: Users },
    { name: 'Mess Booking', path: '/mess',       icon: Utensils },
    { name: 'Laundry',      path: '/laundry',    icon: Shirt },
    { name: 'Complaints',   path: '/complaints', icon: AlertTriangle },
    { name: 'Profile',      path: '/profile',    icon: User },
  ]

  const initial = profile?.name?.charAt(0).toUpperCase() || '?'
  const trustScore = profile?.trust_score ?? '—'

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>🏠 HostelAI</h1>
        <p>SMART HOSTEL PLATFORM</p>
      </div>

      {/* User pill */}
      <div className="sidebar-user-pill">
        <div className="sidebar-user-avatar">{initial}</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">
            {profile?.name || 'Loading…'}
          </div>
          <div className="sidebar-user-trust">
            <Shield size={10} style={{ display: 'inline', marginRight: 3 }} />
            Trust: {trustScore}
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map(link => (
          <NavLink
            key={link.name}
            to={link.path}
            end={link.path === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <link.icon size={18} />
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="btn-logout" onClick={logout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
