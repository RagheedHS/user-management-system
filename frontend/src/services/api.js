import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// If token expires, redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }),

  register: (data) =>
    api.post('/auth/register', {
      username: data.username,
      email: data.email,
      password: data.password,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
    }),

  validateToken: () =>
    api.get('/auth/validate'),
};

// ─── User API ─────────────────────────────────────────────────────────────────
export const userAPI = {
  getAll: ({ q, role, active, sortBy = 'createdAt', sortDir = 'DESC' } = {}) =>
    api.get('/users', { params: { page: 0, size: 10000, q, role, active, sortBy, sortDir } }),

  getActive: () =>
    api.get('/users?active=true'),

  getById: (id) =>
    api.get(`/users/${id}`),

  getByUsername: (username) =>
    api.get(`/users/username/${username}`),
  create: (userData, roleId) =>
    api.post(`/users?roleId=${Number(roleId)}`, {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      active: userData.active !== undefined ? userData.active : true,
    }),

  update: (id, userData, roleId) =>
    api.put(`/users/${id}${roleId ? `?roleId=${Number(roleId)}` : ''}`, {
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      active: userData.active,
      profilePhoto: userData.profilePhoto,
    }),
  delete: (id) =>
    api.delete(`/users/${id}`),

  changePassword: (id, oldPassword, newPassword) =>
    api.put(`/users/${id}/password`, { oldPassword, newPassword }),

  resetPassword: (id, newPassword) =>
    api.put(`/users/${id}/reset-password`, { newPassword }),
};

// ─── Role API ─────────────────────────────────────────────────────────────────
export const roleAPI = {
  getAll: ({ search, active, sortBy = 'roleLevel', sortDir = 'ASC' } = {}) =>
    api.get('/roles', { params: { page: 0, size: 10000, search, active, sortBy, sortDir } }),

  getActive: () =>
    api.get('/roles/active'),

  getById: (id) =>
    api.get(`/roles/${id}`),

  create: (roleData) =>
    api.post('/roles', {
      name: roleData.name,
      description: roleData.description,
      roleLevel: roleData.roleLevel,
      active: roleData.active !== undefined ? roleData.active : true,
      parentRoleId: roleData.parentRoleId || null,
      permissionIds: roleData.permissionIds || [],
    }),

  update: (id, roleData) =>
    api.put(`/roles/${id}`, {
      name: roleData.name,
      description: roleData.description,
      roleLevel: roleData.roleLevel,
      active: roleData.active,
      parentRoleId: roleData.parentRoleId || null,
      permissionIds: roleData.permissionIds || [],
    }),

  delete: (id) =>
    api.delete(`/roles/${id}`),

  getHierarchy: () =>
    api.get('/roles/hierarchy'),

  updateParent: (roleId, parentRoleId) =>
    api.put(`/roles/${roleId}/parent`, { parentRoleId }),

  addPermission: (roleId, permissionId) =>
    api.post(`/roles/${roleId}/permissions/${permissionId}`),

  removePermission: (roleId, permissionId) =>
    api.delete(`/roles/${roleId}/permissions/${permissionId}`),
};

// ─── Permission API ───────────────────────────────────────────────────────────
export const permissionAPI = {
  getAll: ({ search, category, active, sortBy = 'name', sortDir = 'ASC' } = {}) =>
    api.get('/permissions', { params: { page: 0, size: 10000, search, category, active, sortBy, sortDir } }),

  getActive: () =>
    api.get('/permissions/active'),

  getById: (id) =>
    api.get(`/permissions/${id}`),

  create: (permissionData) =>
    api.post('/permissions', {
      name: permissionData.name,
      description: permissionData.description,
      category: permissionData.category,
      active: permissionData.active !== undefined ? permissionData.active : true,
    }),

  update: (id, permissionData) =>
    api.put(`/permissions/${id}`, {
      name: permissionData.name,
      description: permissionData.description,
      category: permissionData.category,
      active: permissionData.active,
    }),

  delete: (id) =>
    api.delete(`/permissions/${id}`),
};

// ─── Notification API ─────────────────────────────────────────────────────────
export const notificationAPI = {
  list: () =>
    api.get('/notifications'),

  unreadCount: () =>
    api.get('/notifications/unread-count'),

  markRead: (id) =>
    api.put(`/notifications/${id}/read`),
};

export const securityAPI = {
  getCounters: () => api.get('/admin/security/counters'),
  flush: () => api.post('/admin/security/flush'),
  getBlocked: () => api.get('/admin/security/blocked'),
  addBlocked: (ip) => api.post('/admin/security/blocked', null, { params: { ip } }),
  removeBlocked: (ip) => api.delete('/admin/security/blocked', { params: { ip } }),
};

export default api;