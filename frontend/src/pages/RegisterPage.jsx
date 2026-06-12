import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiUserCheck, FiAlertCircle, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import AuthLayout from '../components/Authlayout.jsx';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.firstName.trim() !== '' &&
    formData.lastName.trim() !== '' &&
    formData.username.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.email.includes('@') &&
    formData.password.trim() !== '' &&
    formData.confirmPassword.trim() !== '' &&
    formData.password === formData.confirmPassword;

  if (success) {
    return (
      <AuthLayout eyebrow="Access request" title="Request submitted" statusLabel="Channel secure">
        <div className="og-card text-center py-10 px-6">
          <div className="w-16 h-16 bg-[var(--success)]/10 text-[var(--success)] rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUserCheck size={28} />
          </div>
          <h2 className="og-font-display text-xl font-bold text-[var(--text-strong)] m-0">Registration complete</h2>
          <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
            Your account request has been logged. An administrator will review and activate
            access for <span className="text-[var(--text)] font-medium">{formData.username}</span>.
          </p>
          <Link
            to="/login"
            className="og-btn og-btn-primary og-font-mono inline-flex items-center gap-2 mt-6 px-6 py-3 text-xs uppercase tracking-[0.25em] shadow-md hover:brightness-110 transition"
          >
            <FiArrowLeft size={14} />
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Access request"
      title="Create account"
      subtitle="Submit your details to request an account on the Ogero User Management System."
      statusLabel="Channel secure"
      width="lg"
    >
      {error && (
        <div className="og-alert og-alert-error flex items-start gap-2 mb-5">
          <FiAlertCircle className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="og-form-label og-font-mono block text-[11px] uppercase tracking-[0.2em] mb-2">First name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              className="og-form-control"
              required
            />
          </div>
          <div>
            <label className="og-form-label og-font-mono block text-[11px] uppercase tracking-[0.2em] mb-2">Last name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              className="og-form-control"
              required
            />
          </div>
        </div>

        <div>
          <label className="og-form-label og-font-mono block text-[11px] uppercase tracking-[0.2em] mb-2">Username</label>
          <div className="relative">
            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent)]" size={15} />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="johndoe"
              className="og-form-control pl-11"
              required
            />
          </div>
        </div>

        <div>
          <label className="og-form-label og-font-mono block text-[11px] uppercase tracking-[0.2em] mb-2">Email address</label>
          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent)]" size={15} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john.doe@ogero.lb"
              className="og-form-control pl-11"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="og-form-label og-font-mono block text-[11px] uppercase tracking-[0.2em] mb-2">Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent)]" size={15} />
              <input
                type="password"
                name="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="og-form-control pl-11"
                required
              />
            </div>
          </div>
          <div>
            <label className="og-form-label og-font-mono block text-[11px] uppercase tracking-[0.2em] mb-2">Confirm password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent)]" size={15} />
              <input
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="og-form-control pl-11"
                required
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isFormValid || loading}
          className={`og-btn og-btn-primary og-font-mono w-full mt-4 py-3.5 text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-2 shadow-lg transition-all duration-300
            ${isFormValid && !loading
              ? 'opacity-100 cursor-pointer hover:brightness-110 active:scale-[0.99]'
              : 'opacity-50 cursor-not-allowed'
            }`}
        >
          {loading ? 'Submitting request…' : 'Request account'}
          {!loading && <FiArrowRight size={14} />}
        </button>
      </form>

      <div className="text-center mt-8 pt-6 border-t border-[var(--border)]">
        <p className="og-font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
          Already have access?{' '}
          <Link to="/login" className="text-[var(--accent)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;