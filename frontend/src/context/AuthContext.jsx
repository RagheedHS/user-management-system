import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
// Navigation removed; not using react-router

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: null,
    user: null,
    isAuthenticated: false,
  });


  // Load token from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('ums_token');
    if (token) {
      setAuth({ token, user: null, isAuthenticated: true });
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const token = response.data.token;
      localStorage.setItem('ums_token', token);
      setAuth({ token, user: null, isAuthenticated: true });
    } catch (err) {
      console.error('Login failed', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('ums_token');
    setAuth({ token: null, user: null, isAuthenticated: false });
  };

  // Attach token to axios for subsequent calls
  useEffect(() => {
    if (auth.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [auth.token]);

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
