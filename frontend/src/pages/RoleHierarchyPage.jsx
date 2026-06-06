import React, { useEffect, useState } from 'react';
import { roleAPI, permissionAPI } from '../services/api';
import RoleDetailsModal from '../components/RoleDetailsModal';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';

const RoleNode = ({ node, onView, onSetParent }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="pl-4">
      <div className="flex items-center space-x-2 py-1">
        {node.children && node.children.length > 0 ? (
          <button onClick={() => setOpen(!open)} className="text-gray-500">
            {open ? <FiChevronDown /> : <FiChevronRight />}
          </button>
        ) : (
          <div style={{ width: 20 }} />
        )}

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{node.name} <span className="text-xs text-gray-500">(Level {node.roleLevel})</span></div>
              <div className="text-xs text-gray-600">{node.description}</div>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => onView(node)} className="text-sm px-3 py-1 bg-gray-100 rounded">Details</button>
              <button onClick={() => onSetParent(node)} className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded">Set Parent</button>
            </div>
          </div>
        </div>
      </div>

      {open && node.children && node.children.length > 0 && (
        <div className="pl-4 border-l border-gray-100">
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
      <h1 className="text-2xl font-bold mb-4">Role Hierarchy</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}

      <div className="bg-white rounded shadow p-4">
        {tree.length === 0 && <div className="text-gray-600">No roles present.</div>}
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
