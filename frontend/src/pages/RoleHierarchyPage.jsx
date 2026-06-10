import React, { useEffect, useState } from 'react';
import { roleAPI, permissionAPI } from '../services/api';
import RoleDetailsModal from '../components/RoleDetailsModal';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';

const RoleNode = ({ node, onView, onSetParent }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="pl-4">
      <div className="flex items-center space-x-2 rounded-2xl bg-[var(--surface)]/80 p-3 shadow-[0_6px_18px_rgba(0,0,0,0.08)]">
        {node.children && node.children.length > 0 ? (
          <button
            onClick={() => setOpen(!open)}
            className="text-[var(--text-muted)] transition hover:text-[var(--text-strong)]"
            aria-label={open ? 'Collapse role branch' : 'Expand role branch'}
          >
            {open ? <FiChevronDown /> : <FiChevronRight />}
          </button>
        ) : (
          <div style={{ width: 20 }} />
        )}

        <div className="flex-1">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-semibold text-[var(--text)]">
                {node.name}{' '}
                <span className="text-xs text-[var(--text-muted)]">(Level {node.roleLevel})</span>
              </div>
              <div className="text-xs text-[var(--text-muted)]">{node.description}</div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
              <button
                onClick={() => onView(node)}
                className="text-sm rounded-full border border-[var(--border)] bg-[var(--card-bg)] px-3 py-1 text-[var(--text)] transition hover:bg-[var(--panel)]"
              >
                Details
              </button>
              <button
                onClick={() => onSetParent(node)}
                className="text-sm rounded-full border border-[var(--border)] bg-[var(--bg)]/70 px-3 py-1 text-[var(--text)] transition hover:bg-[var(--surface)]"
              >
                Set Parent
              </button>
            </div>
          </div>
        </div>
      </div>

      {open && node.children && node.children.length > 0 && (
        <div className="pl-4 border-l border-[var(--border)] mt-3 space-y-3">
          {node.children.map((child) => (
            <RoleNode key={child.id} node={child} onView={onView} onSetParent={onSetParent} />
          ))}
        </div>
      )}
    </div>
  );
};

const RoleHierarchyPage = () => {
  const [tree, setTree] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailsRole, setDetailsRole] = useState(null);

  const load = async () => {
    try {
      setError('');
      const [hRes, allRes] = await Promise.all([roleAPI.getHierarchy(), roleAPI.getAll()]);
      setTree(hRes.data);
      setRoles(allRes.data);
    } catch (err) {
      setError('Failed to load role hierarchy');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleView = (node) => {
    setDetailsRole(node);
  };

  const handleSetParent = async (node) => {
    // open details modal with edit parent action enabled
    setDetailsRole(node);
  };

  const onParentUpdated = async () => {
    await load();
    setDetailsRole(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[var(--accent)] border-r-transparent"></div>
        <p className="mt-4 text-[var(--text-muted)]">Loading hierarchy...</p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold text-[var(--text)]">Role Hierarchy</h1>
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-600/20 bg-red-600/10 p-3 text-red-600">{error}</div>}

      <div className="og-card">
        {tree.length === 0 && <div className="text-[var(--text-muted)] p-4">No roles present.</div>}
        <div className="space-y-3 p-2">
          {tree.map((root) => (
            <RoleNode key={root.id} node={root} onView={handleView} onSetParent={handleSetParent} />
          ))}
        </div>
      </div>

      {detailsRole && (
        <RoleDetailsModal roleId={detailsRole.id} roles={roles} onClose={() => setDetailsRole(null)} onUpdated={onParentUpdated} />
      )}
    </div>
  );
};

export default RoleHierarchyPage;
