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
    <div className="fixed inset-0 og-modal-backdrop flex items-start justify-center p-4 z-50 overflow-y-auto bg-black/40 sm:items-center" onClick={onClose}>
      <div className="og-modal bg-[var(--card-bg)] w-full max-w-3xl max-h-[calc(100vh-4rem)] overflow-hidden rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="og-modal-header flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
          <h3 className="text-lg font-bold text-[var(--text)]">Role: {role.name}</h3>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text)]"><FiX /></button>
        </div>

        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <div className="text-sm text-[var(--text-muted)]">Description</div>
            <div className="font-medium text-[var(--text)]">{role.description}</div>
          </div>

          <div>
            <div className="text-sm text-[var(--text-muted)]">Parent Role</div>
            <select className="og-form-control og-form-select mt-1" value={parentRoleId} onChange={(e) => setParentRoleId(e.target.value)}>
              <option value="">No parent</option>
              {roles.filter(r => r.id !== role.id).map(r => (
                <option key={r.id} value={r.id}>{r.name} (Level {r.roleLevel})</option>
              ))}
            </select>
            <div className="mt-2 flex flex-wrap gap-2">
              <button onClick={handleSaveParent} disabled={saving} className="og-btn og-btn-primary">{saving ? 'Saving...' : 'Save Parent'}</button>
              <button onClick={() => { setParentRoleId(''); }} className="og-btn og-btn-ghost">Clear</button>
            </div>
          </div>

          <div>
            <div className="text-sm text-[var(--text-muted)]">Direct Permissions</div>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {allPermissions.filter(p => directIds.has(p.id)).map(p => (
                <div key={p.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text)]">{p.name}</div>
              ))}
              {directIds.size === 0 && <div className="text-[var(--text-muted)]">No direct permissions</div>}
            </div>
          </div>

          <div>
            <div className="text-sm text-[var(--text-muted)]">Inherited Permissions</div>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {allPermissions.filter(p => inheritedIds.has(p.id)).map(p => (
                <div key={p.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text)]">{p.name}</div>
              ))}
              {inheritedIds.size === 0 && <div className="text-[var(--text-muted)]">No inherited permissions</div>}
            </div>
          </div>

          <div>
            <div className="text-sm text-[var(--text-muted)]">Effective Permissions</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {effective.map(name => (
                <div key={name} className="rounded-full bg-[var(--accent)]/10 px-3 py-1 text-sm text-[var(--text)]">{name}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[var(--border)] flex justify-end">
          <button onClick={onClose} className="og-btn og-btn-ghost">Close</button>
        </div>
      </div>
    </div>
  );
};

export default RoleDetailsModal;
