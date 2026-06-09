import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const UserModal = ({ user, roles, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    roleId: '',
    active: true,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: user.roleId,
        active: user.active,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.username || !formData.email || !formData.firstName || !formData.lastName || !formData.roleId) {
        setError('All fields are required');
        setLoading(false);
        return;
      }

      await onSave(formData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 og-modal-backdrop flex items-start justify-center p-4 z-50 overflow-y-auto sm:items-center">
      <div className="og-modal bg-[var(--card-bg)] text-[var(--text)] shadow-xl w-full max-w-md max-h-[calc(100vh-4rem)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--text)]">
            {user ? 'Edit User' : 'Add User'}
          </h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text)]">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[calc(100vh-8rem)] overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="og-alert og-alert-error">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium og-form-label mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={!!user}
              className="og-form-control disabled:bg-[var(--surface)]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium og-form-label mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="og-form-control"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium og-form-label mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="og-form-control"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium og-form-label mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="og-form-control"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium og-form-label mb-1">
              Role
            </label>
            <select
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
              className="og-form-control og-form-select"
              required
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="active"
              id="active"
              checked={formData.active}
              onChange={handleChange}
              className="h-4 w-4 rounded border-[var(--border)] bg-[var(--input-bg)] text-[var(--accent)] focus:ring-[var(--accent)]"
            />
            <label htmlFor="active" className="ml-2 text-sm og-form-label">
              Active
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="og-btn og-btn-primary flex-1"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="og-btn og-btn-ghost flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
