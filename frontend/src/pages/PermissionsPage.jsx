import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiAlertCircle } from 'react-icons/fi';
import { permissionAPI } from '../services/api';
import PermissionModal from '../components/PermissionModal';

const PermissionsPage = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setError('');
        const response = await permissionAPI.getAll();
        setPermissions(response.data);
      } catch (err) {
        setError('Failed to load permissions');
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const handleAdd = () => {
    setSelectedPermission(null);
    setShowModal(true);
  };

  const handleEdit = (permission) => {
    setSelectedPermission(permission);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this permission?')) {
      try {
        await permissionAPI.delete(id);
        setPermissions(permissions.filter((p) => p.id !== id));
      } catch (err) {
        setError('Failed to delete permission');
      }
    }
  };

  const handleSave = async (permissionData) => {
    try {
      if (selectedPermission) {
        await permissionAPI.update(selectedPermission.id, permissionData);
        setPermissions(
          permissions.map((p) =>
            p.id === selectedPermission.id ? { ...permissionData, id: selectedPermission.id } : p
          )
        );
      } else {
        const response = await permissionAPI.create(permissionData);
        setPermissions([...permissions, response.data]);
      }
      setShowModal(false);
    } catch (err) {
      setError('Failed to save permission');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[var(--accent)] border-r-transparent"></div>
          <p className="mt-4 text-[var(--text-muted)]">Loading permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold text-[var(--text)]">Permissions Management</h1>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--button-text)] shadow-md shadow-[var(--accent)]/20 transition hover:brightness-105"
        >
          <FiPlus /> <span>Add Permission</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-600 flex items-start">
          <FiAlertCircle className="mr-3 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card-bg)] shadow-[0_20px_60px_rgba(15,23,42,0.08)] overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-[var(--border)] bg-[var(--surface)]">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-muted)]">Permission Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-muted)]">Description</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-muted)]">Category</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-muted)]">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-muted)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((permission) => (
              <tr key={permission.id} className="transition-colors hover:bg-[var(--surface)]">
                <td className="px-6 py-4 text-sm font-semibold text-[var(--text)]">{permission.name}</td>
                <td className="px-6 py-4 text-sm text-[var(--text)]">{permission.description}</td>
                <td className="px-6 py-4 text-sm text-[var(--text)]">
                  <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]">
                    {permission.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      permission.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {permission.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm flex items-center gap-3">
                  <button
                    onClick={() => handleEdit(permission)}
                    className="text-[var(--accent)] hover:text-[var(--accent-2)] font-semibold"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(permission.id)}
                    className="text-red-500 hover:text-red-700 font-semibold"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {permissions.length === 0 && (
          <div className="text-center py-8 text-[var(--text-muted)]">
            No permissions found. Click "Add Permission" to create one.
          </div>
        )}
      </div>

      {showModal && (
        <PermissionModal
          permission={selectedPermission}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default PermissionsPage;
