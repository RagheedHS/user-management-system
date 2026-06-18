import React, { useState, useEffect, useMemo, useContext } from 'react';
import { apiService } from './services/api';
import './App.css';
import { AuthContext } from './context/AuthContext';
import LoginForm from './components/LoginForm.jsx';
import UsersTable from './components/UsersTable.jsx';
import RolesTable from './components/RolesTable.jsx';
import PermissionsTable from './components/PermissionsTable.jsx';
import HierarchyTable from './components/HierarchyTable.jsx';

function App() {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('ums_theme') || 'dark');
  
  // Search & Filters
  const [activeTab, setActiveTab] = useState('Users');

  // Modals & Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null if adding new user
  const [deletingUser, setDeletingUser] = useState(null); // user object to delete

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Viewer',
    status: 'Active',
    avatar: ''
  });

  // Notifications & Activities
  const [notifications, setNotifications] = useState([]);
  const [activities, setActivities] = useState([
    { id: 1, text: "System initialized", time: "Just now" }
  ]);

  // Load Users
  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (err) {
      addNotification('Failed to fetch users', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Theme Sync
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ums_theme', theme);
  }, [theme]);

  // Add Notification helper
  const addNotification = (text, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  // Add Activity helper
  const addActivity = (text) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setActivities(prev => [{ id: Date.now(), text, time }, ...prev.slice(0, 7)]);
  };

  // Toggle Theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Handle Form Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Open Drawer for Add User
  const openAddDrawer = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'Viewer',
      status: 'Active',
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random()*999999)}?w=150`
    });
    setIsDrawerOpen(true);
  };

  // Open Drawer for Edit User
  const openEditDrawer = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatar || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150`
    });
    setIsDrawerOpen(true);
  };

  // Submit Drawer Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      addNotification('Name and email are required', 'danger');
      return;
    }

    try {
      if (editingUser) {
        // Edit User
        const updated = await apiService.updateUser(editingUser.id, formData);
        setUsers(prev => prev.map(u => u.id === editingUser.id ? updated : u));
        addNotification(`User "${formData.name}" updated successfully`);
        addActivity(`Updated user: ${formData.name}`);
      } else {
        // Add User
        const created = await apiService.createUser(formData);
        setUsers(prev => [...prev, created]);
        addNotification(`User "${formData.name}" added successfully`);
        addActivity(`Added new user: ${formData.name}`);
      }
      setIsDrawerOpen(false);
    } catch (err) {
      addNotification('Operation failed', 'danger');
    }
  };

  // Delete User Confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    try {
      await apiService.deleteUser(deletingUser.id);
      setUsers(prev => prev.filter(u => u.id !== deletingUser.id));
      addNotification(`User "${deletingUser.name}" deleted successfully`, 'success');
      addActivity(`Deleted user: ${deletingUser.name}`);
      setDeletingUser(null);
    } catch (err) {
      addNotification('Failed to delete user', 'danger');
    }
  };

  // Dashboard Stats
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.status === 'Active').length;
    const pending = users.filter(u => u.status === 'Pending').length;
    const admins = users.filter(u => u.role === 'Admin').length;
    return { total, active, pending, admins };
  }, [users]);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <>
      <div className="app-container">
          {/* Sidebar Navigation */}
          <aside className="sidebar">
            <div className="logo-container">
              <div className="logo-icon">U</div>
              <span className="logo-text">CoreManager</span>
            </div>
            <ul className="nav-links">
              {['Users', 'Roles', 'Hierarchy', 'Permissions'].map(tab => (
                <li 
                  key={tab} 
                  className={`nav-item ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                  style={{ cursor: 'pointer' }}
                >
                  {tab === 'Users' && <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}
                  {tab === 'Roles' && <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>}
                  {tab === 'Hierarchy' && <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>}
                  {tab === 'Permissions' && <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>}
                  <span>{tab}</span>
                </li>
              ))}
            </ul>
            <div className="sidebar-footer">
              <button className="theme-toggle-btn" onClick={toggleTheme}>
                {theme === 'dark' ? (
                  <>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707-.707M12 17a5 5 0 100-10 5 5 0 000 10z"/></svg>
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
              <button className="btn-primary" onClick={logout}>Logout</button>
            </div>
          </aside>
          {/* Main Content Area */}
          <main className="main-content">
            <header className="header">
              <div className="header-title">
                <h1>User Management</h1>
                <p>Monitor, update, and manage system roles and permissions.</p>
              </div>
            </header>
            {/* Dashboard content placeholder */}
            <section className="metrics-grid">
    <div className="dashboard-header"><h3>Dashboard</h3><p>Welcome, you are logged in.</p></div>
          <div className="metric-card">
            <div className="metric-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary)' }}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="metric-info">
              <h3>Total Users</h3>
              <p>{stats.total}</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="metric-info">
              <h3>Active Now</h3>
              <p>{stats.active}</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="metric-info">
              <h3>Pending Invite</h3>
              <p>{stats.pending}</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-secondary)' }}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="metric-info">
              <h3>Administrators</h3>
              <p>{stats.admins}</p>
            </div>
          </div>
        </section>

        <div className="dashboard-layout">
          {/* Main Table Directory Card */}
          {activeTab === 'Users' && (
            <UsersTable 
              users={users} 
              loading={loading} 
              openEditDrawer={openEditDrawer} 
              setDeletingUser={setDeletingUser} 
            />
          )}
          {activeTab === 'Roles' && <RolesTable />}
          {activeTab === 'Permissions' && <PermissionsTable />}
          {activeTab === 'Hierarchy' && <HierarchyTable />}

          {/* Activity Panel */}
          <aside className="activity-card">
            <h3>Recent Actions</h3>
            <div className="activity-list">
              {activities.map(act => (
                <div key={act.id} className="activity-item">
                  <div className="activity-dot" />
                  <div>
                    <div className="activity-text">{act.text}</div>
                    <div className="activity-time">{act.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>

      {/* Sliding Form Drawer */}
      <div className={`drawer-backdrop ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)}>
        <div className="drawer" onClick={(e) => e.stopPropagation()}>
          <div className="drawer-header">
            <h2>{editingUser ? 'Edit User Profile' : 'Register New User'}</h2>
            <button className="drawer-close-btn" onClick={() => setIsDrawerOpen(false)}>&times;</button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Jane Doe"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="jane.doe@organization.com"
                required
                disabled={!!editingUser}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="Admin">Admin</option>
                <option value="Editor">Editor</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Account Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setIsDrawerOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                {editingUser ? 'Save Updates' : 'Confirm Registration'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Remove User Account</h3>
            <p>Are you sure you want to delete <strong>{deletingUser.name}</strong>? This action is permanent and cannot be undone.</p>
            <div className="modal-buttons">
              <button className="btn-secondary" onClick={() => setDeletingUser(null)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                style={{ background: 'var(--danger)', boxShadow: '0 4px 15px var(--danger-glow)', flex: 1, justifyContent: 'center' }}
                onClick={handleDeleteConfirm}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast Container */}
      <div className="notifications-container">
        {notifications.map(n => (
          <div key={n.id} className={`notification ${n.type}`}>
            <span>{n.text}</span>
            <button
              onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}

export default App;
