import React, { useState, useEffect, useRef } from 'react';
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

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [sizeOpen, setSizeOpen] = useState(false);
  const sizeRef = useRef(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const searchTimer = useRef(null);

  const renderPageNumbers = () => {
    const pages = [];
    const start = Math.max(0, page - 2);
    const end = Math.min(Math.max(0, totalPages - 1), page + 2);
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError('');
        setLoading(true);
        const [usersRes, rolesRes] = await Promise.all([
          userAPI.getAll({ page, size, q }),
          roleAPI.getAll(),
        ]);

        const data = usersRes.data || {};
        const items = data.content ?? data;
        setUsers(items);
        setTotalPages(data.totalPages ?? 0);
        setTotalElements(data.totalElements ?? (items ? items.length : 0));
        setRoles(rolesRes.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    }, [page, size, q]);

    // close size dropdown when clicking outside
    useEffect(() => {
      const onDocClick = (e) => {
        if (!sizeRef.current) return;
        if (!sizeRef.current.contains(e.target)) setSizeOpen(false);
      };
      document.addEventListener('mousedown', onDocClick);
      return () => document.removeEventListener('mousedown', onDocClick);
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
        showToast({ type: 'success', message: 'User deleted', always: true });
        setPage(0);
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
        showToast({ type: 'success', message: 'User created', always: true });
        setPage(0);
      }
      setShowModal(false);
    } catch (err) {
      setError('Failed to save user');
    }
  };

  const [searchInput, setSearchInput] = useState('');

  const handleSearchChange = (value) => {
    setSearchInput(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setQ(value);
      setPage(0);
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

  const filteredUsers = users.filter((user) => {
    const matchesRole = roleFilter === 'All' || user.roleName === roleFilter;
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && user.active) ||
      (statusFilter === 'Inactive' && !user.active);
    return matchesRole && matchesStatus;
  });

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
            onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
            className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm"
          >
            <option value="All">All Roles</option>
            {roles.map(r => (
              <option key={r.id} value={r.name}>{r.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
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
                setPage(0);
              }}
              className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] hover:bg-[var(--surface)] transition-all"
            >
              Clear Filters
            </button>
          )}
          {(authUser?.roleName === 'ADMIN' || authUser?.roleName === 'MANAGER') && (
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
                    {authUser?.roleName === 'ADMIN' || authUser?.roleName === 'MANAGER' ? (
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

      {/* Pagination controls */}
      <div className="flex items-center justify-between mt-4 users-pagination">
        <div className="text-sm text-[var(--text-muted)]">
          Showing <strong>{Math.min(page * size + 1, totalElements || 0)}</strong> - <strong>{Math.min((page + 1) * size, totalElements || 0)}</strong> of <strong>{totalElements}</strong>
        </div>
        <div className="flex items-center gap-3">
          <div ref={sizeRef} className="relative inline-block og-select-wrapper og-select-pill h-9 flex items-center px-3">
            {/* trigger button that displays current size */}
            <button
              type="button"
              className="og-select-trigger w-full flex items-center justify-center gap-2"
              aria-haspopup="listbox"
              aria-expanded={sizeOpen}
              onClick={() => setSizeOpen((s) => !s)}
              onKeyDown={(e) => { if (e.key === 'Escape') setSizeOpen(false); }}
            >
              <span className="og-select-value text-sm font-semibold">{size}</span>
              <svg aria-hidden="true" className="text-[var(--text-muted)]" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* custom dropdown menu */}
            {sizeOpen && (
              <div className="og-select-menu" role="listbox" aria-label="Items per page options">
                {[10,20,50].map((v) => (
                  <button
                    key={v}
                    type="button"
                    role="option"
                    aria-selected={v === size}
                    className={`og-select-option ${v === size ? 'selected' : ''}`}
                    onClick={() => { setSize(v); setPage(0); setSizeOpen(false); }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 0}
              aria-disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className={`og-inline-btn og-inline-btn--glow ${page <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Prev
            </button>

            <div className="flex items-center gap-1">
              {renderPageNumbers().map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${p === page ? 'bg-[var(--accent)]/20 text-[var(--accent)] shadow-sm' : 'bg-transparent text-[var(--text-muted)] hover:bg-[var(--surface)]'}`}
                >
                  {p + 1}
                </button>
              ))}
            </div>

            <button
              disabled={page + 1 >= totalPages}
              aria-disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className={`og-inline-btn og-inline-btn--glow ${page + 1 >= totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Next
            </button>
          </div>

          <div className="px-3 py-2 text-sm text-[var(--text-muted)]">Page {page + 1} of {Math.max(1, totalPages)}</div>
        </div>
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
