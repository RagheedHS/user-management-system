import React from 'react';

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid var(--border)' }}>
      <div className="pagination-info" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
      </div>
      <div className="pagination-controls" style={{ display: 'flex', gap: '0.25rem' }}>
        <button 
          className="btn-icon" 
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          style={{ padding: '0.5rem', borderRadius: '4px' }}
        >
          &lt;
        </button>
        {pages.map(page => (
          <button
            key={page}
            className={`btn-icon ${currentPage === page ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
            style={{ 
              padding: '0.5rem 0.75rem', 
              borderRadius: '4px',
              background: currentPage === page ? 'var(--primary)' : 'transparent',
              color: currentPage === page ? '#fff' : 'inherit',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {page}
          </button>
        ))}
        <button 
          className="btn-icon" 
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          style={{ padding: '0.5rem', borderRadius: '4px' }}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default Pagination;
