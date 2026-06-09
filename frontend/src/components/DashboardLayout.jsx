import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiLogOut, FiHome, FiUsers, FiKey, FiShield, FiSun, FiMoon } from 'react-icons/fi';

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
    { label: 'Roles', icon: FiShield, path: '/roles' },
    { label: 'Hierarchy', icon: FiShield, path: '/roles/hierarchy' },
    { label: 'Permissions', icon: FiKey, path: '/permissions' },
  ];

  return (
    <div className="flex h-screen og-bg-pattern">
      {/* Sidebar */}
      <aside className="flex w-20 flex-col justify-between lg:w-64 og-sidebar text-sm transition-all duration-300 overflow-hidden">
        <div>
          <div className="p-4 flex items-center justify-between border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-400 flex items-center justify-center shadow-md shadow-cyan-500/10">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12h18" stroke="#012" strokeWidth="1.5"/></svg>
              </div>
              <h1 className="hidden lg:block text-lg font-semibold text-[var(--text-strong)]">Ogero Admin</h1>
            </div>
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
                  <span className="hidden lg:inline-block text-sm">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="px-4 py-4 space-y-3">
          <div className="flex justify-start">
            <button
              onClick={toggleTheme}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] transition hover:bg-[var(--panel)]"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
          </div>
          <div className="flex justify-start">
            <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] transition hover:bg-[var(--panel)]">
              <FiLogOut size={18} />
              <span className="hidden lg:inline-block">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0 flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-full flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[var(--text)]">Admin Dashboard</h2>
              <div className="text-sm text-[var(--text-muted)] mt-1">
                Welcome, <strong className="text-[var(--text-strong)]">{user?.username}</strong>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
