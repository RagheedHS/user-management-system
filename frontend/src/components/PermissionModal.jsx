import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const PermissionModal = ({ permission, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    active: true,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    'User Management',
    'Role Management',
    'Permission Management',
    'Dashboard',
    'Reports',
    'Settings',
  ];

  useEffect(() => {
    if (permission) {
      setFormData({
        name: permission.name,
        description: permission.description,
        category: permission.category || '',
        active: permission.active,
      });
    }
  }, [permission]);

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
      if (!formData.name || !formData.description || !formData.category) {
        setError('All fields are required');
        setLoading(false);
        return;
      }

      await onSave(formData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save permission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 og-modal-backdrop flex items-start justify-center p-4 z-50 overflow-y-auto sm:items-center">
      <div className="og-modal bg-[var(--card-bg)] text-[var(--text)] shadow-xl w-full max-w-md max-h-[calc(100vh-4rem)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--text)]">
            {permission ? 'Edit Permission' : 'Add Permission'}
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
              Permission Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!!permission}
              placeholder="e.g., CREATE_USER"
              className="og-form-control disabled:bg-[var(--surface)]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium og-form-label mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="What does this permission allow?"
              className="og-form-control"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium og-form-label mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="og-form-control og-form-select"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
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

export default PermissionModal;
