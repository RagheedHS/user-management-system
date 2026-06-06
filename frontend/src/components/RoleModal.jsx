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
    <div className="fixed inset-0 og-modal-backdrop flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white/3 og-modal my-8">
        <div className="og-modal-header flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            {role ? 'Edit Role' : 'Add Role'}
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="og-modal-body space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!!role}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role Level
              </label>
              <input
                type="number"
                name="roleLevel"
                value={formData.roleLevel}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Role
              </label>
              <select
                name="parentRoleId"
                value={formData.parentRoleId || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                Active
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permissions
            </label>
            <div className="border border-gray-300 rounded-lg p-3 max-h-56 overflow-y-auto">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`permission-${permission.id}`}
                    checked={formData.permissionIds.includes(permission.id)}
                    onChange={() => handlePermissionToggle(permission.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor={`permission-${permission.id}`} className="ml-2 text-sm text-gray-700">
                    {permission.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
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
  );
};

export default RoleModal;
