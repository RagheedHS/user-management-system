import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiAlertCircle, FiEye, FiSearch } from 'react-icons/fi';
import { roleAPI, permissionAPI } from '../services/api';
import RoleModal from '../components/RoleModal';
import { useAuth } from '../context/AuthContext';

// Custom CSS for action buttons
const actionButtonStyles = {
  edit: 'w-9 h-9 flex items-center justify-center border-2 border-[var(--accent)] text-[var(--accent)] rounded-lg hover:bg-[var(--accent)]/10 transition-all',
  delete: 'w-9 h-9 flex items-center justify-center border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-500/10 transition-all'
};

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const { user: authUser } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError('');
        setLoading(true);
        const [rolesRes, permissionsRes] = await Promise.all([
          roleAPI.search({
            page,
            size,
            search: searchTerm || undefined,
            active: statusFilter === 'All' ? undefined : statusFilter === 'Active',
          }),
          permissionAPI.getAll(),
        ]);
        setRoles(rolesRes.data.content || []);
        setTotalPages(rolesRes.data.totalPages || 0);
        setTotalElements(rolesRes.data.totalElements || 0);
        setPermissions(permissionsRes.data);
      } catch (err) {
        setError('Failed to load roles');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, size, searchTerm, statusFilter]);

  const handleAdd = () => {
    setSelectedRole(null);
    setShowModal(true);
  };

  const handleEdit = (role) => {
    setSelectedRole(role);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await roleAPI.delete(id);
        setRoles(roles.filter((r) => r.id !== id));
      } catch (err) {
        setError('Failed to delete role');
      }
    }
  };

  const handleSave = async (roleData) => {
    try {
      if (selectedRole) {
        await roleAPI.update(selectedRole.id, roleData);
        setRoles(roles.map((r) => (r.id === selectedRole.id ? { ...roleData, id: selectedRole.id } : r)));
      } else {
        const response = await roleAPI.create(roleData);
        setRoles([...roles, response.data]);
      }
      setShowModal(false);
    } catch (err) {
      setError('Failed to save role');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading roles...</p>
        </div>
      </div>
    );
  }

  const filteredRoles = roles;

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold text-[var(--text)]">Roles Management</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)]"
            />
            <FiSearch className="absolute left-3 top-2.5 text-[var(--text-muted)]" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {(searchTerm || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('All');
              }}
              className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] hover:bg-[var(--surface)] transition-all"
            >
              Clear Filters
            </button>
          )}

          {authUser?.roleName === 'ADMIN' && (
            <button onClick={handleAdd} className="og-btn og-btn-primary flex items-center space-x-2">
              <FiPlus /> <span>Add Role</span>
            </button>
          )}
          {authUser?.roleName === 'ADMIN' && (
            <a href="/roles/hierarchy" className="og-btn inline-flex items-center gap-2 border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] transition hover:bg-[var(--panel)]">
              <FiEye /> <span>View Hierarchy</span>
            </a>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-600 flex items-start">
          <FiAlertCircle className="mr-3 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="og-card overflow-hidden">
        <table className="og-table">
          <thead>
            <tr>
              <th className="text-[var(--text-muted)]">Role Name</th>
              <th className="text-[var(--text-muted)]">Description</th>
              <th className="text-[var(--text-muted)]">Level</th>
              <th className="text-[var(--text-muted)]">Permissions</th>
              <th className="text-[var(--text-muted)]">Status</th>
              <th className="text-[var(--text-muted)]" style={{ width: 140 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoles.map((role) => (
              <tr key={role.id} className="hover:bg-[var(--surface)] transition-colors">
                <td className="font-semibold text-[var(--text)]">{role.name}</td>
                <td className="text-[var(--text-muted)]">{role.description}</td>
                <td className="text-[var(--text)]">{role.roleLevel}</td>
                <td className="text-[var(--text)]">{role.permissionIds ? role.permissionIds.length : 0} permissions</td>
                <td>
                  <span className={`og-badge ${role.active ? 'og-badge--active' : 'og-badge--inactive'}`}>
                    {role.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    {authUser?.roleName === 'ADMIN' ? (
                      <>
                        <button
                          onClick={() => handleEdit(role)}
                          className={actionButtonStyles.edit}
                          title="Edit role"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(role.id)}
                          className={actionButtonStyles.delete}
                          title="Delete role"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </>
                    ) : (
                      <span className="text-sm text-[var(--text-muted)]">—</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRoles.length === 0 && (
          <div className="text-center py-8 text-[var(--text-muted)]">
            No matching records found.
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 mt-4">
        <div className="text-sm text-[var(--text-muted)]">
          Showing {Math.min(page * size + 1, totalElements || 0)} - {Math.min((page + 1) * size, totalElements || 0)} of {totalElements}
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className={`og-inline-btn og-inline-btn--glow ${page <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Prev
          </button>
          <span className="text-sm text-[var(--text-muted)]">Page {page + 1} of {Math.max(1, totalPages)}</span>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className={`og-inline-btn og-inline-btn--glow ${page + 1 >= totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Next
          </button>
        </div>
      </div>

      {showModal && (
        <RoleModal
          role={selectedRole}
          roles={roles}
          permissions={permissions}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default RolesPage;
