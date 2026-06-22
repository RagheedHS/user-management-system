import React, { useEffect, useState, useRef } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userAPI } from '../services/api';
import ModalContainer from './ModalContainer';
import './ProfileModal.css';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', profilePhoto: null });
  const [meta, setMeta] = useState({ username: '', roleName: '', active: true });
  const [saving, setSaving] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);
  const mountedRef = useRef(true);
  const { showToast } = useToast();

  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordError('');

      let mounted = true;
      (async () => {
        try {
          if (user?.userId) {
            const res = await userAPI.getById(user.userId);
            if (!mounted) return;
            const data = res.data || {};
            setForm({
              firstName: data.firstName || data.username || user?.username || '',
              lastName: data.lastName || '',
              email: data.email || user?.email || '',
              profilePhoto: data.profilePhoto || user?.profilePhoto || null,
            });
            setMeta({
              username: data.username || user?.username || '',
              roleName: data.roleName || user?.roleName || '',
              active: data.active !== undefined ? data.active : true,
            });
            return;
          }
        } catch (e) {
          // fallback to cached values
        }

        setForm({
          firstName: user?.firstName || user?.username || '',
          lastName: user?.lastName || '',
          email: user?.email || '',
          profilePhoto: user?.profilePhoto || null,
        });
        setMeta({ username: user?.username || '', roleName: user?.roleName || '', active: true });
      })();
      return () => { mounted = false; };
    }
  }, [isOpen, user]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm((s) => ({ ...s, profilePhoto: ev.target.result }));
    reader.readAsDataURL(file);
    setFileName(file.name || '');
  };

  const triggerFileSelect = () => {
    try { fileInputRef.current && fileInputRef.current.click(); } catch (e) {}
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (user?.userId) {
        await userAPI.update(user.userId, {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          profilePhoto: form.profilePhoto,
        });

        const updated = { ...user, firstName: form.firstName, lastName: form.lastName, email: form.email, profilePhoto: form.profilePhoto };
        localStorage.setItem('user', JSON.stringify(updated));
        try { if (typeof setUser === 'function') setUser(updated); } catch (e) {}
      } else {
        // no authenticated user — persist locally
        localStorage.setItem('user_temp_profile', JSON.stringify(form));
      }

      showToast({ type: 'success', message: 'Profile updated', always: true, compact: true, duration: 4500 });
    } catch (err) {
      showToast({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update profile',
        always: true,
        compact: true,
        duration: 4500,
      });
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');

    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }

    setPasswordSaving(true);
    try {
      await userAPI.changePassword(user.userId, passwordForm.oldPassword, passwordForm.newPassword);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      showToast({ type: 'success', message: 'Password changed', always: true, compact: true, duration: 4500 });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      if (mountedRef.current) {
        setPasswordSaving(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose}>
      <div className="profile-panel max-w-lg w-full" style={{ transform: 'translateY(-4px)' }}>
        <div className="profile-panel-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 className="text-lg font-semibold">My Profile</h3>
          <button onClick={onClose} className="text-[var(--text-muted)]">×</button>
        </div>

        <div className="profile-panel-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div className="profile-grid">
            <div className="profile-header">
              <div className="profile-avatar profile-avatar-lg">
                {form.profilePhoto ? <img src={form.profilePhoto} alt="profile" className="w-full h-full object-cover" /> : <span className="text-2xl">{(form.firstName||'')[0]}{(form.lastName||'')[0]}</span>}
              </div>
              <div style={{flex:1}}>
                <label className="block text-sm og-form-label mb-1">Upload photo</label>
                <div className="upload-row">
                  <button type="button" className="upload-btn" onClick={triggerFileSelect}>Browse...</button>
                  <span className="file-name">{fileName || (form.profilePhoto ? 'Current image' : 'No file selected')}</span>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} style={{display:'none'}} />
              </div>
            </div>

            <div className="profile-meta-row">
              <div>
                <span className="og-form-label block mb-1">Username</span>
                <span className="profile-meta-value">{meta.username}</span>
              </div>
              <div>
                <span className="og-form-label block mb-1">Role</span>
                <span className="rounded-lg bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]">{meta.roleName}</span>
              </div>
              <div>
                <span className="og-form-label block mb-1">Status</span>
                <span className={`og-badge ${meta.active ? 'og-badge--active' : 'og-badge--inactive'}`}>{meta.active ? 'Active' : 'Inactive'}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm og-form-label mb-1">First name</label>
              <input value={form.firstName} onChange={(e) => setForm((s) => ({ ...s, firstName: e.target.value }))} className="og-form-control" />
            </div>

            <div>
              <label className="block text-sm og-form-label mb-1">Last name</label>
              <input value={form.lastName} onChange={(e) => setForm((s) => ({ ...s, lastName: e.target.value }))} className="og-form-control" />
            </div>

            <div>
              <label className="block text-sm og-form-label mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} className="og-form-control" />
            </div>

            <div className="profile-actions">
              <button onClick={onClose} className="og-btn og-btn-ghost">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="og-btn og-btn-primary">{saving ? 'Saving...' : 'Save changes'}</button>
            </div>

            <div className="profile-section-divider" />

            <h4 className="text-sm font-semibold text-[var(--text)]">Change password</h4>

            {passwordError && (
              <div className="og-alert og-alert-error">{passwordError}</div>
            )}

            <div>
              <label className="block text-sm og-form-label mb-1">Current password</label>
              <div className="profile-password-input">
                <input
                  type={showOld ? 'text' : 'password'}
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm((s) => ({ ...s, oldPassword: e.target.value }))}
                  className="og-form-control"
                />
                <button type="button" className="profile-password-toggle" onClick={() => setShowOld((s) => !s)} aria-label="Toggle current password visibility">
                  {showOld ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm og-form-label mb-1">New password</label>
              <div className="profile-password-input">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((s) => ({ ...s, newPassword: e.target.value }))}
                  className="og-form-control"
                />
                <button type="button" className="profile-password-toggle" onClick={() => setShowNew((s) => !s)} aria-label="Toggle new password visibility">
                  {showNew ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm og-form-label mb-1">Confirm new password</label>
              <input
                type={showNew ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((s) => ({ ...s, confirmPassword: e.target.value }))}
                className="og-form-control"
              />
            </div>

            <div className="profile-actions">
              <button onClick={handleChangePassword} disabled={passwordSaving} className="og-btn og-btn-primary">
                {passwordSaving ? 'Changing...' : 'Change password'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalContainer>
  );
};

export default ProfileModal;
