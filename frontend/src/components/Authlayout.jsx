import React from 'react';
import ogeroLogo from '../assets/Ogero.png';

/**
 * Network topology signature visual.
 * Represents the Ogero national network: a core exchange (Beirut)
 * with links out to regional exchanges, animated as live data links —
 * a visual echo of "establishing a secure session".
 */
const NetworkGraphic = () => {
  const center = { x: 200, y: 222 };
  const nodes = [
    { x: 200, y: 56, label: 'Tripoli' },
    { x: 340, y: 140, label: 'Jounieh' },
    { x: 340, y: 304, label: 'Zahle' },
    { x: 200, y: 388, label: 'Baalbek' },
    { x: 60, y: 304, label: 'Nabatieh' },
    { x: 60, y: 140, label: 'Saida' },
  ];

  return (
    <svg
      viewBox="0 0 400 440"
      className="w-full max-w-sm"
      role="img"
      aria-label="Ogero network topology, regional exchanges linked to the Beirut core"
    >
      {nodes.map((n, i) => (
        <line
          key={`line-${i}`}
          x1={center.x}
          y1={center.y}
          x2={n.x}
          y2={n.y}
          stroke="var(--accent)"
          strokeWidth="1"
          strokeOpacity="0.3"
          strokeDasharray="3 7"
          className="og-network-line"
          style={{ animationDuration: `${3 + i * 0.45}s`, animationDelay: `${i * 0.18}s` }}
        />
      ))}

      {nodes.map((n, i) => (
        <g key={`node-${i}`}>
          <circle cx={n.x} cy={n.y} r="5" fill="var(--panel)" stroke="var(--accent)" strokeWidth="1.5" />
          <text
            x={n.x}
            y={n.y + (n.y < center.y ? -14 : 20)}
            textAnchor="middle"
            className="og-font-mono"
            fill="var(--text-muted)"
            fontSize="10"
            letterSpacing="2"
            style={{ textTransform: 'uppercase' }}
          >
            {n.label}
          </text>
        </g>
      ))}

      <circle cx={center.x} cy={center.y} r="16" fill="none" stroke="var(--accent)" strokeOpacity="0.3" strokeWidth="8">
        <animate attributeName="r" values="16;32;16" dur="3s" repeatCount="indefinite" />
        <animate attributeName="stroke-opacity" values="0.35;0;0.35" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx={center.x} cy={center.y} r="9" fill="var(--accent)" />
      <text
        x={center.x}
        y={center.y + 34}
        textAnchor="middle"
        className="og-font-mono"
        fill="var(--text-strong)"
        fontSize="11"
        fontWeight="600"
        letterSpacing="2"
        style={{ textTransform: 'uppercase' }}
      >
        Beirut Core
      </text>
    </svg>
  );
};

/**
 * Shared shell for the authentication pages.
 *
 * @param {string} eyebrow      Small mono label above the title
 * @param {string} title        Page heading
 * @param {string} subtitle     Supporting copy under the heading
 * @param {string} statusLabel  Mono status string in the visual panel footer
 * @param {'md'|'lg'} width     Controls the form column max width
 */
const AuthLayout = ({ eyebrow, title, subtitle, statusLabel = 'Channel secure', width = 'md', children }) => {
  const maxWidth = width === 'lg' ? 'max-w-2xl' : 'max-w-md';

  return (
    <div className="min-h-screen flex bg-[var(--bg)]">
      {/* Visual panel */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-[38%] flex-col justify-between p-12 bg-[var(--panel)] border-r border-[var(--border)] og-network-panel relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-3">
          <img
            src={ogeroLogo}
            alt="Ogero"
            className="w-10 h-10 object-contain"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div>
            <p className="og-font-display text-lg font-bold tracking-[0.25em] text-[var(--text-strong)] m-0">OGERO</p>
            <p className="og-font-mono text-[10px] tracking-[0.35em] text-[var(--text-muted)] uppercase mt-0.5">
              Network Access Portal
            </p>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex items-center justify-center my-6">
          <NetworkGraphic />
        </div>

        <div className="relative z-10 og-font-mono text-[11px] tracking-[0.25em] text-[var(--text-muted)] uppercase flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-60 og-pulse-dot" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--success)]" />
          </span>
          {statusLabel}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 og-bg-pattern overflow-y-auto">
        <div className={`w-full ${maxWidth} my-8`}>
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img
              src={ogeroLogo}
              alt="Ogero"
              className="w-10 h-10 object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <p className="og-font-display text-base font-bold tracking-[0.25em] text-[var(--text-strong)] m-0">OGERO</p>
              <p className="og-font-mono text-[10px] tracking-[0.35em] text-[var(--text-muted)] uppercase mt-0.5">
                Network Access Portal
              </p>
            </div>
          </div>

          {eyebrow && (
            <p className="og-font-mono text-[11px] tracking-[0.3em] text-[var(--accent)] uppercase mb-3">{eyebrow}</p>
          )}
          <h1 className="og-font-display text-3xl sm:text-4xl font-bold text-[var(--text-strong)] mb-2 m-0">{title}</h1>
          {subtitle && <p className="text-sm text-[var(--text-muted)] mt-2 mb-8 leading-relaxed">{subtitle}</p>}
          {!subtitle && <div className="mb-6" />}

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;