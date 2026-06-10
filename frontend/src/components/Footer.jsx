import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="og-footer og-card mt-8">
      <div className="max-w-[var(--max-width)] mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <h3 className="text-lg font-bold">Ogero Admin</h3>
          <p className="text-sm text-[var(--text-muted)] mt-2">Compact admin UI with enterprise polish — accessible and responsive.</p>
        </div>

        <div>
          <h4 className="font-semibold">Platform</h4>
          <ul className="mt-2 text-sm text-[var(--text-muted)] space-y-1">
            <li>Dashboard</li>
            <li>Users</li>
            <li>Roles</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold">Company</h4>
          <ul className="mt-2 text-sm text-[var(--text-muted)] space-y-1">
            <li>About</li>
            <li>Careers</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold">Legal</h4>
          <ul className="mt-2 text-sm text-[var(--text-muted)] space-y-1">
            <li>Privacy</li>
            <li>Terms</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[var(--border)] px-4 py-3 text-sm text-[var(--text-muted)] text-center">
        © {new Date().getFullYear()} Ogero Admin — All rights reserved
      </div>
    </footer>
  );
};

export default Footer;
