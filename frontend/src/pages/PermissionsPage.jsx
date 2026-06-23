import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiAlertCircle, FiSearch } from 'react-icons/fi';
import { permissionAPI } from '../services/api';
import PermissionModal from '../components/PermissionModal';
import { useAuth } from '../context/AuthContext';

// Custom CSS for action buttons
const actionButtonStyles = {
  edit: 'w-9 h-9 flex items-center justify-center border-2 border-[var(--accent)] text-[var(--accent)] rounded-lg hover:bg-[var(--accent)]/10 transition-all',
  delete: 'w-9 h-9 flex items-center justify-center border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-500/10 transition-all'
};

const PermissionsPage = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const { user: authUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');


  const fetchPermissions = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      const response = await permissionAPI.getAll({
        search: searchTerm || undefined,
        category: categoryFilter === 'All' ? undefined : categoryFilter,
        active: statusFilter === 'All' ? undefined : statusFilter === 'Active',
      });
      setPermissions(response.data.content || []);
    } catch (err) {
      setError('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

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
        await fetchPermissions();
      } catch (err) {
        setError('Failed to delete permission');
      }
    }
  };

  const handleSave = async (permissionData) => {
    try {
      if (selectedPermission) {
        await permissionAPI.update(selectedPermission.id, permissionData);
      } else {
        await permissionAPI.create(permissionData);
      }
      setShowModal(false);
      await fetchPermissions();
    } catch (err) {
      // re-throw so PermissionModal can display the actual server message
      throw err;
    }
  };

  const categories = useMemo(() => {
    const cats = new Set(permissions.map(p => p.category).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [permissions]);

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

  const filteredPermissions = permissions.filter(perm => {
    const matchesSearch = perm.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (perm.description && perm.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (perm.category && perm.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'All' || perm.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || 
                          (statusFilter === 'Active' && perm.active) || 
                          (statusFilter === 'Inactive' && !perm.active);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold text-[var(--text)]">Permissions Management</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)]"
            />
            <FiSearch className="absolute left-3 top-2.5 text-[var(--text-muted)]" />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); }}
            className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); }}
            className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {(searchTerm || categoryFilter !== 'All' || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('All');
                setStatusFilter('All');
              }}
              className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] hover:bg-[var(--surface)] transition-all"
            >
              Clear Filters
            </button>
          )}

          {authUser?.roleName === 'ADMIN' && (
            <button
              onClick={handleAdd}
              className="og-btn og-btn-primary flex items-center space-x-2"
            >
              <FiPlus /> <span>Add Permission</span>
            </button>
          )}
        </div>
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
            {filteredPermissions.map((permission) => (
              <tr key={permission.id} className="transition-colors hover:bg-[var(--surface)]">
                <td className="px-6 py-4 text-sm font-semibold text-[var(--text)]">{permission.name}</td>
                <td className="px-6 py-4 text-sm text-[var(--text)]">{permission.description}</td>
                <td className="px-6 py-4 text-sm text-[var(--text)]">
                  <span className="rounded-lg bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]">
                    {permission.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      permission.active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {permission.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm flex items-center gap-3">
                  {authUser?.roleName === 'ADMIN' || authUser?.roleName === 'EDITOR' ? (
                    <button
                      onClick={() => handleEdit(permission)}
                      className={actionButtonStyles.edit}
                      title="Edit permission"
                    >
                      <FiEdit size={18} />
                    </button>
                  ) : null}
                  {authUser?.roleName === 'ADMIN' ? (
                    <button
                      onClick={() => handleDelete(permission.id)}
                      className={actionButtonStyles.delete}
                      title="Delete permission"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  ) : null}
                  {authUser?.roleName !== 'ADMIN' && authUser?.roleName !== 'EDITOR' ? (
                    <span className="text-sm text-[var(--text-muted)]">—</span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPermissions.length === 0 && (
          <div className="text-center py-8 text-[var(--text-muted)]">
            No matching records found.
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
