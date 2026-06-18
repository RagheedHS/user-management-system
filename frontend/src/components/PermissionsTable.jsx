import React, { useState, useMemo } from 'react';
import Pagination from './Pagination';

const mockPermissions = [
  { id: 1, name: 'view_users', category: 'User Management', description: 'Can view user details', active: true },
  { id: 2, name: 'create_users', category: 'User Management', description: 'Can create new users', active: true },
  { id: 3, name: 'edit_roles', category: 'Role Management', description: 'Can edit existing roles', active: true },
  { id: 4, name: 'delete_roles', category: 'Role Management', description: 'Can delete roles', active: false },
  { id: 5, name: 'view_billing', category: 'Finance', description: 'Can view billing information', active: true },
  { id: 6, name: 'manage_api_keys', category: 'System', description: 'Can manage API keys', active: false },
  { id: 7, name: 'view_reports', category: 'Analytics', description: 'Can view system reports', active: true },
];

const PermissionsTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleFilterChange = (e, setter) => {
    setter(e.target.value);
    setCurrentPage(1); // Reset page on filter
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setStatusFilter('All');
    setCurrentPage(1);
  };

  const categories = useMemo(() => {
    const cats = new Set(mockPermissions.map(p => p.category));
    return ['All', ...Array.from(cats)];
  }, []);

  const filteredPermissions = useMemo(() => {
    return mockPermissions.filter(perm => {
      const matchesSearch = perm.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            perm.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            perm.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'All' || perm.category === categoryFilter;

      let matchesStatus = true;
      if (statusFilter === 'Active') matchesStatus = perm.active === true;
      if (statusFilter === 'Inactive') matchesStatus = perm.active === false;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchTerm, categoryFilter, statusFilter]);

  // Pagination slice
  const paginatedPermissions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPermissions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPermissions, currentPage]);

  return (
    <div className="data-card" style={{ marginTop: '1.5rem' }}>
      <div className="table-controls">
        <div className="search-input-wrapper">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search permission name, category, or description..."
            value={searchTerm}
            onChange={(e) => handleFilterChange(e, setSearchTerm)}
            className="search-input"
          />
        </div>

        <div className="filters-wrapper">
          <select
            value={categoryFilter}
            onChange={(e) => handleFilterChange(e, setCategoryFilter)}
            className="filter-select"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(e, setStatusFilter)}
            className="filter-select"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {(searchTerm || categoryFilter !== 'All' || statusFilter !== 'All') && (
            <button className="btn-secondary" onClick={clearFilters} style={{ padding: '0.5rem 1rem' }}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="table-responsive">
        {filteredPermissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            No permissions found matching your filters.
          </div>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>Permission Name</th>
                <th>Category</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPermissions.map((perm) => (
                <tr key={perm.id}>
                  <td><code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>{perm.name}</code></td>
                  <td>{perm.category}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{perm.description}</td>
                  <td>
                    <span className={`badge badge-${perm.active ? 'active' : 'inactive'}`}>
                      {perm.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <Pagination 
        currentPage={currentPage} 
        totalItems={filteredPermissions.length} 
        itemsPerPage={itemsPerPage} 
        onPageChange={setCurrentPage} 
      />
    </div>
  );
};

export default PermissionsTable;
