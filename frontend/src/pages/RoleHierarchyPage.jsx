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

  if (loading) return <div className="p-6">Loading hierarchy...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-[var(--text)]">Role Hierarchy</h1>
      {error && <div className="mb-4 rounded-lg border border-red-600/20 bg-red-600/10 p-3 text-red-600">{error}</div>}

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card-bg)] p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        {tree.length === 0 && <div className="text-[var(--text-muted)]">No roles present.</div>}
        {tree.map((root) => (
          <RoleNode key={root.id} node={root} onView={handleView} onSetParent={handleSetParent} />
        ))}
      </div>

      {detailsRole && (
        <RoleDetailsModal roleId={detailsRole.id} roles={roles} onClose={() => setDetailsRole(null)} onUpdated={onParentUpdated} />
      )}
    </div>
  );
};

export default RoleHierarchyPage;
