import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX, FiLogOut, FiHome, FiUsers, FiKey, FiShield } from 'react-icons/fi';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Dashboard', icon: FiHome, path: '/dashboard' },
    { label: 'Users', icon: FiUsers, path: '/users' },
    { label: 'Roles', icon: FiShield, path: '/roles' },
    { label: 'Hierarchy', icon: FiShield, path: '/roles/hierarchy' },
    { label: 'Permissions', icon: FiKey, path: '/permissions' },
  ];

  return (
    <div className="flex h-screen og-bg-pattern">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} og-sidebar text-sm transition-all duration-300 overflow-hidden`}> 
        <div className="p-4 flex items-center justify-between border-b border-white/3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-cyan-500 to-blue-400 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12h18" stroke="#012" strokeWidth="1.5"/></svg>
            </div>
            {sidebarOpen && <h1 className="text-lg font-semibold">Ogero Admin</h1>}
          </div>

          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md text-muted hover:text-white">
            {sidebarOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>

        <nav className="mt-6 space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `og-nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full px-4 py-4">
          <button onClick={handleLogout} className="w-full og-nav-link text-left">
            <FiLogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-to-r from-white/3 to-transparent border-b border-white/3">
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white/90">Admin Dashboard</h2>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-white/70">
                Welcome, <strong className="text-white">{user?.username}</strong>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
