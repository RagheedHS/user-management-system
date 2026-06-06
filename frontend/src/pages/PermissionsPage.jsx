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
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Permissions Management</h1>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
        >
          <FiPlus /> <span>Add Permission</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start">
          <FiAlertCircle className="mr-3 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Permission Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {permissions.map((permission) => (
              <tr key={permission.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{permission.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{permission.description}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
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
                <td className="px-6 py-4 text-sm space-x-2 flex">
                  <button
                    onClick={() => handleEdit(permission)}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(permission.id)}
                    className="text-red-600 hover:text-red-800 font-semibold"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {permissions.length === 0 && (
          <div className="text-center py-8 text-gray-600">
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
