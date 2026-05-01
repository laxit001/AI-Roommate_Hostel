import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
    // Isolated secure hook verifying authorization existence 
    const { token } = useAuth()
    
    // Hard block preventing non-authenticated memory access bypassing React Router naturally
    if (!token) {
        return <Navigate to="/login" replace />
    }
    
    return children
}

export default ProtectedRoute
