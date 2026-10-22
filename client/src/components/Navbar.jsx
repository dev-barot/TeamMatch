import React from 'react';
import { NotificationBell } from '../features/notifications/NotificationBell.jsx';

export function Navbar({
  currentUser,
  onOpenAuth,
  onOpenProfile,
  onOpenMyApplications,
  onOpenMessages,
  onNavigateToLink,
  onLogout,
}) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 2rem',
      borderBottom: '1px solid var(--border)',
      background: 'rgba(10, 13, 20, 0.8)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '800',
          fontSize: '1.1rem',
          color: '#fff',
          boxShadow: 'var(--shadow-glow)'
        }}>
          TM
        </div>
        <div>
          <span style={{ fontWeight: '800', fontSize: '1.25rem', letterSpacing: '-0.5px' }}>
            Team<span style={{ color: 'var(--primary)' }}>Match</span>
          </span>
          <span style={{
            fontSize: '0.65rem',
            padding: '2px 6px',
            marginLeft: '8px',
            background: 'rgba(99, 102, 241, 0.15)',
            color: 'var(--primary)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            fontWeight: '600',
            verticalAlign: 'middle',
          }}>
            AI-Engine
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {currentUser ? (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-glass)',
              border: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{currentUser.name}</span>
              <span style={{
                fontSize: '0.7rem',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                fontWeight: '600',
                background: currentUser.isEmailVerified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: currentUser.isEmailVerified ? 'var(--success)' : 'var(--warning)',
                border: `1px solid ${currentUser.isEmailVerified ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              }}>
                {currentUser.isEmailVerified ? 'Verified' : 'Unverified (R5)'}
              </span>
            </div>

            <button
              onClick={onOpenMyApplications}
              style={{
                padding: '0.5rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: 'var(--primary)',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              📋 Applications
            </button>

            <button
              onClick={onOpenMessages}
              style={{
                padding: '0.5rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: 'var(--primary)',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              💬 Messages
            </button>

            <NotificationBell onNavigateToLink={onNavigateToLink} />

            <button
              onClick={onOpenProfile}
              style={{
                padding: '0.5rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              My Profile
            </button>

            <button
              onClick={onLogout}
              style={{
                padding: '0.5rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
              }}
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onOpenAuth('login')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontWeight: '600',
                fontSize: '0.9rem',
              }}
            >
              Log In
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                color: '#fff',
                fontWeight: '600',
                fontSize: '0.9rem',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              }}
            >
              Get Started
            </button>
          </>
        )}
      </div>
    </header>
  );
}
