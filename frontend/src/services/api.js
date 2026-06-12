import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock Local Databases
let mockUsers = [
  { id: 1, userId: 1, username: 'admin.ogero', email: 'admin@ogero.lb', firstName: 'Omar', lastName: 'Ghalayini', roleName: 'ADMIN', active: true, roleId: 1 },
  { id: 2, userId: 2, username: 'operator.user', email: 'operator@ogero.lb', firstName: 'Nour', lastName: 'Haddad', roleName: 'OPERATOR', active: true, roleId: 2 },
  { id: 3, userId: 3, username: 'viewer.user', email: 'viewer@ogero.lb', firstName: 'Rami', lastName: 'Lebanon', roleName: 'VIEWER', active: false, roleId: 3 }
];

let mockRoles = [
  { id: 1, name: 'ADMIN', description: 'Full access to all system modules and permissions management', roleLevel: 1, permissionIds: [101, 102, 103], active: true },
  { id: 2, name: 'OPERATOR', description: 'Operational access to users and views profiles', roleLevel: 2, permissionIds: [101, 102], active: true },
  { id: 3, name: 'VIEWER', description: 'Read-only access to metrics and user listings', roleLevel: 3, permissionIds: [101], active: true }
];

let mockPermissions = [
  { id: 101, name: 'READ_USERS', description: 'Allows viewing general user profiles', category: 'User Management', active: true },
  { id: 102, name: 'WRITE_USERS', description: 'Allows creating and editing user profiles', category: 'User Management', active: true },
  { id: 103, name: 'MANAGE_ROLES', description: 'Allows modifying system roles and permissions', category: 'Role Management', active: true }
];

let mockNotifications = [
  { id: 1, text: 'Backup database process finished successfully', time: new Date().toISOString(), isStatic: false, read: false },
  { id: 2, text: 'New user registered: Rami Lebanon', time: new Date().toISOString(), isStatic: false, read: true }
];

// Helper to simulate network delay
const delay = (ms = 350) => new Promise(resolve => setTimeout(resolve, ms));

// Auth API Mock
export const authAPI = {
  login: async (username, password) => {
    await delay();
    return {
      data: {
        token: 'mock-jwt-token-xyz123',
        userId: 1,
        username: username || 'admin.ogero',
        email: 'admin@ogero.lb',
        roleName: 'ADMIN',
        directPermissions: ['READ_USERS', 'WRITE_USERS', 'MANAGE_ROLES'],
        inheritedPermissions: [],
        effectivePermissions: ['READ_USERS', 'WRITE_USERS', 'MANAGE_ROLES']
      }
    };
  },
  register: async (data) => {
    await delay();
    const newUser = {
      id: Date.now(),
      userId: Date.now(),
      username: data.username,
      email: data.email || `${data.username}@ogero.lb`,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      roleName: 'VIEWER',
      active: true,
      roleId: 3
    };
    mockUsers.push(newUser);
    return {
      data: {
        token: 'mock-jwt-token-register',
        userId: newUser.id,
        username: newUser.username,
        email: newUser.email,
        roleName: newUser.roleName
      }
    };
  },
  validateToken: async () => {
    await delay();
    return { data: { valid: true } };
  },
};

// User API Mock
export const userAPI = {
  getAll: async () => {
    await delay();
    return { data: mockUsers };
  },
  getActive: async () => {
    await delay();
    return { data: mockUsers.filter(u => u.active) };
  },
  getById: async (id) => {
    await delay();
    const found = mockUsers.find(u => u.id === Number(id) || u.userId === Number(id));
    return { data: found || mockUsers[0] };
  },
  getByUsername: async (username) => {
    await delay();
    const found = mockUsers.find(u => u.username === username);
    return { data: found || mockUsers[0] };
  },
  create: async (userData, roleId) => {
    await delay();
    const selectedRole = mockRoles.find(r => r.id === Number(roleId)) || { name: 'VIEWER' };
    const newUser = {
      ...userData,
      id: Date.now(),
      userId: Date.now(),
      roleName: selectedRole.name,
      active: true,
      roleId: Number(roleId)
    };
    mockUsers.push(newUser);
    return { data: newUser };
  },
  update: async (id, userData, roleId) => {
    await delay();
    const selectedRole = mockRoles.find(r => r.id === Number(roleId));
    mockUsers = mockUsers.map(u => {
      if (u.id === id || u.userId === id) {
        return { 
          ...u, 
          ...userData, 
          roleName: selectedRole ? selectedRole.name : u.roleName,
          roleId: roleId ? Number(roleId) : u.roleId
        };
      }
      return u;
    });
    return { data: userData };
  },
  delete: async (id) => {
    await delay();
    mockUsers = mockUsers.filter(u => u.id !== id && u.userId !== id);
    return { data: true };
  },
  changePassword: async () => { await delay(); return { data: true }; },
  resetPassword: async () => { await delay(); return { data: true }; },
};

// Notification API Mock
export const notificationAPI = {
  list: async () => {
    await delay();
    return { data: mockNotifications };
  },
  unreadCount: async () => {
    await delay();
    const count = mockNotifications.filter(n => !n.read).length;
    return { data: count };
  },
  markRead: async (id) => {
    await delay();
    mockNotifications = mockNotifications.map(n => n.id === id ? { ...n, read: true } : n);
    return { data: true };
  },
};

// Role API Mock
export const roleAPI = {
  getAll: async () => {
    await delay();
    return { data: mockRoles };
  },
  getActive: async () => {
    await delay();
    return { data: mockRoles.filter(r => r.active) };
  },
  getById: async (id) => {
    await delay();
    const found = mockRoles.find(r => r.id === Number(id));
    return { data: found || mockRoles[0] };
  },
  create: async (roleData) => {
    await delay();
    const newRole = { ...roleData, id: Date.now(), permissionIds: roleData.permissionIds || [] };
    mockRoles.push(newRole);
    return { data: newRole };
  },
  update: async (id, roleData) => {
    await delay();
    mockRoles = mockRoles.map(r => r.id === id ? { ...r, ...roleData } : r);
    return { data: roleData };
  },
  getHierarchy: async () => {
    await delay();
    // Reconstruct hierarchical tree representation
    const root = {
      ...mockRoles[0],
      children: [
        {
          ...mockRoles[1],
          children: [
            { ...mockRoles[2], children: [] }
          ]
        }
      ]
    };
    return { data: [root] };
  },
  updateParent: async () => {
    await delay();
    return { data: true };
  },
  delete: async (id) => {
    await delay();
    mockRoles = mockRoles.filter(r => r.id !== id);
    return { data: true };
  },
  addPermission: async (roleId, permissionId) => {
    await delay();
    mockRoles = mockRoles.map(r => {
      if (r.id === roleId) {
        const set = new Set([...r.permissionIds, Number(permissionId)]);
        return { ...r, permissionIds: Array.from(set) };
      }
      return r;
    });
    return { data: true };
  },
  removePermission: async (roleId, permissionId) => {
    await delay();
    mockRoles = mockRoles.map(r => {
      if (r.id === roleId) {
        return { ...r, permissionIds: r.permissionIds.filter(pid => pid !== Number(permissionId)) };
      }
      return r;
    });
    return { data: true };
  },
};

// Permission API Mock
export const permissionAPI = {
  getAll: async () => {
    await delay();
    return { data: mockPermissions };
  },
  getById: async (id) => {
    await delay();
    const found = mockPermissions.find(p => p.id === Number(id));
    return { data: found || mockPermissions[0] };
  },
  create: async (permissionData) => {
    await delay();
    const newPerm = { ...permissionData, id: Date.now() };
    mockPermissions.push(newPerm);
    return { data: newPerm };
  },
  update: async (id, permissionData) => {
    await delay();
    mockPermissions = mockPermissions.map(p => p.id === id ? { ...p, ...permissionData } : p);
    return { data: permissionData };
  },
  delete: async (id) => {
    await delay();
    mockPermissions = mockPermissions.filter(p => p.id !== id);
    return { data: true };
  },
};

export default api;