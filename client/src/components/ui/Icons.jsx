import React from 'react';

const defaultProps = (size = 18, color = 'currentColor', style = {}) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: color,
  strokeWidth: 2,
  strokeLinecap: 'square',
  strokeLinejoin: 'miter',
  style: { display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style },
});

export function IconProjects({ size = 18, color = 'currentColor', style }) {
  return (
    <svg {...defaultProps(size, color, style)}>
      <rect x="3" y="3" width="8" height="8" strokeWidth="2" />
      <rect x="13" y="3" width="8" height="8" strokeWidth="2" />
      <rect x="3" y="13" width="8" height="8" strokeWidth="2" />
      <path d="M13 17h8M17 13v8" strokeWidth="2" />
    </svg>
  );
}

export function IconProfile({ size = 18, color = 'currentColor', style }) {
  return (
    <svg {...defaultProps(size, color, style)}>
      <circle cx="12" cy="7" r="4" strokeWidth="2" />
      <path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" strokeWidth="2" />
    </svg>
  );
}

export function IconApplications({ size = 18, color = 'currentColor', style }) {
  return (
    <svg {...defaultProps(size, color, style)}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" strokeWidth="2" />
      <rect x="8" y="2" width="8" height="4" strokeWidth="2" />
      <line x1="8" y1="11" x2="16" y2="11" strokeWidth="2" />
      <line x1="8" y1="16" x2="13" y2="16" strokeWidth="2" />
    </svg>
  );
}

export function IconMessages({ size = 18, color = 'currentColor', style }) {
  return (
    <svg {...defaultProps(size, color, style)}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="2" />
      <line x1="8" y1="9" x2="16" y2="9" strokeWidth="2" />
      <line x1="8" y1="13" x2="13" y2="13" strokeWidth="2" />
    </svg>
  );
}

export function IconAdmin({ size = 18, color = 'currentColor', style }) {
  return (
    <svg {...defaultProps(size, color, style)}>
      <polygon points="12 2 20 6 20 12 12 22 4 12 4 6 12 2" strokeWidth="2" />
      <circle cx="12" cy="11" r="3" strokeWidth="2" />
    </svg>
  );
}

export function IconBell({ size = 18, color = 'currentColor', style }) {
  return (
    <svg {...defaultProps(size, color, style)}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeWidth="2" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeWidth="2" />
    </svg>
  );
}

export function IconEdit({ size = 18, color = 'currentColor', style }) {
  return (
    <svg {...defaultProps(size, color, style)}>
      <polygon points="14 2 18 6 7 17 3 17 3 13 14 2" strokeWidth="2" />
      <line x1="3" y1="21" x2="21" y2="21" strokeWidth="2" />
    </svg>
  );
}

export function IconPlus({ size = 18, color = 'currentColor', style }) {
  return (
    <svg {...defaultProps(size, color, style)}>
      <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" />
      <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" />
    </svg>
  );
}

export function IconCheck({ size = 18, color = 'currentColor', style }) {
  return (
    <svg {...defaultProps(size, color, style)}>
      <polyline points="20 6 9 17 4 12" strokeWidth="2.5" />
    </svg>
  );
}

export function IconClose({ size = 18, color = 'currentColor', style }) {
  return (
    <svg {...defaultProps(size, color, style)}>
      <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" />
      <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" />
    </svg>
  );
}

export function IconSearch({ size = 18, color = 'currentColor', style }) {
  return (
    <svg {...defaultProps(size, color, style)}>
      <circle cx="11" cy="11" r="8" strokeWidth="2" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
    </svg>
  );
}

export function IconSpark({ size = 18, color = 'currentColor', style }) {
  return (
    <svg {...defaultProps(size, color, style)}>
      <polygon points="12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9 12 2" strokeWidth="2" fill={color === 'currentColor' ? 'none' : color} fillOpacity="0.2" />
    </svg>
  );
}

export function IconWarning({ size = 18, color = 'currentColor', style }) {
  return (
    <svg {...defaultProps(size, color, style)}>
      <polygon points="12 2 22 20 2 20 12 2" strokeWidth="2" />
      <line x1="12" y1="9" x2="12" y2="13" strokeWidth="2" />
      <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" />
    </svg>
  );
}

export function IconCrown({ size = 18, color = 'currentColor', style }) {
  return (
    <svg {...defaultProps(size, color, style)}>
      <polygon points="2 7 6 18 18 18 22 7 16 11 12 3 8 11 2 7" strokeWidth="2" />
    </svg>
  );
}

export function IconUsers({ size = 18, color = 'currentColor', style }) {
  return (
    <svg {...defaultProps(size, color, style)}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" />
      <circle cx="9" cy="7" r="4" strokeWidth="2" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" />
    </svg>
  );
}

export function IconLogout({ size = 18, color = 'currentColor', style }) {
  return (
    <svg {...defaultProps(size, color, style)}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeWidth="2" />
      <polyline points="16 17 21 12 16 7" strokeWidth="2" />
      <line x1="21" y1="12" x2="9" y2="12" strokeWidth="2" />
    </svg>
  );
}

export function IconHourglass({ size = 18, color = 'currentColor', style }) {
  return (
    <svg {...defaultProps(size, color, style)}>
      <polygon points="4 2 20 2 12 12 20 22 4 22 12 12 4 2" strokeWidth="2" />
    </svg>
  );
}

export function IconFlag({ size = 18, color = 'currentColor', style }) {
  return (
    <svg {...defaultProps(size, color, style)}>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" strokeWidth="2" />
      <line x1="4" y1="22" x2="4" y2="15" strokeWidth="2" />
    </svg>
  );
}

export function IconCourse({ size = 18, color = 'currentColor', style }) {
  return (
    <svg {...defaultProps(size, color, style)}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeWidth="2" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeWidth="2" />
    </svg>
  );
}

export function IconMail({ size = 18, color = 'currentColor', style }) {
  return (
    <svg {...defaultProps(size, color, style)}>
      <rect x="2" y="4" width="20" height="16" strokeWidth="2" />
      <path d="M22 6l-10 7L2 6" strokeWidth="2" />
    </svg>
  );
}

export function IconClipboard({ size = 18, color = 'currentColor', style }) {
  return (
    <svg {...defaultProps(size, color, style)}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" strokeWidth="2" />
      <rect x="8" y="2" width="8" height="4" strokeWidth="2" />
    </svg>
  );
}

export function IconCompass({ size = 18, color = 'currentColor', style }) {
  return (
    <svg {...defaultProps(size, color, style)}>
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" strokeWidth="2" />
    </svg>
  );
}

export function IconEmptyDraft({ size = 48, color = '#64748b', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ display: 'inline-block', ...style }}>
      <rect x="8" y="8" width="32" height="32" stroke={color} strokeWidth="2" strokeDasharray="4 4" fill="#f8fafc" />
      <line x1="8" y1="8" x2="40" y2="40" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
      <line x1="8" y1="40" x2="40" y2="8" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
      <circle cx="24" cy="24" r="7" stroke={color} strokeWidth="2" fill="#ffffff" />
      <line x1="24" y1="14" x2="24" y2="34" stroke={color} strokeWidth="1.5" />
      <line x1="14" y1="24" x2="34" y2="24" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export function IconArrowRight({ size = 18, color = 'currentColor', style }) {
  return (
    <svg {...defaultProps(size, color, style)}>
      <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" />
      <polyline points="12 5 19 12 12 19" strokeWidth="2" />
    </svg>
  );
}

export function IconGeometricEmblem({ size = 32, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" style={{ display: 'inline-block', flexShrink: 0, ...style }}>
      {/* Precision architectural mark: overlapping isometric diamond and square */}
      <rect x="4" y="4" width="22" height="22" stroke="#2563eb" strokeWidth="2.5" fill="#eff6ff" />
      <polygon points="22 10 32 10 32 30 12 30 12 22 22 22" stroke="#f59e0b" strokeWidth="2.5" fill="#fffbeb" />
      <line x1="4" y1="4" x2="26" y2="26" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="2 2" />
      <circle cx="15" cy="15" r="3" fill="#2563eb" />
      <rect x="23" y="19" width="3" height="3" fill="#f59e0b" />
    </svg>
  );
}
