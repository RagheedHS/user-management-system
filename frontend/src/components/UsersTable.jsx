import React, { useState, useMemo } from 'react';
import Pagination from './Pagination';

const UsersTable = ({ users, loading, openEditDrawer, setDeletingUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleFilterChange = (e, setter) => {
    setter(e.target.value);
    setCurrentPage(1); // Reset page on filter
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('All');
    setStatusFilter('All');
    setCurrentPage(1);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const filteredUsers = useMemo(() => {
    return users
      .filter(user => {
        const username = user.username || '';
        const name = user.name || '';
        const email = user.email || '';
        
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              username.toLowerCase().includes(searchTerm.toLowerCase());
                              
        const matchesRole = roleFilter === 'All' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortBy] || '';
        let valB = b[sortBy] || '';
        
        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [users, searchTerm, roleFilter, statusFilter, sortBy, sortOrder]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage]);

  return (
    <div className="data-card" style={{ marginTop: '1.5rem' }}>
      <div className="table-controls">
        <div className="search-input-wrapper">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search username, name, or email..."
            value={searchTerm}
            onChange={(e) => handleFilterChange(e, setSearchTerm)}
            className="search-input"
          />
        </div>

        <div className="filters-wrapper">
          <select
            value={roleFilter}
            onChange={(e) => handleFilterChange(e, setRoleFilter)}
            className="filter-select"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Editor">Editor</option>
            <option value="Viewer">Viewer</option>
            <option value="MANAGER">MANAGER</option>
            <option value="USER">USER</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(e, setStatusFilter)}
            className="filter-select"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Pending">Pending</option>
          </select>

          {(searchTerm || roleFilter !== 'All' || statusFilter !== 'All') && (
            <button className="btn-secondary" onClick={clearFilters} style={{ padding: '0.5rem 1rem' }}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="table-responsive">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            Loading directory records...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            No directory records found matching your filters.
          </div>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                  Name {sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th>Username</th>
                <th onClick={() => handleSort('role')} style={{ cursor: 'pointer' }}>
                  Role {sortBy === 'role' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                  Status {sortBy === 'status' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer' }}>
                  Created Date {sortBy === 'createdAt' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-profile">
                      <img
                        src={user.avatar || `https://images.unsplash.com/photo-${1500000000000 + (user.id * 1000)}?w=150`}
                        alt={user.name}
                        className="user-avatar"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'; }}
                      />
                      <div>
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{user.username || '-'}</td>
                  <td>
                    <span className="badge badge-role">{user.role}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : '-'}
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="btn-icon btn-icon-edit"
                        onClick={() => openEditDrawer(user)}
                        title="Edit user details"
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        className="btn-icon btn-icon-delete"
                        onClick={() => setDeletingUser(user)}
                        title="Delete user profile"
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <Pagination 
        currentPage={currentPage} 
        totalItems={filteredUsers.length} 
        itemsPerPage={itemsPerPage} 
        onPageChange={setCurrentPage} 
      />
    </div>
  );
};

export default UsersTable;
