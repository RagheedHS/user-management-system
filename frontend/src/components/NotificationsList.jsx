import React, { useEffect, useState } from 'react';
import { notificationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const NotificationsList = ({ onClose, onMarkRead }) => {
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
    try {
      await notificationAPI.markRead(id);
      setItems((s) => s.map(i => i.id === id ? { ...i, isRead: true } : i));
      // refresh unread count and notify parent
      try {
        const cnt = await notificationAPI.unreadCount();
        if (typeof onMarkRead === 'function') onMarkRead(cnt.data || 0);
      } catch (e) { /* ignore */ }
    } catch (e) { console.warn('mark read failed', e); }
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
