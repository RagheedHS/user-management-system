import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiUserCheck, FiAlertCircle, FiArrowRight, FiArrowLeft, FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';
import AuthLayout from '../components/Authlayout.jsx';
import { authAPI } from '../services/api';

const passwordRules = [
  { id: 'length',    label: 'At least 8 characters',            test: (p) => p.length >= 8 },
  { id: 'upper',     label: 'One uppercase letter (A-Z)',        test: (p) => /[A-Z]/.test(p) },
  { id: 'lower',     label: 'One lowercase letter (a-z)',        test: (p) => /[a-z]/.test(p) },
  { id: 'number',    label: 'One number (0-9)',                  test: (p) => /[0-9]/.test(p) },
  { id: 'symbol',    label: 'One symbol (!@#$...)',              test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const PasswordStrength = ({ password }) => {
  if (!password) return null;
  return (
    <ul className="mt-2 space-y-1">
      {passwordRules.map((rule) => {
        const ok = rule.test(password);
        return (
          <li key={rule.id} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
            {ok ? <FiCheck size={11} /> : <FiX size={11} />}
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
};

const isPasswordStrong = (p) => passwordRules.every((r) => r.test(p));

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', username: '', email: '', password: '', confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (!isPasswordStrong(formData.password)) {
      setError('Password does not meet the security requirements');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authAPI.register(formData);
      setSuccess(true);
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.message || data?.detail || data?.error || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.firstName.trim() !== '' &&
    formData.lastName.trim() !== '' &&
    formData.username.trim().length >= 3 &&
    formData.email.trim() !== '' &&
    formData.email.includes('@') &&
    isPasswordStrong(formData.password) &&
    formData.confirmPassword !== '' &&
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
          <Link to="/login" className="og-btn og-btn-primary og-font-mono inline-flex items-center gap-2 mt-6 px-6 py-3 text-xs uppercase tracking-[0.25em] shadow-md hover:brightness-110 transition">
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
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" className="og-form-control" required />
          </div>
          <div>
            <label className="og-form-label og-font-mono block text-[11px] uppercase tracking-[0.2em] mb-2">Last name</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" className="og-form-control" required />
          </div>
        </div>

        <div>
          <label className="og-form-label og-font-mono block text-[11px] uppercase tracking-[0.2em] mb-2">Username</label>
          <div className="relative">
            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent)]" size={15} />
            <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="johndoe" className="og-form-control pl-11" required minLength={3} />
          </div>
          {formData.username.length > 0 && formData.username.length < 3 && (
            <p className="text-xs text-[var(--danger)] mt-1">Username must be at least 3 characters</p>
          )}
        </div>

        <div>
          <label className="og-form-label og-font-mono block text-[11px] uppercase tracking-[0.2em] mb-2">Email address</label>
          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent)]" size={15} />
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john.doe@ogero.lb" className="og-form-control pl-11" required />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="og-form-label og-font-mono block text-[11px] uppercase tracking-[0.2em] mb-2">Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent)]" size={15} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                placeholder="••••••••"
                className="og-form-control pl-11 pr-11"
                required
              />
              <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--accent)] hover:opacity-70 transition" tabIndex={-1}>
                {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>
            {(passwordFocused || formData.password.length > 0) && (
              <PasswordStrength password={formData.password} />
            )}
          </div>
          <div>
            <label className="og-form-label og-font-mono block text-[11px] uppercase tracking-[0.2em] mb-2">Confirm password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent)]" size={15} />
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="og-form-control pl-11 pr-11"
                required
              />
              <button type="button" onClick={() => setShowConfirm((p) => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--accent)] hover:opacity-70 transition" tabIndex={-1}>
                {showConfirm ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>
            {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
              <p className="text-xs text-[var(--danger)] mt-1">Passwords do not match</p>
            )}
            {formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword && isPasswordStrong(formData.password) && (
              <p className="text-xs text-[var(--success)] mt-1">Passwords match</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={!isFormValid || loading}
          className={`og-btn og-btn-primary og-font-mono w-full mt-4 py-3.5 text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-2 shadow-lg transition-all duration-300
            ${isFormValid && !loading ? 'opacity-100 cursor-pointer hover:brightness-110 active:scale-[0.99]' : 'opacity-50 cursor-not-allowed'}`}
        >
          {loading ? 'Submitting request...' : 'Request account'}
          {!loading && <FiArrowRight size={14} />}
        </button>
      </form>

      <div className="text-center mt-8 pt-6 border-t border-[var(--border)]">
        <p className="og-font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
          Already have access?{' '}
          <Link to="/login" className="text-[var(--accent)] hover:underline">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;