import React, { useState, useEffect, useRef } from 'react';
import { NotificationBell } from '../features/notifications/NotificationBell.jsx';
import {
  IconGeometricEmblem,
  IconApplications,
  IconMessages,
  IconAdmin,
  IconProfile,
  IconLogout,
} from './ui/Icons.jsx';

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
    function handleKeyDown(e) { if (e.key === 'Escape') setMenuOpen(false); }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  const navItemStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '0.45rem 0.85rem',
    borderRadius: 'var(--radius-sm)',
    background: '#ffffff',
    border: '1px solid var(--border)',
    color: 'var(--ink)',
    fontSize: '0.84rem',
    fontWeight: '700',
    cursor: 'pointer',
    minHeight: '38px',
    whiteSpace: 'nowrap',
    boxShadow: '1px 1px 0px rgba(15, 23, 42, 0.08)',
    transition: 'all 0.15s ease',
  };

  const mobileMenuItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    textAlign: 'left',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-sm)',
    background: 'none',
    border: 'none',
    color: 'var(--ink)',
    fontSize: '0.9rem',
    fontWeight: '700',
    cursor: 'pointer',
    minHeight: '42px',
    transition: 'background 0.15s',
  };

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 2rem',
        borderBottom: '1.5px solid var(--border-structural)',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 4px rgba(15, 23, 42, 0.03)',
      }}>
        {/* Brand & Architectural Monogram */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <IconGeometricEmblem size={32} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: '900', fontSize: '1.3rem', letterSpacing: '-0.03em', color: 'var(--ink)' }}>
              Team<span style={{ color: 'var(--primary)' }}>Match</span>
            </span>
            <span className="geo-tag" style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}>
              CAMPUS
            </span>
          </div>
        </div>

        {/* Desktop Navigation Group */}
        <div className={`nav-desktop-group ${currentUser ? 'is-auth' : ''}`}>
          {currentUser ? (
            <>
              {/* User Identity Chip */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: '#f8fafc',
                border: '1px solid var(--border)',
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '2px',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  color: '#ffffff',
                }}>
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--ink)' }}>
                  {currentUser.name}
                </span>
                <span className="geo-tag" style={{
                  background: currentUser.isEmailVerified ? '#ecfdf5' : '#fffbeb',
                  color: currentUser.isEmailVerified ? '#059669' : '#b45309',
                  borderColor: currentUser.isEmailVerified ? '#a7f3d0' : '#fde68a',
                }}>
                  {currentUser.isEmailVerified ? 'VERIFIED' : 'UNVERIFIED'}
                </span>
              </div>

              {/* Navigation Action Buttons */}
              <button
                onClick={onOpenMyApplications}
                style={navItemStyle}
                id="nav-applications"
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ink)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <IconApplications size={15} color="var(--primary)" />
                <span>Applications</span>
              </button>

              <button
                onClick={() => onOpenMessages && onOpenMessages()}
                style={navItemStyle}
                id="nav-messages"
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ink)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <IconMessages size={15} color="var(--primary)" />
                <span>Messages</span>
              </button>

              {(currentUser.accountType === 'admin' || currentUser.email?.toLowerCase() === 'admin@teammatch.edu' || currentUser.email?.toLowerCase() === 'admin@teammatch.app') && (
                <button
                  onClick={onOpenAdmin}
                  id="navbar-admin-portal"
                  style={{
                    ...navItemStyle,
                    background: '#fffbeb',
                    borderColor: '#fde68a',
                    color: '#92400e',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d97706'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#fde68a'; }}
                >
                  <IconAdmin size={15} color="#d97706" />
                  <span>Admin</span>
                </button>
              )}

              {/* Notification Bell */}
              <NotificationBell onNavigateToLink={onNavigateToLink} />

              <button
                onClick={onOpenProfile}
                id="nav-profile"
                style={navItemStyle}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ink)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <IconProfile size={15} color="var(--ink)" />
                <span>My Profile</span>
              </button>

              <button
                onClick={onLogout}
                id="nav-logout"
                style={{
                  ...navItemStyle,
                  background: 'transparent',
                  border: '1px solid transparent',
                  color: 'var(--ink-muted)',
                  boxShadow: 'none',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#dc2626'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-muted)'; }}
              >
                <IconLogout size={15} />
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => onOpenAuth('login')}
                id="nav-login"
                className="chamfer-btn chamfer-btn-secondary"
                aria-label="Log In"
                style={{ padding: '1px' }}
              >
                <span className="chamfer-btn-inner" style={{ padding: '0.45rem 1.15rem', fontSize: '0.84rem', fontWeight: 700 }}>
                  Log In
                </span>
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                id="nav-signup"
                className="chamfer-btn chamfer-btn-primary"
                aria-label="Get Started"
                style={{ padding: '1px' }}
              >
                <span className="chamfer-btn-inner" style={{ padding: '0.45rem 1.25rem', fontSize: '0.84rem', fontWeight: 700 }}>
                  Get Started
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation Trigger (Only active for authenticated users on small viewports) */}
        {currentUser && (
          <div className="nav-mobile-trigger" ref={menuRef}>
            <NotificationBell onNavigateToLink={onNavigateToLink} />
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              id="hamburger-btn"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                background: menuOpen ? '#f1f5f9' : '#ffffff',
                border: '1.5px solid var(--border-structural)',
                minHeight: '38px',
                minWidth: '38px',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <span style={{ width: '18px', height: '2px', background: 'var(--ink)', transition: 'all 0.2s', transform: menuOpen ? 'translateY(6px) rotate(45deg)' : 'none' }} />
              <span style={{ width: '18px', height: '2px', background: 'var(--ink)', opacity: menuOpen ? 0 : 1 }} />
              <span style={{ width: '18px', height: '2px', background: 'var(--ink)', transition: 'all 0.2s', transform: menuOpen ? 'translateY(-6px) rotate(-45deg)' : 'none' }} />
            </button>

            {/* Mobile Drawer */}
            {menuOpen && (
              <div
                id="mobile-menu"
                role="dialog"
                aria-label="Mobile Navigation"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: '1rem',
                  left: '1rem',
                  background: '#ffffff',
                  border: '2px solid var(--ink)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-geo-lg)',
                  padding: '0.75rem',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                }}
              >
                <div style={{
                  padding: '0.5rem 0.75rem',
                  borderBottom: '1px solid var(--border)',
                  fontSize: '0.82rem',
                  color: 'var(--ink-muted)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span>Signed in as <strong style={{ color: 'var(--ink)' }}>{currentUser.name}</strong></span>
                  <span className="geo-tag" style={{
                    background: currentUser.isEmailVerified ? '#ecfdf5' : '#fffbeb',
                    color: currentUser.isEmailVerified ? '#059669' : '#b45309',
                  }}>
                    {currentUser.isEmailVerified ? 'VERIFIED' : 'UNVERIFIED'}
                  </span>
                </div>

                <button
                  onClick={() => { onOpenMyApplications(); setMenuOpen(false); }}
                  style={mobileMenuItemStyle}
                >
                  <IconApplications size={16} color="var(--primary)" />
                  <span>Applications</span>
                </button>

                <button
                  onClick={() => { if (onOpenMessages) onOpenMessages(); setMenuOpen(false); }}
                  style={mobileMenuItemStyle}
                >
                  <IconMessages size={16} color="var(--primary)" />
                  <span>Messages</span>
                </button>

                <button
                  onClick={() => { onOpenProfile(); setMenuOpen(false); }}
                  style={mobileMenuItemStyle}
                >
                  <IconProfile size={16} color="var(--ink)" />
                  <span>My Profile</span>
                </button>

                {(currentUser.accountType === 'admin' || currentUser.email?.toLowerCase() === 'admin@teammatch.edu' || currentUser.email?.toLowerCase() === 'admin@teammatch.app') && (
                  <button
                    onClick={() => { onOpenAdmin(); setMenuOpen(false); }}
                    style={{ ...mobileMenuItemStyle, color: '#b45309' }}
                  >
                    <IconAdmin size={16} color="#d97706" />
                    <span>Admin Portal</span>
                  </button>
                )}

                <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.25rem', paddingTop: '0.25rem' }}>
                  <button
                    onClick={() => { onLogout(); setMenuOpen(false); }}
                    style={{ ...mobileMenuItemStyle, color: '#dc2626' }}
                  >
                    <IconLogout size={16} />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
