import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon, FiMenu, FiBell, FiSettings } from 'react-icons/fi';
import ProfileModal from './ProfileModal';
import NotificationsList from './NotificationsList';
import { notificationAPI } from '../services/api';
import './Navbar.css';

const Navbar = ({ onToggleSidebar, isSidebarCollapsed }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const rootRef = useRef(null);

  useEffect(() => {
    const handleDocClick = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) {
        setNotifOpen(false);
        setSettingsOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) { setUnreadCount(0); return; }
    let mounted = true;
    notificationAPI.unreadCount().then(res => { if (mounted) setUnreadCount(res.data || 0); }).catch(()=>{});
    return () => { mounted = false };
  }, [isAuthenticated]);

  const togglePanel = (panel) => {
    setNotifOpen((s) => (panel === 'notif' ? !s : false));
    setSettingsOpen((s) => (panel === 'settings' ? !s : false));
    setProfileOpen((s) => (panel === 'profile' ? !s : false));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = (() => {
    const name = user?.username || user?.email || 'U';
    const parts = String(name).split(/[\s._-]+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  })();

  return (
    <nav ref={rootRef} className="og-navbar">
      <div className="og-navbar-left">
        <button className="og-burger" onClick={() => onToggleSidebar && onToggleSidebar()} aria-label="Toggle sidebar">
          <FiMenu size={20} />
        </button>
        {/* brand removed as requested */}

        <ul className="og-nav-links">
          <li><NavLink to="/dashboard" className={({isActive}) => isActive ? 'active' : ''}>Dashboard</NavLink></li>
          <li><NavLink to="/users" className={({isActive}) => isActive ? 'active' : ''}>Users</NavLink></li>
          <li><NavLink to="/roles" end className={({isActive}) => isActive ? 'active' : ''}>Roles</NavLink></li>
          <li><NavLink to="/permissions" className={({isActive}) => isActive ? 'active' : ''}>Permissions</NavLink></li>
        </ul>
      </div>

      <div className="og-navbar-right">
        {/* theme toggle removed from header (kept in sidebar) */}

        {isAuthenticated ? (
          <div className="og-profile-actions">
            <div className="og-notif-wrapper">
              <button className="og-bell" onClick={() => { setNotifOpen((s) => !s); setSettingsOpen(false); setProfileOpen(false); }} aria-label="Notifications">
                <FiBell size={18} />
                {unreadCount > 0 && <span className="og-badge">{unreadCount}</span>}
              </button>
              {notifOpen && ( 
                <div className="og-notif-dropdown">
                  <NotificationsList
                    onClose={() => setNotifOpen(false)}
                    onMarkRead={(c) => setUnreadCount(c)}
                    setUnreadCount={setUnreadCount}
                    unreadCount={unreadCount}
                  />
                </div>
              )}
            </div>

            <button className="og-settings" onClick={() => { setSettingsOpen((s) => !s); setNotifOpen(false); setProfileOpen(false); }} aria-label="Settings">
              <FiSettings size={18} />
            </button>
            {settingsOpen && (
              <div className="og-settings-dropdown">
                <label className="og-settings-row"><input type="checkbox" defaultChecked={localStorage.getItem('enableToasts') !== 'false'} onChange={(e)=>localStorage.setItem('enableToasts', e.target.checked)} /> Enable login toasts</label>
                <label className="og-settings-row"><input type="checkbox" defaultChecked={localStorage.getItem('enableNotifications') !== 'false'} onChange={(e)=>localStorage.setItem('enableNotifications', e.target.checked)} /> Enable notifications</label>
              </div>
            )}

            <button className="og-avatar" onClick={() => { setProfileOpen(true); setNotifOpen(false); setSettingsOpen(false); }} aria-label="Open profile">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt="profile" />
              ) : (
                <span className="og-avatar-initials">{initials}</span>
              )}
            </button>

            {/* logout removed from header (kept in sidebar) */}
          </div>
        ) : (
          <div className="og-auth-actions">
            <button className="og-login" onClick={() => navigate('/login')}>Login</button>
          </div>
        )}

      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      </div>
    </nav>
  );
};

export default Navbar;
