import React, { useState, useMemo } from 'react';
import Pagination from './Pagination';

const mockRoles = [
  { id: 1, name: 'Admin', description: 'Full access to all system features', active: true, usersCount: 2 },
  { id: 2, name: 'Editor', description: 'Can edit content and manage specific users', active: true, usersCount: 5 },
  { id: 3, name: 'Viewer', description: 'Read-only access to the platform', active: true, usersCount: 120 },
  { id: 4, name: 'Guest', description: 'Temporary access with limited permissions', active: false, usersCount: 0 },
  { id: 5, name: 'Manager', description: 'Can manage team members and view reports', active: true, usersCount: 8 },
];

const RolesTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleFilterChange = (e, setter) => {
    setter(e.target.value);
    setCurrentPage(1); // Reset page on filter
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setCurrentPage(1);
  };

  const filteredRoles = useMemo(() => {
    return mockRoles.filter(role => {
      const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            role.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesStatus = true;
      if (statusFilter === 'Active') matchesStatus = role.active === true;
      if (statusFilter === 'Inactive') matchesStatus = role.active === false;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  // Pagination slice
  const paginatedRoles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRoles.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRoles, currentPage]);

  return (
    <div className="data-card" style={{ marginTop: '1.5rem' }}>
      <div className="table-controls">
        <div className="search-input-wrapper">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search role name or description..."
            value={searchTerm}
            onChange={(e) => handleFilterChange(e, setSearchTerm)}
            className="search-input"
          />
        </div>

        <div className="filters-wrapper">
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(e, setStatusFilter)}
            className="filter-select"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {(searchTerm || statusFilter !== 'All') && (
            <button className="btn-secondary" onClick={clearFilters} style={{ padding: '0.5rem 1rem' }}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="table-responsive">
        {filteredRoles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            No roles found matching your filters.
          </div>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>Role Name</th>
                <th>Description</th>
                <th>Users Assigned</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRoles.map((role) => (
                <tr key={role.id}>
                  <td><strong>{role.name}</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{role.description}</td>
                  <td>{role.usersCount}</td>
                  <td>
                    <span className={`badge badge-${role.active ? 'active' : 'inactive'}`}>
                      {role.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-icon btn-icon-edit" title="Edit role">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <Pagination 
        currentPage={currentPage} 
        totalItems={filteredRoles.length} 
        itemsPerPage={itemsPerPage} 
        onPageChange={setCurrentPage} 
      />
    </div>
  );
};

export default RolesTable;
