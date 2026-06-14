import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiAlertCircle, FiEye } from 'react-icons/fi';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError('');
        const [rolesRes, permissionsRes] = await Promise.all([
          roleAPI.getAll(),
          permissionAPI.getAll(),
        ]);
        setRoles(rolesRes.data);
        setPermissions(permissionsRes.data);
      } catch (err) {
        setError('Failed to load roles');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold text-[var(--text)]">Roles Management</h1>
        <div className="flex flex-wrap items-center gap-3">
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
            {roles.map((role) => (
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
        {roles.length === 0 && (
          <div className="text-center py-8 text-[var(--text-muted)]">
            No roles found. Click "Add Role" to create one.
          </div>
        )}
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
