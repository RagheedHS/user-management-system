import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { FiLogOut, FiHome, FiUsers, FiKey, FiShield, FiSun, FiMoon, FiLayers, FiAlertCircle } from 'react-icons/fi';
import Navbar from './Navbar';
import logo from '../assets/Ogero.png';
import Footer from './Footer';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    try { showToast({ type: 'info', message: 'Logged out successfully', always: true, duration: 3200 }); } catch (e) {}
    logout();
    navigate('/login');
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const menuItems = [
    { label: 'Dashboard', icon: FiHome, path: '/dashboard' },
    { label: 'Users', icon: FiUsers, path: '/users' },
    { label: 'Roles', icon: FiShield, path: '/roles', adminOnly: true },
    { label: 'Hierarchy', icon: FiLayers, path: '/roles/hierarchy', adminOnly: true },
    { label: 'Permissions', icon: FiKey, path: '/permissions', adminOnly: true },
    { label: 'Security', icon: FiAlertCircle, path: '/admin/security', adminOnly: true },
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
            <button onClick={handleLogoutClick} className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)] transition hover:bg-[var(--panel)]">
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

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0">
                <FiAlertCircle className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--text)]">Confirm Logout</h3>
                <p className="text-[var(--text-muted)] mt-1">Are you sure you want to log out?</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelLogout}
                className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--panel)] transition"
              >
                No
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-4 py-2 rounded-lg border-2 border-red-500 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition flex items-center gap-2 font-semibold"
              >
                <FiLogOut size={16} />
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
