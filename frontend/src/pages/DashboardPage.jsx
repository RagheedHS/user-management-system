import React, { useState, useEffect } from 'react';
import { FiUsers, FiShield, FiKey, FiAlertCircle } from 'react-icons/fi';
import { userAPI, roleAPI, permissionAPI } from '../services/api';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    userCount: 0,
    roleCount: 0,
    permissionCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setError('');
        const [usersRes, rolesRes, permissionsRes] = await Promise.all([
          userAPI.getAll(),
          roleAPI.getAll(),
          permissionAPI.getAll(),
        ]);

        setStats({
          userCount: usersRes.data.length,
          roleCount: rolesRes.data.length,
          permissionCount: permissionsRes.data.length,
        });
      } catch (err) {
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Operational Dashboard</h1>
        <div className="text-sm text-white/70">Last updated: just now</div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-600/10 border border-red-600/20 text-red-300 rounded-lg flex items-start">
          <FiAlertCircle className="mr-3 mt-0.5 flex-shrink-0 text-red-300" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="og-card og-kpi">
          <div>
            <p className="text-sm text-white/70">Total Users</p>
            <p className="text-2xl font-bold mt-2">{stats.userCount}</p>
          </div>
          <div className="icon bg-gradient-to-br from-cyan-600 to-cyan-400 text-white">
            <FiUsers size={22} />
          </div>
        </div>

        <div className="og-card og-kpi">
          <div>
            <p className="text-sm text-white/70">Total Roles</p>
            <p className="text-2xl font-bold mt-2">{stats.roleCount}</p>
          </div>
          <div className="icon bg-gradient-to-br from-yellow-500 to-orange-400 text-white">
            <FiShield size={22} />
          </div>
        </div>

        <div className="og-card og-kpi">
          <div>
            <p className="text-sm text-white/70">Total Permissions</p>
            <p className="text-2xl font-bold mt-2">{stats.permissionCount}</p>
          </div>
          <div className="icon bg-gradient-to-br from-green-500 to-emerald-400 text-white">
            <FiKey size={22} />
          </div>
        </div>
      </div>

      <div className="og-card">
        <h2 className="text-lg font-semibold mb-3">Quick Info</h2>
        <p className="text-white/70 mb-4">
          Manage users, roles, and permissions from the navigation menu on the left.
        </p>
        <ul className="space-y-2 text-white/60">
          <li>• <strong>Users:</strong> Create, read, update, and delete user accounts</li>
          <li>• <strong>Roles:</strong> Manage role hierarchies and assign permissions</li>
          <li>• <strong>Permissions:</strong> Define system permissions and categories</li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardPage;
