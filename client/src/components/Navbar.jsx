import React, { useState, useEffect, useRef } from 'react';
import { NotificationBell } from '../features/notifications/NotificationBell.jsx';

export function Navbar({
  currentUser,
  onOpenAuth,
  onOpenProfile,
  onOpenMyApplications,
  onOpenMessages,
  onOpenAdmin,
  onNavigateToLink,
  onLogout,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  // Close menu on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [menuOpen]);

  const navBtn = {
    padding: '0.5rem 0.9rem',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(99, 102, 241, 0.12)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    color: 'var(--primary)',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    minHeight: '44px',
    whiteSpace: 'nowrap',
  };

  const menuItem = {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    background: 'none',
    border: 'none',
    color: 'var(--text-main)',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    minHeight: '44px',
    transition: 'background 0.15s',
  };

  return (
    <>
      {/* Skip to main content — accessibility */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(10, 13, 20, 0.85)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px', height: '36px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '800', fontSize: '1.1rem', color: '#fff',
            boxShadow: 'var(--shadow-glow)', flexShrink: 0,
          }}>TM</div>
          <div>
            <span style={{ fontWeight: '800', fontSize: '1.2rem', letterSpacing: '-0.5px' }}>
              Team<span style={{ color: 'var(--primary)' }}>Match</span>
            </span>
            <span className="hide-mobile" style={{
              fontSize: '0.65rem', padding: '2px 6px', marginLeft: '8px',
              background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)',
              borderRadius: 'var(--radius-full)', border: '1px solid rgba(99, 102, 241, 0.3)',
              fontWeight: '600', verticalAlign: 'middle',
            }}>AI-Engine</span>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hide-mobile" aria-label="Main navigation" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {currentUser ? (
            <>
              {/* User badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)',
                background: 'var(--bg-glass)', border: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{currentUser.name}</span>
                <span style={{
                  fontSize: '0.7rem', padding: '2px 8px', borderRadius: 'var(--radius-full)',
                  fontWeight: '600',
                  background: currentUser.isEmailVerified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: currentUser.isEmailVerified ? 'var(--success)' : 'var(--warning)',
                  border: `1px solid ${currentUser.isEmailVerified ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                }}>
                  {currentUser.isEmailVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
              <button onClick={onOpenMyApplications} style={navBtn} id="nav-applications">📋 Applications</button>
              <button onClick={() => onOpenMessages && onOpenMessages()} style={navBtn} id="nav-messages">💬 Messages</button>
              {currentUser.accountType === 'admin' && (
                <button
                  onClick={onOpenAdmin}
                  id="navbar-admin-portal"
                  style={{ ...navBtn, background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.5)', fontWeight: '700', boxShadow: '0 0 12px rgba(99,102,241,0.25)' }}>
                  🛡️ Admin
                </button>
              )}
              <NotificationBell onNavigateToLink={onNavigateToLink} />
              <button onClick={onOpenProfile} id="nav-profile" style={{ ...navBtn, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-main)' }}>My Profile</button>
              <button onClick={onLogout} id="nav-logout" style={{ padding: '0.5rem 0.9rem', color: 'var(--text-muted)', fontSize: '0.85rem', minHeight: '44px' }}>Log Out</button>
            </>
          ) : (
            <>
              <button onClick={() => onOpenAuth('login')} id="nav-login" style={{ padding: '0.5rem 1rem', color: 'var(--text-main)', fontWeight: '600', fontSize: '0.9rem', minHeight: '44px' }}>Log In</button>
              <button onClick={() => onOpenAuth('signup')} id="nav-signup" style={{
                padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                color: '#fff', fontWeight: '600', fontSize: '0.9rem',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)', minHeight: '44px',
              }}>Get Started</button>
            </>
          )}
        </nav>

        {/* Mobile right: notification bell + hamburger */}
        <div className="show-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} ref={menuRef}>
          {currentUser && <NotificationBell onNavigateToLink={onNavigateToLink} />}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            id="hamburger-btn"
            style={{
              display: 'flex', flexDirection: 'column', gap: '5px',
              padding: '8px', borderRadius: 'var(--radius-md)',
              background: menuOpen ? 'var(--bg-surface)' : 'transparent',
              border: '1px solid ' + (menuOpen ? 'var(--border)' : 'transparent'),
              minHeight: '44px', minWidth: '44px', alignItems: 'center', justifyContent: 'center',
            }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{
                display: 'block', height: '2px', borderRadius: '1px',
                background: 'var(--text-main)', transition: 'all 0.2s ease',
                width: i === 1 && menuOpen ? '12px' : '20px',
                transform: menuOpen ? (i === 0 ? 'translateY(7px) rotate(45deg)' : i === 2 ? 'translateY(-7px) rotate(-45deg)' : 'scaleX(0)') : 'none',
              }} />
            ))}
          </button>

          {/* Mobile dropdown menu */}
          {menuOpen && (
            <div
              id="mobile-menu"
              role="dialog"
              aria-label="Navigation menu"
              style={{
                position: 'absolute', top: '100%', right: 0, left: 0,
                background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
                padding: '0.75rem', zIndex: 50,
                animation: 'slideUp 0.18s ease',
                display: 'flex', flexDirection: 'column', gap: '0.25rem',
              }}>
              {currentUser ? (
                <>
                  <div style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'var(--text-dim)', borderBottom: '1px solid var(--border)', marginBottom: '0.25rem' }}>
                    Signed in as <strong style={{ color: 'var(--text-muted)' }}>{currentUser.name}</strong>
                  </div>
                  {[
                    { label: '📋 My Applications', action: onOpenMyApplications, id: 'mobile-applications' },
                    { label: '💬 Messages', action: onOpenMessages, id: 'mobile-messages' },
                    { label: '👤 My Profile', action: onOpenProfile, id: 'mobile-profile' },
                    ...(currentUser.accountType === 'admin' ? [{ label: '🛡️ Admin Portal', action: onOpenAdmin, id: 'mobile-admin' }] : []),
                    { label: 'Log Out', action: onLogout, id: 'mobile-logout', danger: true },
                  ].map((item) => (
                    <button
                      key={item.id}
                      id={item.id}
                      onClick={() => { item.action && item.action(); setMenuOpen(false); }}
                      style={{ ...menuItem, color: item.danger ? '#f87171' : 'var(--text-main)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-surface)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}>
                      {item.label}
                    </button>
                  ))}
                </>
              ) : (
                <>
                  <button onClick={() => { onOpenAuth('login'); setMenuOpen(false); }} style={menuItem} id="mobile-login">Log In</button>
                  <button onClick={() => { onOpenAuth('signup'); setMenuOpen(false); }}
                    style={{ ...menuItem, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#fff', textAlign: 'center' }}
                    id="mobile-signup">Get Started</button>
                </>
              )}
            </div>
          )}
        </div>
      </header>
    </>
  );
}
