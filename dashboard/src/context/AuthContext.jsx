import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('hostel_token') || null);
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('hostel_user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    
    const navigate = useNavigate();

    const login = (newToken, newUser) => {
        localStorage.setItem('hostel_token', newToken);
        localStorage.setItem('hostel_user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        navigate('/');
    };

    const logout = () => {
        localStorage.removeItem('hostel_token');
        localStorage.removeItem('hostel_user');
        setToken(null);
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
