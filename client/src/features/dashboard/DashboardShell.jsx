import React, { useState, useRef, useEffect } from 'react';
import { OverviewView } from './OverviewView.jsx';
import { ExploreView } from './ExploreView.jsx';
import { ApplicationsView } from './ApplicationsView.jsx';
import { MessagesView } from './MessagesView.jsx';
import { ProfileView } from './ProfileView.jsx';
import { ProjectsGallery } from '../projects/ProjectsGallery.jsx';
import { IconWarning, IconCheck } from '../../components/ui/Icons.jsx';

export function DashboardShell({
  currentUser,
  userProfile,
  onLogout,
  onOpenCreateProject,
  onOpenEditProfile,
  onSelectProject,
  onOpenApply,
  onOpenManageApplicants,
  onOpenAdmin,
  galleryRefreshKey,
  // PIN Verification props
  dashboardPin,
  setDashboardPin,
  handleVerifyDashboardPin,
  handleResendDashboardPin,
  verifyingDashboardPin,
  resendingDashboardPin,
  dashboardVerifyError,
  dashboardVerifyMsg,
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'explore' | 'projects' | 'applications' | 'messages' | 'profile'
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isHovered;
  const userMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  const name = currentUser?.name || 'Dev Barot';
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'overview':
        return 'TEAMMATCH / HOME';
      case 'explore':
        return 'TEAMMATCH / EXPLORE';
      case 'projects':
        return 'TEAMMATCH / PROJECTS';
      case 'applications':
        return 'TEAMMATCH / APPLICATIONS';
      case 'messages':
        return 'TEAMMATCH / MESSAGES';
      case 'profile':
        return 'TEAMMATCH / PROFILE';
      default:
        return 'TEAMMATCH / HOME';
    }
  };

  const navItems = [
    {
      id: 'overview',
      label: 'Home',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: 'explore',
      label: 'Explore',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      id: 'applications',
      label: 'Applications',
      badge: 3,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" transform="rotate(45 12 12)" />
        </svg>
      ),
    },
    {
      id: 'messages',
      label: 'Messages',
      badge: 5,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="7" r="4" />
          <path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" />
        </svg>
      ),
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#F6F8FB',
        fontFamily: 'var(--font-sans)',
        color: '#0F1B33',
      }}
    >
      {/* Top Header App Bar — Permanent TeamMatch Brand on Left, Breadcrumb in Center, Profile on Right */}
      <header
        style={{
          height: '64px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1.5px solid #0F1B33',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 60,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Left: Permanent TeamMatch Brand (Never Collapses) + Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <div
            style={{
              width: '236px',
              minWidth: '236px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '0 1.25rem',
              borderRight: '4px solid #0F1B33',
              gap: '10px',
              boxSizing: 'border-box',
              backgroundColor: '#FFFFFF',
            }}
          >
            {/* Overlapping squares brand mark */}
            <div style={{ position: 'relative', width: '24px', height: '24px', flexShrink: 0 }}>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '15px',
                  height: '15px',
                  border: '2px solid #1F4FE0',
                  backgroundColor: '#FFFFFF',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '15px',
                  height: '15px',
                  border: '2px solid #F59E0B',
                  backgroundColor: 'transparent',
                }}
              />
            </div>
            <span style={{ fontWeight: '900', fontSize: '1.18rem', color: '#0F1B33', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              TeamMatch
            </span>
          </div>

          {/* Breadcrumb trail */}
          <div
            style={{
              paddingLeft: '1.5rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: '700',
              fontSize: '0.82rem',
              letterSpacing: '0.08em',
              color: '#475569',
              whiteSpace: 'nowrap',
            }}
          >
            {getBreadcrumb()}
          </div>
        </div>

        {/* Right Header items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', paddingRight: '2rem' }}>
          {/* Notification Bell */}
          <div ref={notifMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setNotifDropdownOpen((prev) => !prev)}
              type="button"
              style={{
                position: 'relative',
                width: '38px',
                height: '38px',
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #0F1B33',
                borderRadius: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#0F1B33',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {/* Red counter badge */}
              <span
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  fontSize: '0.68rem',
                  fontWeight: '900',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid #FFFFFF',
                }}
              >
                3
              </span>
            </button>

            {/* Notification Dropdown */}
            {notifDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '46px',
                  right: 0,
                  width: '300px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #0F1B33',
                  boxShadow: '3px 3px 0px #0F1B33',
                  padding: '1rem',
                  zIndex: 50,
                }}
              >
                <div style={{ fontWeight: '800', fontSize: '0.88rem', marginBottom: '0.5rem', color: '#0F1B33' }}>
                  Notifications (3 unread)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.8rem' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                    <div style={{ fontWeight: '700', color: '#1E40AF' }}>Rover Team invited you</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>2 hours ago</div>
                  </div>
                  <div style={{ padding: '0.5rem', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                    <div style={{ fontWeight: '700', color: '#1E40AF' }}>3 students applied to your project</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Yesterday</div>
                  </div>
                  <div style={{ padding: '0.5rem', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                    <div style={{ fontWeight: '700', color: '#1E40AF' }}>Aisha Patel sent a message</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Yesterday</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Chip */}
          <div ref={userMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setUserDropdownOpen((prev) => !prev)}
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              {/* Amber Avatar box */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#F59E0B',
                  border: '1.5px solid #0F1B33',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '900',
                  fontSize: '0.82rem',
                  color: '#0F1B33',
                }}
              >
                {initials}
              </div>

              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '800', fontSize: '0.85rem', color: '#0F1B33', lineHeight: 1.1 }}>
                  {name}
                </div>
                <div style={{ fontSize: '0.68rem', fontWeight: '900', color: '#1F4FE0', letterSpacing: '0.04em' }}>
                  VERIFIED
                </div>
              </div>

              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>∨</span>
            </button>

            {/* User Dropdown */}
            {userDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '46px',
                  right: 0,
                  width: '190px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #0F1B33',
                  boxShadow: '3px 3px 0px #0F1B33',
                  zIndex: 50,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setUserDropdownOpen(false);
                  }}
                  type="button"
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid #EEF2F6',
                    textAlign: 'left',
                    fontWeight: '700',
                    fontSize: '0.84rem',
                    color: '#0F1B33',
                    cursor: 'pointer',
                  }}
                >
                  View Profile
                </button>
                <button
                  onClick={() => {
                    onOpenEditProfile();
                    setUserDropdownOpen(false);
                  }}
                  type="button"
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid #EEF2F6',
                    textAlign: 'left',
                    fontWeight: '700',
                    fontSize: '0.84rem',
                    color: '#0F1B33',
                    cursor: 'pointer',
                  }}
                >
                  Edit Profile
                </button>
                {currentUser?.accountType === 'admin' && (
                  <button
                    onClick={() => {
                      onOpenAdmin();
                      setUserDropdownOpen(false);
                    }}
                    type="button"
                    style={{
                      padding: '0.75rem 1rem',
                      background: 'none',
                      border: 'none',
                      borderBottom: '1px solid #EEF2F6',
                      textAlign: 'left',
                      fontWeight: '700',
                      fontSize: '0.84rem',
                      color: '#1F4FE0',
                      cursor: 'pointer',
                    }}
                  >
                    Admin Portal
                  </button>
                )}
                <button
                  onClick={() => {
                    onLogout();
                    setUserDropdownOpen(false);
                  }}
                  type="button"
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    fontWeight: '700',
                    fontSize: '0.84rem',
                    color: '#B91C1C',
                    cursor: 'pointer',
                  }}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body Area: Collapsible Sidebar + Content */}
      <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 64px)', position: 'relative' }}>
        {/* Left Collapsible & Expandable Navigation Sidebar (starts below header) */}
        <aside
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            width: isExpanded ? '236px' : '72px',
            minWidth: isExpanded ? '236px' : '72px',
            backgroundColor: '#FFFFFF',
            borderRight: isExpanded ? '4px solid #0F1B33' : '1.5px solid #0F1B33',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'fixed',
            top: '64px',
            left: 0,
            height: 'calc(100vh - 64px)',
            zIndex: 50,
            boxShadow: isExpanded ? '0 8px 24px rgba(15, 27, 51, 0.08)' : 'none',
            transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.22s cubic-bezier(0.4, 0, 0.2, 1), border-right 0.22s ease, box-shadow 0.22s ease',
            overflowX: 'hidden',
            boxSizing: 'border-box',
          }}
        >
          {/* Navigation Links */}
          <nav style={{ padding: isExpanded ? '1.25rem 0.85rem' : '1.25rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  type="button"
                  title={item.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isExpanded ? 'space-between' : 'center',
                    padding: isExpanded ? '0.65rem 0.85rem' : '0.65rem 0',
                    border: isActive ? '1.5px solid #1F4FE0' : '1.5px solid transparent',
                    backgroundColor: isActive ? '#EEF3FF' : 'transparent',
                    color: isActive ? '#1F4FE0' : '#475569',
                    fontWeight: isActive ? '800' : '700',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    borderRadius: '2px',
                    transition: 'background-color 0.15s ease, border-color 0.15s ease',
                    textAlign: 'left',
                    width: '100%',
                    position: 'relative',
                    boxSizing: 'border-box',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#F8FAFC';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: isExpanded ? '10px' : '0', justifyContent: 'center' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', flexShrink: 0 }}>
                      <span style={{ color: isActive ? '#1F4FE0' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.icon}
                      </span>

                      {/* Compact indicator dot when collapsed */}
                      {item.badge && !isExpanded && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '-2px',
                            right: '-3px',
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            backgroundColor: '#1F4FE0',
                            border: '1px solid #FFFFFF',
                          }}
                        />
                      )}
                    </div>

                    {isExpanded && <span>{item.label}</span>}
                  </div>

                  {item.badge && isExpanded && (
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '999px',
                        border: '1px solid #BFDBFE',
                        backgroundColor: isActive ? '#1F4FE0' : '#EFF6FF',
                        color: isActive ? '#FFFFFF' : '#1F4FE0',
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        flexShrink: 0,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Logout link */}
          <div style={{ padding: isExpanded ? '1.25rem 1rem' : '1.25rem 0.5rem', borderTop: '1px solid #EEF2F6' }}>
            <button
              onClick={onLogout}
              type="button"
              title="Logout"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isExpanded ? 'flex-start' : 'center',
                gap: isExpanded ? '8px' : '0',
                padding: '0.6rem 0.75rem',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#475569',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#B91C1C';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#475569';
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </span>
              {isExpanded && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* Spacer to hold content layout steady when sidebar is floating collapsed */}
        <div
          style={{
            width: '72px',
            minWidth: '72px',
            flexShrink: 0,
          }}
          aria-hidden="true"
        />

        {/* Content Container */}
        <main
          style={{
            flex: 1,
            padding: '2rem 2.25rem',
            maxWidth: '1380px',
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box',
          }}
        >
          {/* PIN Verification Banner if unverified */}
          {currentUser && !currentUser.isEmailVerified && (
            <div
              style={{
                background: '#FFFBEB',
                border: '1.5px solid #F59E0B',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.75rem',
                boxShadow: '2px 2px 0px #F59E0B',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ maxWidth: '640px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#B45309', fontWeight: '800', fontSize: '0.98rem', marginBottom: '4px' }}>
                    <IconWarning size={18} color="#B45309" /> Email Verification Required
                  </div>
                  <p style={{ color: '#92400E', fontSize: '0.86rem', margin: 0, lineHeight: 1.45 }}>
                    We sent a 4-digit PIN to <strong>{currentUser.email}</strong>. Enter it below for instant auto-approval to post projects and apply to teams.
                  </p>
                  {dashboardVerifyError && (
                    <p style={{ color: '#B91C1C', fontSize: '0.82rem', fontWeight: '700', marginTop: '6px', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <IconWarning size={14} color="#B91C1C" /> {dashboardVerifyError}
                    </p>
                  )}
                  {dashboardVerifyMsg && (
                    <p style={{ color: '#059669', fontSize: '0.82rem', fontWeight: '700', marginTop: '6px', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <IconCheck size={14} color="#059669" /> {dashboardVerifyMsg}
                    </p>
                  )}
                </div>

                <form onSubmit={handleVerifyDashboardPin} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="••••"
                    value={dashboardPin}
                    onChange={(e) => setDashboardPin(e.target.value.replace(/[^0-9]/g, ''))}
                    aria-label="4-digit verification PIN"
                    style={{
                      width: '85px',
                      padding: '0.55rem 0.5rem',
                      textAlign: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1.1rem',
                      fontWeight: '800',
                      letterSpacing: '4px',
                      border: '1.5px solid #D97706',
                      background: '#FFFFFF',
                      color: '#0F172A',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={verifyingDashboardPin || dashboardPin.length !== 4}
                    style={{
                      padding: '0.55rem 1rem',
                      background: '#D97706',
                      color: '#FFFFFF',
                      border: '1.5px solid #B45309',
                      fontWeight: '800',
                      fontSize: '0.86rem',
                      cursor: dashboardPin.length === 4 ? 'pointer' : 'not-allowed',
                      opacity: dashboardPin.length === 4 ? 1 : 0.6,
                      boxShadow: '1px 1px 0px #B45309',
                    }}
                  >
                    {verifyingDashboardPin ? 'Verifying...' : 'Verify PIN'}
                  </button>
                  <button
                    type="button"
                    onClick={handleResendDashboardPin}
                    disabled={resendingDashboardPin}
                    style={{
                      padding: '0.55rem 0.85rem',
                      background: '#FFFFFF',
                      color: '#B45309',
                      border: '1.5px solid #FDE68A',
                      fontWeight: '700',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}
                  >
                    {resendingDashboardPin ? 'Sending...' : 'Resend PIN'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Views */}
          {activeTab === 'overview' && (
            <OverviewView
              currentUser={currentUser}
              onOpenCreateProject={onOpenCreateProject}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenProfile={() => setActiveTab('profile')}
              onOpenManageProjects={() => {
                if (onOpenManageApplicants) onOpenManageApplicants(null);
                setActiveTab('projects');
              }}
              onSelectProject={onSelectProject}
            />
          )}

          {activeTab === 'explore' && (
            <ExploreView
              onOpenCreateProject={onOpenCreateProject}
              onSelectProject={onSelectProject}
              onOpenApply={onOpenApply}
            />
          )}

          {activeTab === 'projects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0F1B33', margin: 0 }}>
                  Projects & Team Management
                </h1>
                <button
                  onClick={onOpenCreateProject}
                  type="button"
                  style={{
                    backgroundColor: '#1F4FE0',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0.65rem 1.4rem',
                    fontWeight: '800',
                    fontSize: '0.88rem',
                    boxShadow: '2px 2px 0px #0F1B33',
                    cursor: 'pointer',
                  }}
                >
                  Post a Project
                </button>
              </div>
              <ProjectsGallery
                currentUser={currentUser}
                onOpenCreateProject={onOpenCreateProject}
                onSelectProject={onSelectProject}
                onOpenApply={onOpenApply}
                refreshTrigger={galleryRefreshKey}
              />
            </div>
          )}

          {activeTab === 'applications' && <ApplicationsView />}

          {activeTab === 'messages' && <MessagesView currentUser={currentUser} />}

          {activeTab === 'profile' && (
            <ProfileView
              currentUser={currentUser}
              userProfile={userProfile}
              onOpenEditProfile={onOpenEditProfile}
            />
          )}
        </main>
      </div>
    </div>
  );
}
