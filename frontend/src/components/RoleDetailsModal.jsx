import React, { useEffect, useState } from 'react';
import { roleAPI, permissionAPI } from '../services/api';
import { FiX } from 'react-icons/fi';

const RoleDetailsModal = ({ roleId, roles, onClose, onUpdated }) => {
  const [role, setRole] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [parentRoleId, setParentRoleId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [rRes, pRes] = await Promise.all([roleAPI.getById(roleId), permissionAPI.getAll()]);
      setRole(rRes.data);
      setParentRoleId(rRes.data.parentRoleId || '');
      setAllPermissions(pRes.data);
    };
    load();
  }, [roleId]);

  const handleSaveParent = async () => {
    try {
      setSaving(true);
      const parent = parentRoleId === '' ? null : parentRoleId;
      await roleAPI.updateParent(roleId, parent);
      if (onUpdated) onUpdated();
    } catch (err) {
      // ignore - GlobalExceptionHandler will show
    } finally {
      setSaving(false);
    }
  };

  if (!role) return null;

  const directIds = new Set(role.permissionIds || []);
  const inheritedIds = new Set(role.inheritedPermissionIds || []);
  const effective = role.effectivePermissionNames || [];

  return (
    <div className="fixed inset-0 og-modal-backdrop flex items-center justify-center p-4 z-50">
      <div className="og-modal bg-white/3">
        <div className="og-modal-header flex items-center justify-between">
          <h3 className="text-lg font-bold">Role: {role.name}</h3>
          <button onClick={onClose} className="text-white/70"><FiX /></button>
        </div>

        <div className="og-modal-body space-y-4">
          <div>
            <div className="text-sm text-gray-600">Description</div>
            <div className="font-medium">{role.description}</div>
          </div>

          <div>
            <div className="text-sm text-gray-600">Parent Role</div>
            <select className="mt-1 p-2 border rounded w-full bg-white/5" value={parentRoleId} onChange={(e) => setParentRoleId(e.target.value)}>
              <option value="">No parent</option>
              {roles.filter(r => r.id !== role.id).map(r => (
                <option key={r.id} value={r.id}>{r.name} (Level {r.roleLevel})</option>
              ))}
            </select>
            <div className="mt-2 flex gap-2">
              <button onClick={handleSaveParent} disabled={saving} className="og-btn og-btn-primary">{saving ? 'Saving...' : 'Save Parent'}</button>
              <button onClick={() => { setParentRoleId(''); }} className="og-btn og-btn-ghost">Clear</button>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600">Direct Permissions</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {allPermissions.filter(p => directIds.has(p.id)).map(p => (
                <div key={p.id} className="p-2 border rounded text-sm">{p.name}</div>
              ))}
              {directIds.size === 0 && <div className="text-gray-600">No direct permissions</div>}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600">Inherited Permissions</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {allPermissions.filter(p => inheritedIds.has(p.id)).map(p => (
                <div key={p.id} className="p-2 border rounded text-sm text-gray-700">{p.name}</div>
              ))}
              {inheritedIds.size === 0 && <div className="text-gray-600">No inherited permissions</div>}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600">Effective Permissions</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {effective.map(name => (
                <div key={name} className="px-2 py-1 bg-green-100 rounded text-sm">{name}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end">
          <button onClick={onClose} className="og-btn og-btn-ghost">Close</button>
        </div>
      </div>
    </div>
  );
};

export default RoleDetailsModal;
