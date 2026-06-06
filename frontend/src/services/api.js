import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
  register: (data) =>
    api.post('/auth/register', data),
  validateToken: () =>
    api.get('/auth/validate'),
};

// User API
export const userAPI = {
  getAll: () => api.get('/users'),
  getActive: () => api.get('/users/active'),
  getById: (id) => api.get(`/users/${id}`),
  getByUsername: (username) => api.get(`/users/username/${username}`),
  create: (userData, roleId) =>
    api.post('/users', userData, { params: { roleId } }),
  update: (id, userData, roleId) =>
    api.put(`/users/${id}`, userData, { params: { roleId } }),
  delete: (id) => api.delete(`/users/${id}`),
  changePassword: (id, oldPassword, newPassword) =>
    api.post(`/users/${id}/change-password`, null, {
      params: { oldPassword, newPassword },
    }),
  resetPassword: (id, newPassword) =>
    api.post(`/users/${id}/reset-password`, null, {
      params: { newPassword },
    }),
};

// Role API
export const roleAPI = {
  getAll: () => api.get('/roles'),
  getActive: () => api.get('/roles/active'),
  getById: (id) => api.get(`/roles/${id}`),
  create: (roleData) => api.post('/roles', roleData),
  update: (id, roleData) => api.put(`/roles/${id}`, roleData),
  getHierarchy: () => api.get('/roles/hierarchy'),
  updateParent: (id, parentRoleId) => api.put(`/roles/${id}/parent`, null, { params: { parentRoleId } }),
  delete: (id) => api.delete(`/roles/${id}`),
  addPermission: (roleId, permissionId) =>
    api.post(`/roles/${roleId}/permissions/${permissionId}`),
  removePermission: (roleId, permissionId) =>
    api.delete(`/roles/${roleId}/permissions/${permissionId}`),
};

// Permission API
export const permissionAPI = {
  getAll: () => api.get('/permissions'),
  getById: (id) => api.get(`/permissions/${id}`),
  create: (permissionData) => api.post('/permissions', permissionData),
  update: (id, permissionData) => api.put(`/permissions/${id}`, permissionData),
  delete: (id) => api.delete(`/permissions/${id}`),
};

export default api;
