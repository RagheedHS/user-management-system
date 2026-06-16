import React, { useEffect, useState } from 'react';
import { notificationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const NotificationsList = ({ onClose, onMarkRead, setUnreadCount, unreadCount }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  const load = async () => {
    try {
      const res = await notificationAPI.list();
      setItems(res.data || []);
    } catch (e) { console.warn('unable to load notifications', e); }
  };

  useEffect(() => { if (user) load(); }, [user]);

  const markRead = async (id) => {
    // optimistic update: mark locally and decrement badge
    setItems((s) => s.map(i => i.id === id ? { ...i, isRead: true } : i));
    if (typeof setUnreadCount === 'function') {
      setUnreadCount((prev) => Math.max((prev || 1) - 1, 0));
    } else if (typeof onMarkRead === 'function' && typeof unreadCount === 'number') {
      onMarkRead(Math.max(unreadCount - 1, 0));
    }

    try {
      const res = await notificationAPI.markRead(id);
      const newCount = res?.data ?? 0;
      if (typeof setUnreadCount === 'function') setUnreadCount(newCount);
      else if (typeof onMarkRead === 'function') onMarkRead(newCount);
    } catch (e) {
      console.warn('mark read failed', e);
      // revert optimistic change on failure
      setItems((s) => s.map(i => i.id === id ? { ...i, isRead: false } : i));
      if (typeof setUnreadCount === 'function') setUnreadCount((prev) => (prev || 0) + 1);
      else if (typeof onMarkRead === 'function') onMarkRead((unreadCount || 0) + 1);
    }
  };

  if (!items.length) return <div className="og-notif-empty">No notifications</div>;

  return (
    <div className="og-notif-list">
      {items.map(n => (
        <div key={n.id} className={`og-notif-item ${n.isStatic ? 'og-notif-static' : ''} ${n.isRead ? 'read' : 'unread'}`}>
          <div className="og-notif-text">{n.text}</div>
          <div className="og-notif-actions">
            {!n.isRead && <button onClick={() => markRead(n.id)} className="og-link">Mark read</button>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationsList;
