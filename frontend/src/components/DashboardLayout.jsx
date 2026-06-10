import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiLogOut, FiHome, FiUsers, FiKey, FiShield, FiSun, FiMoon, FiLayers } from 'react-icons/fi';
import Navbar from './Navbar';
import logo from '../assets/Ogero.png';
import Footer from './Footer';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Dashboard', icon: FiHome, path: '/dashboard' },
    { label: 'Users', icon: FiUsers, path: '/users' },
    { label: 'Roles', icon: FiShield, path: '/roles', adminOnly: true },
    { label: 'Hierarchy', icon: FiLayers, path: '/roles/hierarchy', adminOnly: true },
    { label: 'Permissions', icon: FiKey, path: '/permissions', adminOnly: true },
  ];

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen og-bg-pattern">
      {/* Sidebar: render collapsed view (icons only) when collapsed, full view when expanded */}
      <aside className={`flex flex-col justify-between og-sidebar text-sm transition-all duration-300 overflow-hidden ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <div>
          <div className="p-3 flex items-center justify-between border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-transparent flex items-center justify-center shadow-none overflow-hidden">
                <img src={logo} alt="Ogero" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
              </div>
              {!sidebarCollapsed && <h1 className="text-lg font-semibold text-[var(--text-strong)]">Ogero Admin</h1>}
            </div>
            {/* keep burger visible inside sidebar so user can reopen when collapsed */}
            <div className="lg:hidden">
              <button onClick={() => setSidebarCollapsed((s) => !s)} className="p-2">☰</button>
            </div>
          </div>

          <nav className="mt-4 space-y-1 px-2">
            {menuItems
              .filter(item => {
                if (!item.adminOnly) return true;
                return user?.roleName === 'ADMIN';
              })
              .map((item) => {
                const Icon = item.icon;
                const exact = item.path === '/roles';
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={exact}
                    className={({ isActive }) => `og-nav-link ${isActive ? 'active' : ''} flex items-center gap-3 px-3 py-2 rounded-md`}
                  >
                    <Icon size={18} />
                    {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
                  </NavLink>
                );
              })}
          </nav>
        </div>

        <div className="px-3 py-4 space-y-3">
          <div className="flex justify-start">
            <button
              onClick={toggleTheme}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] transition hover:bg-[var(--panel)]"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to light mode'}
            >
              {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
            </button>
          </div>
          <div className="flex justify-start">
            <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)] transition hover:bg-[var(--panel)]">
              <FiLogOut size={16} />
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0 flex-col overflow-hidden">
        {/* Header: improved navbar from customizations */}
        <header className="border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-sm">
            <Navbar onToggleSidebar={() => setSidebarCollapsed((s) => !s)} isSidebarCollapsed={sidebarCollapsed} />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 pb-24">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;
