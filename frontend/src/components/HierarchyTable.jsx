import React, { useState, useMemo } from 'react';
import Pagination from './Pagination';

const mockHierarchy = [
  { id: 1, department: 'Engineering', manager: 'Sarah Connor', employees: 45, status: 'Active' },
  { id: 2, department: 'Product', manager: 'John Connor', employees: 12, status: 'Active' },
  { id: 3, department: 'Marketing', manager: 'Kyle Reese', employees: 8, status: 'Active' },
  { id: 4, department: 'Sales', manager: 'Marcus Wright', employees: 20, status: 'Active' },
  { id: 5, department: 'HR', manager: 'Jane Doe', employees: 5, status: 'Active' },
  { id: 6, department: 'Finance', manager: 'John Smith', employees: 6, status: 'Inactive' },
];

const HierarchyTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleFilterChange = (e, setter) => {
    setter(e.target.value);
    setCurrentPage(1); // Reset page on filter
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const filteredHierarchy = useMemo(() => {
    return mockHierarchy.filter(node => {
      const matchesSearch = node.department.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            node.manager.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [searchTerm]);

  const paginatedHierarchy = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredHierarchy.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredHierarchy, currentPage]);

  return (
    <div className="data-card" style={{ marginTop: '1.5rem' }}>
      <div className="table-controls">
        <div className="search-input-wrapper">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search department or manager..."
            value={searchTerm}
            onChange={(e) => handleFilterChange(e, setSearchTerm)}
            className="search-input"
          />
        </div>

        <div className="filters-wrapper">
          {searchTerm && (
            <button className="btn-secondary" onClick={clearFilters} style={{ padding: '0.5rem 1rem' }}>
              Clear Search
            </button>
          )}
        </div>
      </div>

      <div className="table-responsive">
        {filteredHierarchy.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            No departments found matching your search.
          </div>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Manager</th>
                <th>Employees</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedHierarchy.map((node) => (
                <tr key={node.id}>
                  <td><strong>{node.department}</strong></td>
                  <td>{node.manager}</td>
                  <td>{node.employees}</td>
                  <td>
                    <span className={`badge badge-${node.status.toLowerCase()}`}>
                      {node.status}
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
        totalItems={filteredHierarchy.length} 
        itemsPerPage={itemsPerPage} 
        onPageChange={setCurrentPage} 
      />
    </div>
  );
};

export default HierarchyTable;
