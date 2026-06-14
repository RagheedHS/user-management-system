import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiMail } from 'react-icons/fi';
import AuthLayout from '../components/Authlayout.jsx';

const ForgotPasswordPage = () => {
  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Forgot password?"
      statusLabel="Channel secure"
    >
      <div className="og-card text-center py-10 px-6">
        <div className="w-16 h-16 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full flex items-center justify-center mx-auto mb-4">
          <FiMail size={28} />
        </div>
        <h2 className="og-font-display text-xl font-bold text-[var(--text-strong)] m-0">
          Contact your administrator
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-3 leading-relaxed">
          Password reset is managed by your system administrator.
          Please reach out to them directly to regain access to your account.
        </p>
        <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
          Email: <span className="text-[var(--text)] font-medium">admin@ogero.lb</span>
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
};

export default ForgotPasswordPage;