import React, { useEffect, useState } from 'react';
import { securityAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { FiRefreshCw, FiPlus, FiTrash2 } from 'react-icons/fi';

const SecurityAdminPage = () => {
  const { user: authUser } = useAuth();
  const { showToast } = useToast();

  const [counters, setCounters] = useState({});
  const [windowStarts, setWindowStarts] = useState({});
  const [rejected, setRejected] = useState({});
  const [blocked, setBlocked] = useState([]);
  const [activeConnections, setActiveConnections] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ipInput, setIpInput] = useState('');

  const fetchCounters = async () => {
    try {
      const res = await securityAPI.getCounters();
      const data = res.data || {};
      setActiveConnections(data.activeConnections || 0);
      setCounters(data.counters || {});
      setWindowStarts(data.windowStarts || {});
      setRejected(data.rejected || {});
      setBlocked(data.blockedIPs || []);
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', message: 'Failed to load counters', always: true });
    } finally {
      setLoading(false);
    }
  };

  const fetchBlocked = async () => {
    try {
      const res = await securityAPI.getBlocked();
      setBlocked(res.data.blocked || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCounters();
    const id = setInterval(fetchCounters, 5000);
    return () => clearInterval(id);
  }, []);

  const handleFlush = async () => {
    try {
      await securityAPI.flush();
      showToast({ type: 'success', message: 'Flushed counters', always: true });
      fetchCounters();
    } catch (err) {
      showToast({ type: 'error', message: 'Flush failed', always: true });
    }
  };

  const handleAddBlocked = async () => {
    const ip = ipInput.trim();
    if (!ip) return showToast({ type: 'error', message: 'Enter IP to block', always: true });
    try {
      await securityAPI.addBlocked(ip);
      showToast({ type: 'success', message: `Blocked ${ip}`, always: true });
      setIpInput('');
      fetchCounters();
    } catch (err) {
      showToast({ type: 'error', message: 'Failed to block IP', always: true });
    }
  };

  const handleRemoveBlocked = async (ip) => {
    try {
      await securityAPI.removeBlocked(ip);
      showToast({ type: 'success', message: `Unblocked ${ip}`, always: true });
      fetchCounters();
    } catch (err) {
      showToast({ type: 'error', message: 'Failed to unblock IP', always: true });
    }
  };

  if (!authUser || authUser.roleName !== 'ADMIN') {
    return (
      <div className="og-card">
        <h1 className="text-xl font-semibold">Security</h1>
        <p className="text-[var(--text-muted)]">Admin access required.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[var(--text)]">Security & Rate Limits</h1>
        <div className="flex items-center gap-3">
          <button onClick={fetchCounters} className="og-btn flex flex-col items-center justify-center px-3 py-2">
            <FiRefreshCw className="mb-1" />
            <span className="text-xs">Refresh</span>
          </button>

          <button onClick={handleFlush} className="og-btn og-btn-danger flex flex-col items-center justify-center px-3 py-2">
            {/* inline SVG trash icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
              <path d="M10 11v6"></path>
              <path d="M14 11v6"></path>
              <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
            </svg>
            <span className="text-xs">Flush Counters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="og-card">
          <p className="text-sm text-[var(--text-muted)]">Active Connections</p>
          <p className="text-2xl font-bold mt-2">{activeConnections}</p>
        </div>

        <div className="og-card">
          <p className="text-sm text-[var(--text-muted)]">Unique IPs (tracked)</p>
          <p className="text-2xl font-bold mt-2">{Object.keys(counters || {}).length}</p>
        </div>

        <div className="og-card">
          <p className="text-sm text-[var(--text-muted)]">Rejected Requests (sum)</p>
          <p className="text-2xl font-bold mt-2">{Object.values(rejected || {}).reduce((s, v) => s + (v || 0), 0)}</p>
        </div>
      </div>

      <div className="og-card mb-6">
        <h2 className="text-lg font-semibold mb-3">Top IPs</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="text-sm text-[var(--text-muted)] border-b border-[var(--border)]">
              <tr>
                <th className="px-4 py-2 text-left">IP</th>
                <th className="px-4 py-2 text-left">Count</th>
                <th className="px-4 py-2 text-left">Window Start</th>
                <th className="px-4 py-2 text-left">Rejected</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(counters || {})
                .sort((a, b) => (b[1] || 0) - (a[1] || 0))
                .slice(0, 50)
                .map(([ip, count]) => (
                  <tr key={ip} className="hover:bg-[var(--surface)]">
                    <td className="px-4 py-2">{ip}</td>
                    <td className="px-4 py-2">{count}</td>
                    <td className="px-4 py-2">{windowStarts?.[ip] || '-'}</td>
                    <td className="px-4 py-2">{rejected?.[ip] || 0}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

        <div className="og-card">
        <h2 className="text-lg font-semibold mb-3">Blocked IPs</h2>
          {/* Only admins can add/remove blocked IPs */}
          {authUser?.roleName === 'ADMIN' && (
            <div className="flex gap-2 mb-4">
              <input
                value={ipInput}
                onChange={(e) => setIpInput(e.target.value)}
                placeholder="e.g. 1.2.3.4 or 10.0.0.0/24"
                className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)]"
              />
              <button onClick={handleAddBlocked} className="og-btn og-btn-primary flex items-center gap-2">
                <FiPlus /> Add
              </button>
            </div>
          )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="text-sm text-[var(--text-muted)] border-b border-[var(--border)]">
              <tr>
                <th className="px-4 py-2 text-left">IP</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(blocked || []).map((ip) => (
                <tr key={ip} className="hover:bg-[var(--surface)]">
                  <td className="px-4 py-2">{ip}</td>
                  <td className="px-4 py-2">
                    {authUser?.roleName === 'ADMIN' && (
                      <button onClick={() => handleRemoveBlocked(ip)} className="og-btn og-btn-danger flex items-center gap-2">
                        <FiTrash2 /> Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SecurityAdminPage;
