import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiAlertCircle, FiLogIn } from 'react-icons/fi';
import ogeroLogo from '../assets/Ogero.png';

/* ─── Inline styles (no extra CSS file needed) ─────────────────────────── */
const styles = {
  /* Page */
  page: {
    minHeight: '100vh',
    background: 'var(--page-bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    fontFamily: "'Nunito', 'Segoe UI', sans-serif",
  },

  /* Outer card */
  card: {
    width: '100%',
    maxWidth: '420px',
    background: 'var(--card-bg)',
    borderRadius: '28px',
    border: '1px solid var(--border)',
    boxShadow: '0 20px 60px rgba(15,23,42,0.16)',
    padding: '2rem 2rem 1.6rem',
    position: 'relative',
    overflow: 'visible',
  },

  /* Title area */
  titleBlock: {
    textAlign: 'center',
    marginBottom: '1.2rem',
  },
  title: {
    fontSize: '1.65rem',
    fontWeight: 900,
    color: 'var(--text-strong)',
    letterSpacing: '0.04em',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    margin: '2px 0 0',
  },

  /* Circular logo badge */
  logoBadgeWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.4rem',
  },
  logoBadgeOuter: {
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    background: 'linear-gradient(145deg, #6ed0d0, #3ab8b8)',
    padding: '4px',
    boxShadow: '0 4px 20px rgba(58,180,180,0.25)',
  },
  logoBadgeInner: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'var(--surface)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    border: '3px solid rgba(255,255,255,0.15)',
  },
  logoImg: {
    width: '80px',
    height: '80px',
    objectFit: 'contain',
  },

  /* Inner form panel */
  formPanel: {
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '1.4rem 1.5rem 1.2rem',
    boxShadow: 'inset 0 2px 12px rgba(0,0,0,0.06)',
    backdropFilter: 'blur(10px)',
  },

  /* Error box */
  errorBox: {
    marginBottom: '0.9rem',
    padding: '0.85rem 0.95rem',
    background: 'rgba(248,113,113,0.12)',
    border: '1px solid rgba(248,113,113,0.3)',
    borderRadius: '12px',
    color: 'var(--danger)',
    display: 'flex',
    alignItems: 'flex-start',
    fontSize: '0.88rem',
    gap: '8px',
  },

  /* Field group */
  fieldGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    marginBottom: '4px',
    letterSpacing: '0.03em',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '13px',
    color: 'var(--accent)',
    fontSize: '15px',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    paddingLeft: '36px',
    paddingRight: '14px',
    paddingTop: '11px',
    paddingBottom: '11px',
    border: '1.5px solid var(--input-border)',
    borderRadius: '50px',
    background: 'var(--input-bg)',
    fontSize: '0.92rem',
    color: 'var(--text)',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },

  /* Login button */
  loginBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    margin: '1.2rem auto 0',
    padding: '12px 32px',
    background: 'var(--button-bg)',
    border: 'none',
    borderRadius: '50px',
    color: 'var(--button-text)',
    fontWeight: 800,
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 10px 25px rgba(15,23,42,0.16)',
    transition: 'transform 0.15s, box-shadow 0.15s, opacity 0.15s',
    letterSpacing: '0.03em',
  },
  loginBtnDisabled: {
    opacity: 0.65,
    cursor: 'not-allowed',
  },

  /* Footer links */
  footer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1.4rem',
    marginTop: '1.1rem',
    flexWrap: 'wrap',
  },
  footerLink: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'color 0.15s',
  },
};

/* ─── Component ─────────────────────────────────────────────────────────── */
const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, error } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

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

  const focusStyle = {
    borderColor: '#4bbfbf',
    boxShadow: '0 0 0 3px rgba(75,191,191,0.18)',
  };

  return (
    <div style={styles.page}>
      {/* Google Font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap"
        rel="stylesheet"
      />

      <div style={styles.card}>
        {/* Title */}
        <div style={styles.titleBlock}>
          <h1 style={styles.title}>OGERO</h1>
          <p style={styles.subtitle}>User Management System</p>
        </div>

        {/* Logo badge */}
        <div style={styles.logoBadgeWrapper}>
          <div style={styles.logoBadgeOuter}>
            <div style={styles.logoBadgeInner}>
              <img src={ogeroLogo} alt="Ogero Logo" style={styles.logoImg} />
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div style={styles.formPanel}>
          {/* Error */}
          {(localError || error) && (
            <div style={styles.errorBox}>
              <FiAlertCircle style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{localError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div style={styles.fieldGroup}>
              <label htmlFor="username" style={styles.label}>Username</label>
              <div style={styles.inputWrapper}>
                <FiMail style={styles.inputIcon} />
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onFocus={() => setUsernameFocused(true)}
                  onBlur={() => setUsernameFocused(false)}
                  placeholder="your.name@ogero.lb"
                  style={{
                    ...styles.input,
                    ...(usernameFocused ? focusStyle : {}),
                  }}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div style={styles.fieldGroup}>
              <label htmlFor="password" style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <FiLock style={styles.inputIcon} />
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="••••••"
                  style={{
                    ...styles.input,
                    ...(passwordFocused ? focusStyle : {}),
                  }}
                  required
                />
              </div>
            </div>

            {/* Submit button */}
            <div style={{ textAlign: 'center' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.loginBtn,
                  ...(loading ? styles.loginBtnDisabled : {}),
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(60,180,60,0.45)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(60,180,60,0.35)';
                }}
              >
                <FiLogIn />
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </div>
          </form>
        </div>

        {/* Footer links */}
        <div style={styles.footer}>
          <a href="/forgot-password" style={styles.footerLink}>Forgot Password?</a>
          <a href="/register" style={styles.footerLink}>Register Now</a>
          <a href="/support" style={styles.footerLink}>Contact Support</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
