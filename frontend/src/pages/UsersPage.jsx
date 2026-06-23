import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiAlertCircle, FiSearch } from 'react-icons/fi';
import { userAPI, roleAPI } from '../services/api';
import UserModal from '../components/UserModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Custom CSS for action buttons
const actionButtonStyles = {
  edit: 'w-9 h-9 flex items-center justify-center border-2 border-[var(--accent)] text-[var(--accent)] rounded-lg hover:bg-[var(--accent)]/10 transition-all',
  delete: 'w-9 h-9 flex items-center justify-center border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-500/10 transition-all',
  status: 'w-16 h-8 flex items-center justify-center rounded-lg font-semibold text-xs'
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { user: authUser } = useAuth();
  const { showToast } = useToast();

  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const searchTimer = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        userAPI.getAll({
          q,
          role: roleFilter !== 'All' ? roleFilter : undefined,
          active: statusFilter === 'All' ? undefined : statusFilter === 'Active',
        }),
        roleAPI.getActive(),
      ]);

      const data = usersRes.data || {};
      const items = data.content ?? data;
      setUsers(items);
      setRoles(rolesRes.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [q, roleFilter, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);



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
        showToast({ type: 'success', message: 'User deleted', always: true });
        await fetchData();
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };

  const handleSave = async (userData) => {
    try {
      if (selectedUser) {
        await userAPI.update(selectedUser.id, userData, userData.roleId);
        showToast({ type: 'success', message: 'User updated', always: true });
      } else {
        const response = await userAPI.create(userData, userData.roleId);
        const tempPassword = response.data?.temporaryPassword;
        showToast({
          type: 'success',
          message: tempPassword
            ? `User created. Temporary password: ${tempPassword}`
            : 'User created',
          always: true,
        });
      }
      setShowModal(false);
      await fetchData();
    } catch (err) {
      // re-throw so UserModal can display the actual server message (e.g. "Username already exists")
      throw err;
    }
  };

  const [searchInput, setSearchInput] = useState('');

  const handleSearchChange = (value) => {
    setSearchInput(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setQ(value);
    }, 400);
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[var(--accent)] border-r-transparent"></div>
          <p className="mt-4 text-[var(--text-muted)]">Loading users...</p>
        </div>
      </div>
    );
  }

  // role/status filtering happens server-side (see fetchData above)
  const filteredUsers = users;

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold text-[var(--text)]">Users Management</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              placeholder="Search users..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)]"
            />
            <FiSearch className="absolute left-3 top-2.5 text-[var(--text-muted)]" />
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); }}
            className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm"
          >
            <option value="All">All Roles</option>
            {roles.map(r => (
              <option key={r.id} value={r.name}>{r.name}</option>
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

          {(q || roleFilter !== 'All' || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setQ('');
                setRoleFilter('All');
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
              <FiPlus /> <span>Add User</span>
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
              <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-muted)]">Username</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-muted)]">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-muted)]">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-muted)]">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-muted)]">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-muted)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-[var(--surface)]">
                <td className="px-6 py-4 text-sm text-[var(--text)]">{user.username}</td>
                <td className="px-6 py-4 text-sm text-[var(--text)]">{user.email}</td>
                <td className="px-6 py-4 text-sm text-[var(--text)]">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-6 py-4 text-sm text-[var(--text)]">{user.roleName}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${user.active ? 'bg-green-400' : 'bg-red-400'} ${user.active ? 'og-pulse-dot' : ''}`} />
                    <span
                      className={`${actionButtonStyles.status} ${
                        user.active
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-3">
                    {authUser?.roleName === 'ADMIN' || authUser?.roleName === 'EDITOR' ? (
                      <>
                        <button
                          onClick={() => handleEdit(user)}
                          className={actionButtonStyles.edit}
                          title="Edit user"
                        >
                          <FiEdit size={18} />
                        </button>
                        {authUser?.roleName === 'ADMIN' ? (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className={actionButtonStyles.delete}
                            title="Delete user"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        ) : null}
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
        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-[var(--text-muted)]">
            No matching records found.
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
