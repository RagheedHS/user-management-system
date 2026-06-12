import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, userAPI } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const { showToast } = useToast();

  const login = useCallback(async (username, password) => {
    try {
      setError(null);
      const response = await authAPI.login(username, password);
      const { token, userId, username: user_name, email, roleName, directPermissions, inheritedPermissions, effectivePermissions } = response.data;

      const basicUser = { userId, username: user_name, email, roleName };

      // persist token first so subsequent requests include Authorization header
      setToken(token);
      localStorage.setItem('token', token);

      // attempt to fetch full user profile from API
      let profile = null;
      try {
        const pr = await userAPI.getById(userId);
        profile = pr.data;
      } catch (e) {
        // ignore missing profile
        profile = null;
      }

      const mergedUser = {
        ...basicUser,
        firstName: profile?.firstName || 'System',
        lastName: profile?.lastName || 'Admin',
        email: profile?.email || email || 'admin@ogero.lb',
        roleId: profile?.roleId || 1,
      };

      setUser(mergedUser);
      localStorage.setItem('user', JSON.stringify(mergedUser));

      // wire permissions -> notifications and persist via backend when possible
      const existing = JSON.parse(localStorage.getItem('notifications') || '[]');
      const loginNotif = { id: Date.now(), text: `Welcome back, ${mergedUser.username}`, time: new Date().toISOString(), static: true };
      const extraNotifs = [];
      if (directPermissions && Array.isArray(directPermissions) && directPermissions.length) {
        extraNotifs.push({ id: Date.now()+1, text: `You have ${directPermissions.length} direct permissions`, time: new Date().toISOString() });
      }
      if (inheritedPermissions && Array.isArray(inheritedPermissions) && inheritedPermissions.length) {
        extraNotifs.push({ id: Date.now()+2, text: `You have ${inheritedPermissions.length} inherited permissions`, time: new Date().toISOString() });
      }
      const mergedNotifs = [loginNotif, ...extraNotifs, ...existing];
      localStorage.setItem('notifications', JSON.stringify(mergedNotifs));

      // attempt to persist login notification to backend notifications table
      try {
        // fire-and-forget; backend will link to current user via JWT
        fetch('http://localhost:8080/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ text: loginNotif.text, isStatic: true })
        }).catch(() => {});
      } catch (e) { }

      // always show login toast (static)
      try { showToast({ type: 'success', message: 'Logged in successfully', always: true, duration: 6000 }); } catch (e) { }

      return mergedUser;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMsg);
      throw err;
    }
  }, [showToast]);

  const register = useCallback(async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);
      const { token, userId, username, email, roleName } = response.data;
      const basicUser = { userId, username, email, roleName };
      setToken(token);
      localStorage.setItem('token', token);

      // fetch profile
      let profile = null;
      try {
        const pr = await userAPI.getById(userId);
        profile = pr.data;
      } catch (e) { profile = null; }

      const mergedUser = {
        ...basicUser,
        firstName: profile?.firstName || userData.firstName || '',
        lastName: profile?.lastName || userData.lastName || '',
      };

      setUser(mergedUser);
      localStorage.setItem('user', JSON.stringify(mergedUser));
      try { showToast({ type: 'success', message: 'Registered successfully', always: true, duration: 6000 }); } catch (e) { }
      return mergedUser;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMsg);
      throw err;
    }
  }, [showToast]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const isAuthenticated = !!token && !!user;

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    setError,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};