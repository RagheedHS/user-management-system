import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiCheckCircle, FiAlertCircle, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import AuthLayout from '../components/Authlayout.jsx';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email.trim() !== '' && email.includes('@');

  if (submitted) {
    return (
      <AuthLayout eyebrow="Account recovery" title="Check your email" statusLabel="Channel secure">
        <div className="og-card text-center py-10 px-6">
          <div className="w-16 h-16 bg-[var(--success)]/10 text-[var(--success)] rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle size={28} />
          </div>
          <h2 className="og-font-display text-xl font-bold text-[var(--text-strong)] m-0">Recovery link sent</h2>
          <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
            If an account exists for <span className="text-[var(--text)] font-medium">{email}</span>, password
            recovery instructions are on their way.
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
      eyebrow="Account recovery"
      title="Recover password"
      subtitle="Enter your registered email and we'll send you instructions to reset your password."
      statusLabel="Channel secure"
    >
      {error && (
        <div className="og-alert og-alert-error flex items-start gap-2 mb-5">
          <FiAlertCircle className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="og-form-label og-font-mono block text-[11px] uppercase tracking-[0.2em] mb-2">
            Email address
          </label>
          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent)]" size={16} />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@ogero.lb"
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
          {loading ? 'Sending link…' : 'Send recovery link'}
          {!loading && <FiArrowRight size={14} />}
        </button>
      </form>

      <div className="text-center mt-8 pt-6 border-t border-[var(--border)]">
        <Link
          to="/login"
          className="og-font-mono inline-flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.15em] text-[var(--text-muted)] hover:text-[var(--accent)] transition"
        >
          <FiArrowLeft size={13} />
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;