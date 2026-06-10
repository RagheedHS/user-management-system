import React, { createContext, useCallback, useContext, useState } from 'react';
import './Toast.css';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(({ type = 'info', message = '', always = false, duration = 3800 }) => {
    // if not marked always, check user preference for notifications
    if (!always) {
      const enabled = localStorage.getItem('enableNotifications');
      if (enabled === 'false') return;
    }

    const id = Date.now() + Math.random();
    const position = always ? 'center' : 'right';
    setToasts((t) => [...t, { id, type, message, position }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* center (login) toasts */}
      <div className="og-toast-center-container" aria-live="polite">
        {toasts.filter((t) => t.position === 'center').map((t) => (
          <div key={t.id} className={`og-toast og-toast-${t.type}`} role="status">
            {t.message}
          </div>
        ))}
      </div>

      {/* default top-right toasts */}
      <div className="og-toast-container" aria-live="polite">
        {toasts.filter((t) => t.position !== 'center').map((t) => (
          <div key={t.id} className={`og-toast og-toast-${t.type}`} role="status">
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export default ToastContext;
