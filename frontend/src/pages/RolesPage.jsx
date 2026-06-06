import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiAlertCircle } from 'react-icons/fi';
import { roleAPI, permissionAPI } from '../services/api';
import RoleModal from '../components/RoleModal';

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Roles Management</h1>
        <div className="flex items-center space-x-2">
          <button onClick={handleAdd} className="og-btn og-btn-primary flex items-center space-x-2">
            <FiPlus /> <span>Add Role</span>
          </button>
          <a href="/roles/hierarchy" className="inline-block ml-2 px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm">View Hierarchy</a>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start">
          <FiAlertCircle className="mr-3 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="og-card overflow-hidden">
        <table className="og-table">
          <thead>
            <tr>
              <th>Role Name</th>
              <th>Description</th>
              <th>Level</th>
              <th>Permissions</th>
              <th>Status</th>
              <th style={{ width: 140 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id}>
                <td className="font-semibold">{role.name}</td>
                <td className="text-white/70">{role.description}</td>
                <td>{role.roleLevel}</td>
                <td>{role.permissionIds ? role.permissionIds.length : 0} permissions</td>
                <td>
                  <span className={`og-badge ${role.active ? 'og-badge--active' : 'og-badge--inactive'}`}>
                    {role.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleEdit(role)} className="og-btn og-btn-ghost flex items-center gap-2">
                      <FiEdit /> <span className="text-sm">Edit</span>
                    </button>
                    <button onClick={() => handleDelete(role.id)} className="og-btn og-btn-ghost text-red-400">
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {roles.length === 0 && (
          <div className="text-center py-8 text-white/60">
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
