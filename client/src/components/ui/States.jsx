import React from 'react';

/**
 * LoadingSpinner — universal loading state component.
 * Used across every list and data-fetching component (M7 step 4).
 */
export function LoadingSpinner({ size = 'md', label = 'Loading…', inline = false }) {
  const dim = size === 'sm' ? 20 : size === 'lg' ? 48 : 32;
  const borderWidth = size === 'sm' ? 2 : size === 'lg' ? 4 : 3;

  const container = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: inline ? '0' : '3rem 1rem',
    color: 'var(--text-dim)',
    fontSize: '0.875rem',
  };

  return (
    <div style={container} role="status" aria-live="polite" aria-label={label}>
      <div style={{
        width: dim,
        height: dim,
        border: `${borderWidth}px solid var(--border)`,
        borderTopColor: 'var(--primary)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      {!inline && <span>{label}</span>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/**
 * EmptyState — shown when a list/query returns zero results.
 */
export function EmptyState({ icon = '📭', title, message, action }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3.5rem 1rem',
      textAlign: 'center',
      gap: '0.75rem',
      animation: 'fadeIn 0.3s ease',
    }}>
      <span style={{ fontSize: '3rem', lineHeight: 1 }}>{icon}</span>
      {title && (
        <p style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>{title}</p>
      )}
      {message && (
        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', maxWidth: '28ch', lineHeight: 1.6 }}>
          {message}
        </p>
      )}
      {action && (
        <div style={{ marginTop: '0.5rem' }}>{action}</div>
      )}
    </div>
  );
}

/**
 * ErrorBanner — shown when an API call fails.
 * Retry callback optional.
 */
export function ErrorBanner({ message, onRetry }) {
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '1rem 1.25rem',
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: 'var(--radius-md)',
        color: '#b91c1c',
        fontSize: '0.9rem',
        fontWeight: '500',
        flexWrap: 'wrap',
        animation: 'fadeIn 0.25s ease',
      }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span aria-hidden="true">⚠️</span>
        {message || 'Something went wrong. Please try again.'}
      </span>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(239,68,68,0.2)',
            border: '1px solid rgba(239,68,68,0.4)',
            color: '#fca5a5',
            fontWeight: 600,
            fontSize: '0.82rem',
            cursor: 'pointer',
            minHeight: '44px',
          }}>
          ↻ Retry
        </button>
      )}
    </div>
  );
}

/**
 * SkeletonCard — placeholder shimmer while data loads.
 */
export function SkeletonCard({ lines = 3 }) {
  const shimmer = {
    background: 'linear-gradient(90deg, var(--bg-surface) 25%, rgba(255,255,255,0.04) 50%, var(--bg-surface) 75%)',
    backgroundSize: '400% 100%',
    animation: 'shimmer 1.4s ease infinite',
    borderRadius: 'var(--radius-sm)',
    height: '1rem',
  };
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    }}>
      <div style={{ ...shimmer, height: '1.25rem', width: '60%' }} />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} style={{ ...shimmer, width: i === lines - 1 ? '40%' : '90%' }} />
      ))}
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
}
