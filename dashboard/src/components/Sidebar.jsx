import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Utensils, Shirt, AlertTriangle, User } from 'lucide-react'

const Sidebar = () => {
  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Matching', path: '/matching', icon: Users },
    { name: 'Mess Booking', path: '/mess', icon: Utensils },
    { name: 'Laundry', path: '/laundry', icon: Shirt },
    { name: 'Complaints', path: '/complaints', icon: AlertTriangle },
    { name: 'Profile', path: '/profile', icon: User },
  ]

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-full shadow-lg">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold tracking-wider text-indigo-400">HostelApp</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }`
            }
          >
            <link.icon size={20} />
            <span className="font-medium">{link.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-700 text-sm text-slate-400 text-center">
        Powered by AI Backend
      </div>
    </aside>
  )
}

export default Sidebar
