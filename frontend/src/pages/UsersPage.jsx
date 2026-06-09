import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiAlertCircle } from 'react-icons/fi';
import { userAPI, roleAPI } from '../services/api';
import UserModal from '../components/UserModal';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError('');
        const [usersRes, rolesRes] = await Promise.all([
          userAPI.getAll(),
          roleAPI.getAll(),
        ]);
        setUsers(usersRes.data);
        setRoles(rolesRes.data);
      } catch (err) {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAdd = () => {
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.delete(id);
        setUsers(users.filter((u) => u.id !== id));
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };

  const handleSave = async (userData) => {
    try {
      if (selectedUser) {
        await userAPI.update(selectedUser.id, userData, userData.roleId);
        setUsers(users.map((u) => (u.id === selectedUser.id ? { ...userData, id: selectedUser.id } : u)));
      } else {
        const response = await userAPI.create(userData, userData.roleId);
        setUsers([...users, response.data]);
      }
      setShowModal(false);
    } catch (err) {
      setError('Failed to save user');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[var(--accent)] border-r-transparent"></div>
          <p className="mt-4 text-[var(--text-muted)]">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold text-[var(--text)]">Users Management</h1>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--button-text)] shadow-md shadow-[var(--accent)]/20 transition hover:brightness-105"
        >
          <FiPlus /> <span>Add User</span>
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
              <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-muted)]">Username</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-muted)]">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-muted)]">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-muted)]">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-muted)]">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-muted)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-[var(--surface)]">
                <td className="px-6 py-4 text-sm text-[var(--text)]">{user.username}</td>
                <td className="px-6 py-4 text-sm text-[var(--text)]">{user.email}</td>
                <td className="px-6 py-4 text-sm text-[var(--text)]">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-6 py-4 text-sm text-[var(--text)]">{user.roleName}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm flex items-center gap-3">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-[var(--accent)] hover:text-[var(--accent-2)] font-semibold"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-500 hover:text-red-700 font-semibold"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-8 text-[var(--text-muted)]">
            No users found. Click "Add User" to create one.
          </div>
        )}
      </div>

      {showModal && (
        <UserModal
          user={selectedUser}
          roles={roles}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default UsersPage;
