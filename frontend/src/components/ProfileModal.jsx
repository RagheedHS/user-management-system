import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userAPI } from '../services/api';
import ModalContainer from './ModalContainer';
import './ProfileModal.css';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', profilePhoto: null });
  const [saving, setSaving] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Try to fetch fresh profile from backend if available
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
              profilePhoto: data.profilePhoto || user?.profilePhoto || null,
            });
            return;
          }
        } catch (e) {
          // fallback to cached values
        }

        setForm({
          firstName: user?.firstName || user?.username || '',
          lastName: user?.lastName || '',
          profilePhoto: user?.profilePhoto || null,
        });
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
        // Try to update via API, fallback to localStorage update
        try {
          await userAPI.update(user.userId, {
            firstName: form.firstName,
            lastName: form.lastName,
            profilePhoto: form.profilePhoto,
          });
        } catch (err) {
          // ignore network errors and fall back
          console.warn('Profile API update failed, falling back to local cache', err?.message || err);
        }

        const updated = { ...user, firstName: form.firstName, lastName: form.lastName, profilePhoto: form.profilePhoto };
        localStorage.setItem('user', JSON.stringify(updated));
        try { if (typeof setUser === 'function') setUser(updated); } catch (e) {}
      } else {
        // no authenticated user — persist locally
        localStorage.setItem('user_temp_profile', JSON.stringify(form));
      }

      window.requestAnimationFrame(() => onClose());
      // light feedback via toast
      setTimeout(() => { try { showToast({ type: 'success', message: 'Profile saved', duration: 3500 }); } catch (e) {} }, 120);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose}>
      <div className="profile-panel max-w-lg w-full" style={{ transform: 'translateY(-4px)' }}>
        <div className="profile-panel-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 className="text-lg font-semibold">Edit profile</h3>
          <button onClick={onClose} className="text-[var(--text-muted)]">×</button>
        </div>

        <div className="profile-panel-body">
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

            <div>
              <label className="block text-sm og-form-label mb-1">First name</label>
              <input value={form.firstName} onChange={(e) => setForm((s) => ({ ...s, firstName: e.target.value }))} className="og-form-control" />
            </div>

            <div>
              <label className="block text-sm og-form-label mb-1">Last name</label>
              <input value={form.lastName} onChange={(e) => setForm((s) => ({ ...s, lastName: e.target.value }))} className="og-form-control" />
            </div>

            <div className="profile-actions">
              <button onClick={onClose} className="og-btn og-btn-ghost">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="og-btn og-btn-primary">{saving ? 'Saving...' : 'Save changes'}</button>
            </div>
          </div>
        </div>
      </div>
    </ModalContainer>
  );
};

export default ProfileModal;
