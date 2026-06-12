import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiLock, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import AuthLayout from '../components/Authlayout.jsx';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, error } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);

    try {
      await login(formData.username, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.response?.data?.message || err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.username.trim() !== '' && formData.password.trim() !== '';

  return (
    <AuthLayout
      eyebrow="Authentication"
      title="Sign in"
      subtitle="Enter your credentials to access the User Management System."
      statusLabel="Channel secure"
    >
      {(localError || error) && (
        <div className="og-alert og-alert-error flex items-start gap-2 mb-5">
          <FiAlertCircle className="shrink-0 mt-0.5" />
          <span>{localError || error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="og-form-label og-font-mono block text-[11px] uppercase tracking-[0.2em] mb-2">
            Username
          </label>
          <div className="relative">
            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent)]" size={16} />
            <input
              id="username"
              type="text"
              name="username"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="your.username"
              className="og-form-control pl-11"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="og-form-label og-font-mono block text-[11px] uppercase tracking-[0.2em] mb-2">
            Password
          </label>
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent)]" size={16} />
            <input
              id="password"
              type="password"
              name="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="og-form-control pl-11"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!isFormValid || loading}
          className={`og-btn og-btn-primary og-font-mono w-full mt-2 py-3.5 text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-2 shadow-lg transition-all duration-300
            ${isFormValid && !loading
              ? 'opacity-100 cursor-pointer hover:brightness-110 active:scale-[0.99]'
              : 'opacity-50 cursor-not-allowed'
            }`}
        >
          {loading ? 'Authenticating…' : 'Sign in'}
          {!loading && <FiArrowRight size={14} />}
        </button>
      </form>

      <div className="flex justify-between items-center gap-2 mt-8 pt-6 border-t border-[var(--border)] og-font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
        <Link to="/forgot-password" className="hover:text-[var(--accent)] transition">
          Forgot password
        </Link>
        <Link to="/register" className="hover:text-[var(--accent)] transition">
          Request access
        </Link>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;