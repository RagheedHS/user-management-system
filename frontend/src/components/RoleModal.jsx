import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const RoleModal = ({ role, roles, permissions, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    roleLevel: 0,
    permissionIds: [],
    active: true,
    parentRoleId: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description,
        roleLevel: role.roleLevel || 0,
        permissionIds: role.permissionIds || [],
        active: role.active,
        parentRoleId: role.parentRoleId || null,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        roleLevel: 0,
        permissionIds: [],
        active: true,
        parentRoleId: null,
      });
    }
  }, [role]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value, 10) : value,
    }));
  };

  const handlePermissionToggle = (permissionId) => {
    setFormData((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter((id) => id !== permissionId)
        : [...prev.permissionIds, permissionId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.name || !formData.description) {
        setError('Name and description are required');
        setLoading(false);
        return;
      }

      await onSave(formData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 og-modal-backdrop flex items-start justify-center p-4 z-50 overflow-y-auto bg-black/40 sm:items-center"
      onClick={onClose}
    >
      <div
        className="bg-[var(--card-bg)] og-modal my-8 w-full max-w-3xl max-h-[calc(100vh-4rem)] overflow-hidden rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="og-modal-header flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--text)]">
            {role ? 'Edit Role' : 'Add Role'}
          </h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text)]">
            <FiX size={24} />
          </button>
        </div>

        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-6 py-5">
          <form onSubmit={handleSubmit} className="og-modal-body space-y-4">
            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Role Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!!role}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-4 py-2 text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 disabled:bg-[var(--surface)]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Role Level</label>
                <input
                  type="number"
                  name="roleLevel"
                  value={formData.roleLevel}
                  onChange={handleChange}
                  min="0"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-4 py-2 text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-4 py-2 text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Parent Role</label>
                <select
                  name="parentRoleId"
                  value={formData.parentRoleId || ''}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-4 py-2 text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                >
                  <option value="">No parent</option>
                  {roles
                    .filter((r) => !role || r.id !== role.id)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} (Level {r.roleLevel})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  name="active"
                  id="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-[var(--border)] bg-[var(--input-bg)] text-[var(--accent)] focus:ring-[var(--accent)]"
                />
                <label htmlFor="active" className="ml-2 text-sm text-[var(--text)]">
                  Active
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">Permissions</label>
              <div className="max-h-56 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
                {permissions.map((permission) => (
                  <div key={permission.id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`permission-${permission.id}`}
                      checked={formData.permissionIds.includes(permission.id)}
                      onChange={() => handlePermissionToggle(permission.id)}
                      className="h-4 w-4 rounded border-[var(--border)] bg-[var(--input-bg)] text-[var(--accent)] focus:ring-[var(--accent)]"
                    />
                    <label htmlFor={`permission-${permission.id}`} className="ml-2 text-sm text-[var(--text)]">
                      {permission.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              <button type="submit" disabled={loading} className="og-btn og-btn-primary flex-1">
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={onClose} className="og-btn og-btn-ghost flex-1">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoleModal;
