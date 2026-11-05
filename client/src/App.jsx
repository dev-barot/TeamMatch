import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { AuthModal } from './features/auth/AuthModal.jsx';
import { ProfileEditor } from './features/profile/ProfileEditor.jsx';
import { CreateProjectModal } from './features/projects/CreateProjectModal.jsx';
import { ProjectDetailsModal } from './features/projects/ProjectDetailsModal.jsx';
import { ApplyModal } from './features/applications/ApplyModal.jsx';
import { MyApplicationsModal } from './features/applications/MyApplicationsModal.jsx';
import { ManageApplicantsModal } from './features/applications/ManageApplicantsModal.jsx';
import { ChatModal } from './features/messaging/ChatModal.jsx';
import { AdminPortal } from './features/admin/AdminPortal.jsx';
import { AdminDashboard } from './features/admin/AdminDashboard.jsx';
import { DashboardShell } from './features/dashboard/DashboardShell.jsx';
import { connectSocket, disconnectSocket } from './api/socketClient.js';
import { authApi } from './api/authApi.js';
import { studentApi } from './api/studentApi.js';

export function App() {
  const [currentUser, setCurrentUser] = useState(() => authApi.getCurrentUser());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [applyModalProject, setApplyModalProject] = useState(null);
  const [manageApplicantsProject, setManageApplicantsProject] = useState(null);
  const [myApplicationsModalOpen, setMyApplicationsModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatInitialCounterparty, setChatInitialCounterparty] = useState(null);
  const [adminPortalOpen, setAdminPortalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(() => currentUser?.profile || null);
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0);

  const isAdmin = Boolean(
    currentUser && (
      currentUser.accountType === 'admin' ||
      currentUser.email?.toLowerCase() === 'admin@teammatch.edu' ||
      currentUser.email?.toLowerCase() === 'admin@teammatch.app'
    )
  );
  // Hash-synced landing slide (0 = #intro, 1 = #how, 2 = #about)
  const getInitialSlide = () => {
    if (typeof window === 'undefined') return 0;
    const h = window.location.hash.toLowerCase();
    if (h === '#how') return 1;
    if (h === '#about') return 2;
    return 0;
  };

  const [landingSlide, setLandingSlide] = useState(getInitialSlide);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => (
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  ));
  const diamondRef = useRef(null);
  const prevSlideRef = useRef(landingSlide);
  const currentSlideRef = useRef(landingSlide);
  const scrollLockRef = useRef(false);
  const lastScrollTimestampRef = useRef(0);

  useEffect(() => {
    currentSlideRef.current = landingSlide;
  }, [landingSlide]);

  const goToSlide = (nextIndex, force = false) => {
    if (nextIndex < 0 || nextIndex > 2) return;
    if (nextIndex === currentSlideRef.current && !force) return;

    const now = Date.now();
    if (!force && (scrollLockRef.current || (now - lastScrollTimestampRef.current < 950))) {
      return;
    }

    scrollLockRef.current = true;
    lastScrollTimestampRef.current = now;
    currentSlideRef.current = nextIndex;
    setLandingSlide(nextIndex);

    setTimeout(() => {
      scrollLockRef.current = false;
    }, 950);
  };

  // Viewport under 900px detection (disables wheel hijack, enables vertical self-scroll)
  const [isUnder900, setIsUnder900] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 900 : false));
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setIsUnder900(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // prefers-reduced-motion listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Web Animations API: Centered Diamond Expansion teleport animation
  useEffect(() => {
    if (currentUser) return;
    if (prevSlideRef.current !== landingSlide) {
      if (diamondRef.current && !prefersReducedMotion) {
        diamondRef.current.animate(
          [
            { transform: 'translate(-50%, -50%) rotate(45deg) scale(0)', opacity: 1 },
            { transform: 'translate(-50%, -50%) rotate(45deg) scale(45)', opacity: 0 }
          ],
          {
            duration: 850,
            easing: 'cubic-bezier(.77, 0, .18, 1)',
            fill: 'forwards'
          }
        );
      }
      prevSlideRef.current = landingSlide;
    }
  }, [landingSlide, prefersReducedMotion, currentUser]);

  // Sync landingSlide to URL Hash (#intro, #how, #about)
  useEffect(() => {
    if (currentUser) return;
    const hashes = ['#intro', '#how', '#about'];
    if (window.location.hash !== hashes[landingSlide]) {
      history.replaceState(null, '', hashes[landingSlide]);
    }
  }, [landingSlide, currentUser]);

  // Listen to browser hashchange (back/forward button or external anchor click)
  useEffect(() => {
    if (currentUser) return;
    const handleHashChange = () => {
      const h = window.location.hash.toLowerCase();
      if (h === '#how') goToSlide(1, true);
      else if (h === '#about') goToSlide(2, true);
      else goToSlide(0, true);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser]);

  // Mouse wheel / trackpad gesture navigation: strictly 1 page at a time with momentum lock
  useEffect(() => {
    if (currentUser) return;

    const handleWheel = (e) => {
      if (authModalOpen || profileModalOpen) return;
      if (isUnder900) return; // Under 900px, disable wheel lock & allow native vertical scroll

      const dy = e.deltaY;
      const dx = e.deltaX;
      const absY = Math.abs(dy);
      const absX = Math.abs(dx);
      const primaryDelta = absY >= absX ? dy : dx;

      // Filter out micro-scrolls and trackpad jitter
      if (Math.abs(primaryDelta) < 18) return;

      // Prevent default page scroll / zoom behavior
      e.preventDefault();

      const now = Date.now();
      if (scrollLockRef.current || (now - lastScrollTimestampRef.current < 950)) {
        return;
      }

      const cur = currentSlideRef.current;
      // Scroll Down (dy > 0) or Pan Right (dx > 0) -> Next Page (slide + 1)
      if (primaryDelta > 0) {
        if (cur < 2) {
          goToSlide(cur + 1);
        }
      }
      // Scroll Up (dy < 0) or Pan Left (dx < 0) -> Previous Page (slide - 1)
      else if (primaryDelta < 0) {
        if (cur > 0) {
          goToSlide(cur - 1);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentUser, authModalOpen, profileModalOpen, isUnder900]);

  // Touch Swipe gesture navigation (horizontal and vertical gestures)
  useEffect(() => {
    if (currentUser) return;
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      if (authModalOpen || profileModalOpen) return;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      // Require meaningful swipe distance
      if (absX < 40 && absY < 40) return;

      const now = Date.now();
      if (scrollLockRef.current || (now - lastScrollTimestampRef.current < 950)) return;

      const cur = currentSlideRef.current;
      // Swipe Up (dy < 0) or Swipe Left (dx < 0) -> next page (forward)
      // Swipe Down (dy > 0) or Swipe Right (dx > 0) -> prev page (backward)
      const isForward = absY >= absX ? dy < 0 : dx < 0;

      if (isForward) {
        if (cur < 2) goToSlide(cur + 1);
      } else {
        if (cur > 0) goToSlide(cur - 1);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentUser, authModalOpen, profileModalOpen]);

  // Keyboard Arrow navigation (Down/Right = Next, Up/Left = Previous)
  useEffect(() => {
    if (currentUser) return;
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if (authModalOpen || profileModalOpen) return;

      const now = Date.now();
      if (scrollLockRef.current || (now - lastScrollTimestampRef.current < 950)) return;

      const cur = currentSlideRef.current;
      // Down / Right / PageDown -> Next section
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (cur < 2) goToSlide(cur + 1);
      }
      // Up / Left / PageUp -> Previous section
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (cur > 0) goToSlide(cur - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUser, authModalOpen, profileModalOpen]);

  const [dashboardPin, setDashboardPin] = useState('');
  const [verifyingDashboardPin, setVerifyingDashboardPin] = useState(false);
  const [resendingDashboardPin, setResendingDashboardPin] = useState(false);
  const [dashboardVerifyMsg, setDashboardVerifyMsg] = useState(null);
  const [dashboardVerifyError, setDashboardVerifyError] = useState(null);

  const handleVerifyDashboardPin = async (e) => {
    e.preventDefault();
    if (!dashboardPin || dashboardPin.trim().length !== 4) {
      setDashboardVerifyError('Please enter a complete 4-digit PIN.');
      return;
    }
    setDashboardVerifyError(null);
    setDashboardVerifyMsg(null);
    setVerifyingDashboardPin(true);
    try {
      await authApi.verifyEmail(dashboardPin.trim(), currentUser.email);
      setDashboardVerifyMsg('Email verified & auto-approved! You now have full platform access.');
      const updatedUser = { ...currentUser, isEmailVerified: true };
      setCurrentUser(updatedUser);
      localStorage.setItem('tm_current_user', JSON.stringify(updatedUser));
      setDashboardPin('');
    } catch (err) {
      setDashboardVerifyError(err.message || 'Verification failed. Please check the PIN.');
    } finally {
      setVerifyingDashboardPin(false);
    }
  };

  const handleResendDashboardPin = async () => {
    setDashboardVerifyError(null);
    setDashboardVerifyMsg(null);
    setResendingDashboardPin(true);
    try {
      const res = await authApi.resendVerificationCode(currentUser.email);
      setDashboardVerifyMsg(res.message || 'A new 4-digit code has been dispatched to your email.');
    } catch (err) {
      setDashboardVerifyError(err.message || 'Failed to resend code.');
    } finally {
      setResendingDashboardPin(false);
    }
  };

  useEffect(() => {
    const cached = authApi.getCurrentUser();
    if (cached) {
      studentApi.getMe()
        .then((data) => {
          setCurrentUser(data);
          setUserProfile(data.profile);
          const token = localStorage.getItem('tm_access_token');
          if (token) connectSocket(token);
        })
        .catch(() => {
          authApi.logout();
          disconnectSocket();
          setCurrentUser(null);
          setUserProfile(null);
        });
    }
  }, []);

  const handleLogout = () => {
    disconnectSocket();
    authApi.logout();
    setCurrentUser(null);
    setUserProfile(null);
    setChatModalOpen(false);
  };

  const handleAuthSuccess = (student) => {
    setCurrentUser(student);
    setUserProfile(student.profile);
    setGalleryRefreshKey(k => k + 1);
    const token = localStorage.getItem('tm_access_token');
    if (token) connectSocket(token);
  };

  const handleOpenChat = (counterparty = null) => {
    if (!currentUser) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return;
    }
    setChatInitialCounterparty(counterparty);
    setChatModalOpen(true);
  };

  const handleProfileUpdated = (updatedStudent) => {
    setCurrentUser(updatedStudent);
    setUserProfile(updatedStudent.profile);
  };

  const handleOpenCreateProject = () => {
    if (!currentUser) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return;
    }
    setCreateProjectModalOpen(true);
  };

  const handleProjectCreated = (_newProject) => {
    setGalleryRefreshKey(k => k + 1);
  };

  const handleProjectUpdated = (updated) => {
    setSelectedProject(updated);
    setGalleryRefreshKey(k => k + 1);
  };

  const handleOpenApply = (proj) => {
    if (!currentUser) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return;
    }
    setApplyModalProject(proj);
  };

  const handleOpenManageApplicants = (proj) => {
    setManageApplicantsProject(proj);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Centered Diamond Teleport Outline (Web Animations API) */}
      <div
        ref={diamondRef}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          width: '44px',
          height: '44px',
          border: '2px solid #1F4FE0',
          pointerEvents: 'none',
          zIndex: 99,
          transform: 'translate(-50%, -50%) rotate(45deg) scale(0)',
          opacity: 0,
        }}
        aria-hidden="true"
      />

      {!currentUser ? (
        <>
          <Navbar
            currentUser={currentUser}
            onOpenAuth={(mode) => { setAuthModalMode(mode); setAuthModalOpen(true); }}
            onOpenProfile={() => setProfileModalOpen(true)}
            onOpenMyApplications={() => setMyApplicationsModalOpen(true)}
            onOpenMessages={() => handleOpenChat(null)}
            onOpenAdmin={() => setAdminPortalOpen(true)}
            onNavigateToLink={() => handleOpenChat(null)}
            onLogout={handleLogout}
          />
          {/* Main 300% Track Container: Exactly 3 full-viewport sections */}
          <main
            id="main-content"
            role="main"
            style={{
              width: '100vw',
              maxWidth: '100vw',
              height: 'calc(100vh - 124px)',
              overflow: 'hidden',
              position: 'relative',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                width: '300%',
                height: '100%',
                transform: `translateX(-${landingSlide * (100 / 3)}%)`,
                transition: prefersReducedMotion ? 'none' : 'transform 0.85s cubic-bezier(.77, 0, .18, 1)',
              }}
            >
              {/* ============================================================
                  SECTION 1: INTRO (Overview, CTAs, Trust Checks & Demo)
                 ============================================================ */}
              <section
                id="intro"
                aria-label="Introduction"
                style={{
                  width: '33.333333%',
                  height: '100%',
                  flexShrink: 0,
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 'clamp(1rem, 2.5vw, 2.5rem)',
                  opacity: landingSlide === 0 ? 1 : 0.25,
                  transform: landingSlide === 0 ? 'scale(1)' : 'scale(0.92)',
                  transition: prefersReducedMotion ? 'none' : 'transform 0.85s cubic-bezier(.77, 0, .18, 1), opacity 0.85s cubic-bezier(.77, 0, .18, 1)',
                  overflowY: isUnder900 ? 'auto' : 'hidden',
                }}
              >
                <div style={{
                  width: '100%',
                  maxWidth: '1280px',
                  display: 'grid',
                  gridTemplateColumns: isUnder900 ? '1fr' : '1fr 1.15fr',
                  gap: 'clamp(2rem, 3.5vw, 3.5rem)',
                  alignItems: 'center',
                }}>
                  {/* Left Column: Eyebrow, Main Headline, Subtitle, CTAs, 3 Blueprint Features */}
                  <div style={{ textAlign: 'left' }}>
                    {/* Eyebrow Tag */}
                    <div className="stagger-in" style={{
                      animationDelay: '0ms',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '4px 12px',
                      border: '1.5px solid #0F1B33',
                      background: '#FFFFFF',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#0F1B33',
                      marginBottom: '1.25rem',
                      boxShadow: '1px 1px 0px rgba(15, 27, 51, 0.08)',
                    }}>
                      <span style={{ color: '#F59E0B', fontSize: '0.72rem' }}>◆</span>
                      <span>AI-Assisted Team Formation</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="stagger-in" style={{
                      animationDelay: '90ms',
                      fontSize: 'clamp(2.3rem, 4vw, 3.8rem)',
                      fontWeight: 800,
                      lineHeight: 1.1,
                      letterSpacing: '-0.035em',
                      color: '#0F1B33',
                      marginBottom: '1.1rem',
                    }}>
                      Find Your People.<br />
                      <span style={{ color: '#1F4FE0' }}>Build Something Great.</span>
                    </h1>

                    {/* Subhead Paragraph */}
                    <p className="stagger-in" style={{
                      animationDelay: '180ms',
                      fontSize: '1.02rem',
                      color: '#5A6B87',
                      lineHeight: 1.6,
                      marginBottom: '2rem',
                      maxWidth: '520px',
                    }}>
                      A smarter way for students to discover compatible teammates and exciting projects. Connect through skills, interests, experience, and availability with explainable matching.
                    </p>

                    {/* Two Chamfered CTAs */}
                    <div className="stagger-in" style={{
                      animationDelay: '270ms',
                      display: 'flex',
                      gap: '1rem',
                      flexWrap: 'wrap',
                      marginBottom: '2.5rem',
                    }}>
                      <button
                        onClick={() => { setAuthModalMode('signup'); setAuthModalOpen(true); }}
                        className="chamfer-btn chamfer-btn-primary"
                        aria-label="Find a Team"
                        style={{ padding: '1px' }}
                      >
                        <span className="chamfer-btn-inner" style={{ padding: '0.7rem 1.65rem', fontSize: '0.92rem', fontWeight: 700 }}>
                          Find a Team →
                        </span>
                      </button>
                      <button
                        onClick={() => { setAuthModalMode('signup'); setAuthModalOpen(true); }}
                        className="chamfer-btn chamfer-btn-secondary"
                        aria-label="Find Teammates"
                        style={{ padding: '1px' }}
                      >
                        <span className="chamfer-btn-inner" style={{ padding: '0.7rem 1.65rem', fontSize: '0.92rem', fontWeight: 700 }}>
                          Find Teammates →
                        </span>
                      </button>
                    </div>

                    {/* 3 Blueprint Feature Checks (Horizontal Row) */}
                    <div className="stagger-in" style={{
                      animationDelay: '360ms',
                      display: 'flex',
                      gap: 'clamp(1rem, 2vw, 2rem)',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                    }}>
                      {[
                        { title: 'Skill-Based', subtitle: 'Matching' },
                        { title: 'Explainable', subtitle: 'Recommendations' },
                        { title: 'Flexible', subtitle: 'Team Formation' },
                      ].map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                            <rect x="1" y="1" width="18" height="18" stroke="#0F1B33" strokeWidth="1.5" fill="#FFFFFF" />
                            <path d="M1 19L19 1" stroke="#0F1B33" strokeWidth="1.5" />
                            <polygon points="1,19 19,1 19,19" fill={i === 1 ? '#FDE68A' : '#93C5FD'} fillOpacity={i === 1 ? 0.85 : 0.55} />
                          </svg>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F1B33', lineHeight: 1.25 }}>
                            <div>{f.title}</div>
                            <div>{f.subtitle}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Visual Architectural Formation Diagram */}
                  <div className="stagger-in" style={{
                    animationDelay: '270ms',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                  }}>
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      maxWidth: '640px',
                      height: '410px',
                      margin: '0 auto',
                    }}>
                      {/* Translucent background decorative tiles */}
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '290px',
                        width: '110px',
                        height: '110px',
                        background: '#EFF6FF',
                        opacity: 0.85,
                        borderRadius: '8px',
                        pointerEvents: 'none',
                        zIndex: 0,
                      }} />
                      <div style={{
                        position: 'absolute',
                        top: '215px',
                        left: '170px',
                        width: '120px',
                        height: '90px',
                        background: '#FEF3C7',
                        opacity: 0.55,
                        borderRadius: '8px',
                        pointerEvents: 'none',
                        zIndex: 0,
                      }} />

                      {/* Blueprint Connecting Circuit Lines */}
                      <svg
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          pointerEvents: 'none',
                          zIndex: 3,
                        }}
                        viewBox="0 0 640 410"
                        fill="none"
                      >
                        {/* Terminal plugs on card edges */}
                        <rect x="225" y="54" width="6" height="12" rx="2" fill="#2563EB" />
                        <rect x="225" y="344" width="6" height="12" rx="2" fill="#2563EB" />
                        <rect x="399" y="54" width="6" height="12" rx="2" fill="#F59E0B" />
                        <rect x="389" y="344" width="6" height="12" rx="2" fill="#2563EB" />

                        {/* Orthogonal Circuit Line: Top-Left Student to Center Hub */}
                        <path
                          d="M 231 60 H 250 A 12 12 0 0 1 262 72 V 171 A 12 12 0 0 0 274 183 H 276"
                          stroke="#2563EB"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />

                        {/* Orthogonal Circuit Line: Bottom-Left Student to Center Hub */}
                        <path
                          d="M 231 350 H 250 A 12 12 0 0 0 262 338 V 239 A 12 12 0 0 1 274 227 H 276"
                          stroke="#2563EB"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />

                        {/* Orthogonal Circuit Line: Center Hub to Top-Right Project (Warm Amber Pathway) */}
                        <path
                          d="M 364 183 H 376 A 12 12 0 0 0 388 171 V 72 A 12 12 0 0 1 400 60 H 405"
                          stroke="#F59E0B"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />

                        {/* Orthogonal Circuit Line: Center Hub to Bottom-Right Team Match */}
                        <path
                          d="M 364 227 H 372 A 12 12 0 0 1 384 239 V 338 A 12 12 0 0 0 396 350 H 395"
                          stroke="#2563EB"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>

                      {/* Center Hub: Dashed Bounding Box */}
                      <div style={{
                        position: 'absolute',
                        top: '205px',
                        left: '320px',
                        transform: 'translate(-50%, -50%)',
                        width: '124px',
                        height: '124px',
                        border: '1px dashed #93C5FD',
                        borderRadius: '4px',
                        pointerEvents: 'none',
                        zIndex: 1,
                      }} />

                      {/* Center Hub Layer: Solid Blue Offset Accent Block (Top-Right) */}
                      <div style={{
                        position: 'absolute',
                        top: '205px',
                        left: '320px',
                        transform: 'translate(-38%, -62%)',
                        width: '88px',
                        height: '88px',
                        background: '#1F4FE0',
                        borderRadius: '12px',
                        pointerEvents: 'none',
                        zIndex: 2,
                      }} />

                      {/* Center Hub Layer: Warm Amber Accent Block (Bottom-Left) */}
                      <div style={{
                        position: 'absolute',
                        top: '205px',
                        left: '320px',
                        transform: 'translate(-62%, -38%)',
                        width: '46px',
                        height: '46px',
                        background: '#F59E0B',
                        borderRadius: '8px',
                        pointerEvents: 'none',
                        zIndex: 2,
                      }} />

                      {/* Center Hub: Rounded White Monogram Card */}
                      <div style={{
                        position: 'absolute',
                        top: '205px',
                        left: '320px',
                        transform: 'translate(-50%, -50%)',
                        width: '88px',
                        height: '88px',
                        background: '#FFFFFF',
                        border: '1.5px solid #0F172A',
                        borderRadius: '14px',
                        boxShadow: '0 10px 25px -4px rgba(37, 99, 235, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 4,
                      }}>
                        <div style={{ position: 'relative', width: '38px', height: '38px' }}>
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '24px',
                            height: '24px',
                            border: '3px solid #1F4FE0',
                            borderRadius: '2px',
                            background: '#FFFFFF',
                            zIndex: 2,
                          }} />
                          <div style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: '24px',
                            height: '24px',
                            border: '3px solid #F59E0B',
                            borderRadius: '2px',
                            background: '#FFFFFF',
                            zIndex: 1,
                          }} />
                          <div style={{
                            position: 'absolute',
                            top: '5px',
                            right: '3px',
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: '#1F4FE0',
                            zIndex: 3,
                          }} />
                        </div>
                      </div>

                      {/* Node 1: Top-Left "Student" Card */}
                      <div style={{
                        position: 'absolute',
                        top: '15px',
                        left: '10px',
                        width: '215px',
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '14px',
                        boxShadow: '0 8px 20px -3px rgba(15, 23, 42, 0.05), 0 3px 6px -2px rgba(15, 23, 42, 0.03)',
                        padding: '14px 18px',
                        zIndex: 4,
                      }}>
                        {/* Floating Offset Blue L-Bracket */}
                        <div style={{
                          position: 'absolute',
                          top: '-6px',
                          left: '-6px',
                          width: '20px',
                          height: '20px',
                          borderTop: '3px solid #2563EB',
                          borderLeft: '3px solid #2563EB',
                          borderTopLeftRadius: '4px',
                          pointerEvents: 'none',
                        }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="#3B82F6" style={{ flexShrink: 0 }}>
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                          <span style={{ fontWeight: 800, fontSize: '0.96rem', color: '#0F172A' }}>Student</span>
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          {['React', 'Node.js', 'UI/UX'].map(tag => (
                            <span key={tag} style={{
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              color: '#1E293B',
                              background: '#F1F5F9',
                              border: '1px solid #E2E8F0',
                              borderRadius: '8px',
                              padding: '3px 8px',
                            }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Node 2: Bottom-Left "Student" Card */}
                      <div style={{
                        position: 'absolute',
                        bottom: '15px',
                        left: '10px',
                        width: '215px',
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '14px',
                        boxShadow: '0 8px 20px -3px rgba(15, 23, 42, 0.05), 0 3px 6px -2px rgba(15, 23, 42, 0.03)',
                        padding: '14px 18px',
                        zIndex: 4,
                      }}>
                        {/* Floating Offset Blue L-Bracket */}
                        <div style={{
                          position: 'absolute',
                          bottom: '-6px',
                          left: '-6px',
                          width: '20px',
                          height: '20px',
                          borderBottom: '3px solid #2563EB',
                          borderLeft: '3px solid #2563EB',
                          borderBottomLeftRadius: '4px',
                          pointerEvents: 'none',
                        }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="#3B82F6" style={{ flexShrink: 0 }}>
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                          <span style={{ fontWeight: 800, fontSize: '0.96rem', color: '#0F172A' }}>Student</span>
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          {['Python', 'ML', 'Backend'].map(tag => (
                            <span key={tag} style={{
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              color: '#1E293B',
                              background: '#F1F5F9',
                              border: '1px solid #E2E8F0',
                              borderRadius: '8px',
                              padding: '3px 8px',
                            }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Node 3: Top-Right "Project" Card */}
                      <div style={{
                        position: 'absolute',
                        top: '15px',
                        right: '10px',
                        width: '225px',
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '14px',
                        boxShadow: '0 8px 20px -3px rgba(15, 23, 42, 0.05), 0 3px 6px -2px rgba(15, 23, 42, 0.03)',
                        padding: '14px 18px',
                        zIndex: 4,
                      }}>
                        {/* Floating Offset Warm Amber L-Bracket */}
                        <div style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-6px',
                          width: '20px',
                          height: '20px',
                          borderTop: '3px solid #F59E0B',
                          borderRight: '3px solid #F59E0B',
                          borderTopRightRadius: '4px',
                          pointerEvents: 'none',
                        }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="#F59E0B" style={{ flexShrink: 0 }}>
                            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                          </svg>
                          <span style={{ fontWeight: 800, fontSize: '0.96rem', color: '#0F172A' }}>Project</span>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                          <div style={{ height: '4px', width: '85%', background: '#CBD5E1', borderRadius: '2px', marginBottom: '4px' }} />
                          <div style={{ height: '4px', width: '60%', background: '#E2E8F0', borderRadius: '2px' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {['Web App', 'Team (3-4)'].map((tag, tIdx) => (
                            <span key={tag} style={{
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              color: tIdx === 0 ? '#B45309' : '#1E293B',
                              background: tIdx === 0 ? '#FFFBEB' : '#F1F5F9',
                              border: tIdx === 0 ? '1px solid #FDE68A' : '1px solid #E2E8F0',
                              borderRadius: '8px',
                              padding: '3px 8px',
                            }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Node 4: Bottom-Right "Team Match" Card */}
                      <div style={{
                        position: 'absolute',
                        bottom: '15px',
                        right: '10px',
                        width: '235px',
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '14px',
                        boxShadow: '0 8px 20px -3px rgba(15, 23, 42, 0.05), 0 3px 6px -2px rgba(15, 23, 42, 0.03)',
                        padding: '14px 18px',
                        zIndex: 4,
                      }}>
                        {/* Floating Offset Blue L-Bracket */}
                        <div style={{
                          position: 'absolute',
                          bottom: '-6px',
                          right: '-6px',
                          width: '20px',
                          height: '20px',
                          borderBottom: '3px solid #2563EB',
                          borderRight: '3px solid #2563EB',
                          borderBottomRightRadius: '4px',
                          pointerEvents: 'none',
                        }} />
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="#3B82F6" style={{ flexShrink: 0 }}>
                              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                            </svg>
                            <span style={{ fontWeight: 800, fontSize: '0.96rem', color: '#0F172A' }}>Team Match</span>
                          </div>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: '#22C55E',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.74rem',
                            fontWeight: '900',
                          }}>
                            ✓
                          </div>
                        </div>
                        {/* 3 Avatars Row with Halo Bubbles */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {[0, 1, 2].map((i) => (
                            <div key={i} style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: '#EFF6FF',
                              border: '1px solid #DBEAFE',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="#2563EB">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                              </svg>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ============================================================
                  SECTION 2: HOW IT WORKS (Connected Panel, Glyphs, Chips)
                 ============================================================ */}
              <section
                id="how"
                aria-label="How it works"
                style={{
                  width: '33.333333%',
                  height: '100%',
                  flexShrink: 0,
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 'clamp(1rem, 2.5vw, 2.5rem)',
                  opacity: landingSlide === 1 ? 1 : 0.25,
                  transform: landingSlide === 1 ? 'scale(1)' : 'scale(0.92)',
                  transition: prefersReducedMotion ? 'none' : 'transform 0.85s cubic-bezier(.77, 0, .18, 1), opacity 0.85s cubic-bezier(.77, 0, .18, 1)',
                  overflowY: isUnder900 ? 'auto' : 'hidden',
                }}
              >
                <div style={{
                  width: '100%',
                  maxWidth: '1280px',
                  display: 'grid',
                  gridTemplateColumns: isUnder900 ? '1fr' : '1fr 1.35fr',
                  gap: 'clamp(2rem, 3.5vw, 3.5rem)',
                  alignItems: 'center',
                }}>
                  {/* Left Column: Eyebrow, Main Headline, Subhead, Callout, 4 Feature Pillars */}
                  <div style={{ textAlign: 'left' }}>
                    {/* Eyebrow Tag */}
                    <div className="stagger-in" style={{
                      animationDelay: '0ms',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '4px 12px',
                      border: '1.5px solid #0F1B33',
                      background: '#FFFFFF',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#0F1B33',
                      marginBottom: '1.25rem',
                      boxShadow: '1px 1px 0px rgba(15, 27, 51, 0.08)',
                    }}>
                      <span style={{ color: '#F59E0B', fontSize: '0.72rem' }}>◆</span>
                      <span>02. HOW IT WORKS</span>
                    </div>

                    {/* Main Headline */}
                    <h2 className="stagger-in" style={{
                      animationDelay: '90ms',
                      fontSize: 'clamp(2.1rem, 3.4vw, 3.2rem)',
                      fontWeight: 800,
                      lineHeight: 1.15,
                      letterSpacing: '-0.035em',
                      color: '#0F1B33',
                      marginBottom: '1rem',
                    }}>
                      Find the Right Team<br />
                      or Get Matched<br />
                      <span style={{ color: '#1F4FE0' }}>for Your Project.</span>
                    </h2>

                    {/* Subhead Paragraph */}
                    <p className="stagger-in" style={{
                      animationDelay: '180ms',
                      fontSize: '0.98rem',
                      color: '#5A6B87',
                      lineHeight: 1.6,
                      marginBottom: '1.75rem',
                      maxWidth: '480px',
                    }}>
                      Whether you have a project idea or are looking for one, TeamMatch connects students through skills, compatibility, and shared goals.
                    </p>

                    {/* Callout with Vertical Blue Accent Bar */}
                    <div className="stagger-in" style={{
                      animationDelay: '270ms',
                      display: 'flex',
                      alignItems: 'stretch',
                      marginBottom: '2rem',
                    }}>
                      <div style={{ width: '3.5px', background: '#1F4FE0', borderRadius: '2px', marginRight: '12px' }} />
                      <div>
                        <div style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0F1B33', lineHeight: 1.3 }}>
                          Not Just a Match.
                        </div>
                        <div style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0F1B33', lineHeight: 1.3 }}>
                          A Match You Can Understand.
                        </div>
                      </div>
                    </div>

                    {/* 4 Feature Pillars (Horizontal Row with Dividers) */}
                    <div className="stagger-in" style={{
                      animationDelay: '360ms',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'clamp(0.6rem, 1.2vw, 1.2rem)',
                      flexWrap: isUnder900 ? 'wrap' : 'nowrap',
                    }}>
                      {/* Pillar 1: Skills & Role Compatibility */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1 }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          background: '#EFF6FF',
                          border: '1px solid #DBEAFE',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '6px',
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 2 7 12 12 22 7 12 2" />
                            <polyline points="2 17 12 22 22 17" />
                            <polyline points="2 12 12 17 22 12" />
                          </svg>
                        </div>
                        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0F1B33', lineHeight: 1.25 }}>
                          <div>Skills & Role</div>
                          <div>Compatibility</div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div style={{ width: '1px', height: '36px', background: '#E2E8F0', flexShrink: 0 }} />

                      {/* Pillar 2: Availability Alignment */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1 }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          background: '#EFF6FF',
                          border: '1px solid #DBEAFE',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '6px',
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                        </div>
                        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0F1B33', lineHeight: 1.25 }}>
                          <div>Availability</div>
                          <div>Alignment</div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div style={{ width: '1px', height: '36px', background: '#E2E8F0', flexShrink: 0 }} />

                      {/* Pillar 3: Working Style Fit */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1 }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          background: '#EFF6FF',
                          border: '1px solid #DBEAFE',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '6px',
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                        </div>
                        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0F1B33', lineHeight: 1.25 }}>
                          <div>Working</div>
                          <div>Style Fit</div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div style={{ width: '1px', height: '36px', background: '#E2E8F0', flexShrink: 0 }} />

                      {/* Pillar 4: Team Skill-Gap Identification (Amber Accent) */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1 }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          background: '#FFFBEB',
                          border: '1px solid #FDE68A',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '6px',
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="20" x2="18" y2="10" />
                            <line x1="12" y1="20" x2="12" y2="4" />
                            <line x1="6" y1="20" x2="6" y2="14" />
                          </svg>
                        </div>
                        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0F1B33', lineHeight: 1.25 }}>
                          <div>Team</div>
                          <div>Skill-Gap</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Dual-Track Pathway Architecture with Converging Circuit into Team Formation */}
                  <div className="stagger-in" style={{
                    animationDelay: '270ms',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    position: 'relative',
                  }}>
                    {/* Two Tracks Stacked Vertically */}
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '18px',
                      minWidth: 0,
                    }}>
                      {/* Track 1: Have a project? (Warm Amber Track) */}
                      <div>
                        {/* Tab Pills */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: '#FFFBEB',
                            border: '1px solid #FDE68A',
                            color: '#B45309',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                          }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#D97706">
                              <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                            </svg>
                            <span>Have a project?</span>
                          </div>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: '#F1F5F9',
                            border: '1px solid #E2E8F0',
                            color: '#D97706',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                          }}>
                            Find Teammates
                          </div>
                        </div>

                        {/* Track 1 Card with 3 steps */}
                        <div style={{
                          position: 'relative',
                          background: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: '14px',
                          boxShadow: '0 6px 18px -3px rgba(15, 23, 42, 0.04)',
                          padding: '16px 18px',
                          display: 'grid',
                          gridTemplateColumns: '1fr auto 1fr auto 1fr',
                          alignItems: 'center',
                          gap: '10px',
                        }}>
                          {/* Step 01 */}
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                color: '#D97706',
                                background: '#FFFBEB',
                                border: '1.5px solid #F59E0B',
                                borderRadius: '4px',
                                padding: '1px 5px',
                              }}>01</span>
                              <span style={{ fontWeight: 800, fontSize: '0.84rem', color: '#0F172A' }}>Post Your Project</span>
                            </div>
                            <p style={{ fontSize: '0.72rem', color: '#64748B', lineHeight: 1.35, margin: 0 }}>
                              Share your idea, skills and roles needed.
                            </p>
                          </div>

                          <span style={{ color: '#94A3B8', fontSize: '1rem', fontWeight: 600 }}>→</span>

                          {/* Step 02 */}
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                color: '#D97706',
                                background: '#FFFBEB',
                                border: '1.5px solid #F59E0B',
                                borderRadius: '4px',
                                padding: '1px 5px',
                              }}>02</span>
                              <span style={{ fontWeight: 800, fontSize: '0.84rem', color: '#0F172A' }}>Discover Matches</span>
                            </div>
                            <p style={{ fontSize: '0.72rem', color: '#64748B', lineHeight: 1.35, margin: 0 }}>
                              Explore AI-ranked students based on requirements.
                            </p>
                          </div>

                          <span style={{ color: '#94A3B8', fontSize: '1rem', fontWeight: 600 }}>→</span>

                          {/* Step 03 */}
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                color: '#D97706',
                                background: '#FFFBEB',
                                border: '1.5px solid #F59E0B',
                                borderRadius: '4px',
                                padding: '1px 5px',
                              }}>03</span>
                              <span style={{ fontWeight: 800, fontSize: '0.84rem', color: '#0F172A' }}>Build Your Team</span>
                            </div>
                            <p style={{ fontSize: '0.72rem', color: '#64748B', lineHeight: 1.35, margin: 0 }}>
                              Review candidates, send invitations and form your team.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Track 2: Looking for a project? */}
                      <div>
                        {/* Tab Pills */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            color: '#1D4ED8',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                          }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#2563EB">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                            <span>Looking for a project?</span>
                          </div>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: '#F1F5F9',
                            border: '1px solid #E2E8F0',
                            color: '#2563EB',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                          }}>
                            Find a Project
                          </div>
                        </div>

                        {/* Track 2 Card with 3 steps */}
                        <div style={{
                          position: 'relative',
                          background: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: '14px',
                          boxShadow: '0 6px 18px -3px rgba(15, 23, 42, 0.04)',
                          padding: '16px 18px',
                          display: 'grid',
                          gridTemplateColumns: '1fr auto 1fr auto 1fr',
                          alignItems: 'center',
                          gap: '10px',
                        }}>
                          {/* Step 01 */}
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                color: '#2563EB',
                                background: '#FFFFFF',
                                border: '1.5px solid #2563EB',
                                borderRadius: '4px',
                                padding: '1px 5px',
                              }}>01</span>
                              <span style={{ fontWeight: 800, fontSize: '0.84rem', color: '#0F172A' }}>Create Your Profile</span>
                            </div>
                            <p style={{ fontSize: '0.72rem', color: '#64748B', lineHeight: 1.35, margin: 0 }}>
                              Showcase your skills, preferred role and availability.
                            </p>
                          </div>

                          <span style={{ color: '#94A3B8', fontSize: '1rem', fontWeight: 600 }}>→</span>

                          {/* Step 02 */}
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                color: '#2563EB',
                                background: '#FFFFFF',
                                border: '1.5px solid #2563EB',
                                borderRadius: '4px',
                                padding: '1px 5px',
                              }}>02</span>
                              <span style={{ fontWeight: 800, fontSize: '0.84rem', color: '#0F172A' }}>Explore Matches</span>
                            </div>
                            <p style={{ fontSize: '0.72rem', color: '#64748B', lineHeight: 1.35, margin: 0 }}>
                              Discover projects that align with your skills and interests.
                            </p>
                          </div>

                          <span style={{ color: '#94A3B8', fontSize: '1rem', fontWeight: 600 }}>→</span>

                          {/* Step 03 */}
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                color: '#2563EB',
                                background: '#FFFFFF',
                                border: '1.5px solid #2563EB',
                                borderRadius: '4px',
                                padding: '1px 5px',
                              }}>03</span>
                              <span style={{ fontWeight: 800, fontSize: '0.84rem', color: '#0F172A' }}>Join a Team</span>
                            </div>
                            <p style={{ fontSize: '0.72rem', color: '#64748B', lineHeight: 1.35, margin: 0 }}>
                              Apply to projects, connect with creators and become part of a team.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Middle Converging SVG Circuit Connector */}
                    <div style={{
                      width: '46px',
                      height: '240px',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <svg width="46" height="240" viewBox="0 0 46 240" fill="none" style={{ width: '100%', height: '100%' }}>
                        {/* Upper curve from Track 1 (Warm Amber) */}
                        <path
                          d="M 0 54 C 26 54, 24 120, 46 120"
                          stroke="#F59E0B"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          fill="none"
                        />
                        {/* Lower curve from Track 2 (Royal Blue) */}
                        <path
                          d="M 0 186 C 26 186, 24 120, 46 120"
                          stroke="#2563EB"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          fill="none"
                        />
                      </svg>
                    </div>

                    {/* Destination Node: Team Formation Card */}
                    <div style={{
                      position: 'relative',
                      width: '175px',
                      flexShrink: 0,
                    }}>
                      {/* Solid Blue Offset Accent Block */}
                      <div style={{
                        position: 'absolute',
                        bottom: '-8px',
                        right: '-8px',
                        width: '100%',
                        height: '100%',
                        background: '#1F4FE0',
                        borderRadius: '16px',
                        zIndex: 1,
                      }} />

                      {/* Floating Offset L-Brackets (Warm Amber top-left + Royal Blue bottom-right) */}
                      <div style={{
                        position: 'absolute',
                        top: '-6px',
                        left: '-6px',
                        width: '20px',
                        height: '20px',
                        borderTop: '3px solid #F59E0B',
                        borderLeft: '3px solid #F59E0B',
                        borderTopLeftRadius: '4px',
                        zIndex: 4,
                        pointerEvents: 'none',
                      }} />
                      <div style={{
                        position: 'absolute',
                        bottom: '-14px',
                        right: '-14px',
                        width: '20px',
                        height: '20px',
                        borderBottom: '3px solid #2563EB',
                        borderRight: '3px solid #2563EB',
                        borderBottomRightRadius: '4px',
                        zIndex: 4,
                        pointerEvents: 'none',
                      }} />

                      {/* White Destination Card */}
                      <div style={{
                        position: 'relative',
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '16px',
                        padding: '24px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        zIndex: 2,
                        boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.06)',
                      }}>
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          background: '#EFF6FF',
                          border: '1.5px solid #DBEAFE',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '12px',
                        }}>
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="#2563EB">
                            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                          </svg>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '1.02rem', color: '#0F172A', marginBottom: '8px' }}>
                          Team Formation
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#64748B', lineHeight: 1.45 }}>
                          Find your fit.<br />Start collaborating.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ============================================================
                  SECTION 3: ABOUT US (Mission, 3 Stats, 3 Principles, 1 CTA)
                 ============================================================ */}
              <section
                id="about"
                aria-label="About us"
                style={{
                  width: '33.333333%',
                  height: '100%',
                  flexShrink: 0,
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 'clamp(2rem, 4.5vh, 3.25rem) clamp(1rem, 2.5vw, 2.5rem) clamp(2.5rem, 5.5vh, 3.75rem) clamp(1rem, 2.5vw, 2.5rem)',
                  opacity: landingSlide === 2 ? 1 : 0.25,
                  transform: landingSlide === 2 ? 'scale(1)' : 'scale(0.92)',
                  transition: prefersReducedMotion ? 'none' : 'transform 0.85s cubic-bezier(.77, 0, .18, 1), opacity 0.85s cubic-bezier(.77, 0, .18, 1)',
                  overflowY: isUnder900 ? 'auto' : 'hidden',
                }}
              >
                <div style={{
                  width: '100%',
                  maxWidth: '1280px',
                  display: 'grid',
                  gridTemplateColumns: isUnder900 ? '1fr' : '1fr 1.35fr',
                  gap: 'clamp(2rem, 3.5vw, 3.5rem)',
                  alignItems: 'center',
                }}>
                  {/* Left Column: Eyebrow, Main Headline, Story Paragraphs, Callout, Two CTAs */}
                  <div style={{ textAlign: 'left' }}>
                    {/* Eyebrow Tag */}
                    <div className="stagger-in" style={{
                      animationDelay: '0ms',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '4px 12px',
                      border: '1.5px solid #0F1B33',
                      background: '#FFFFFF',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#0F1B33',
                      marginBottom: '0.65rem',
                      boxShadow: '1px 1px 0px rgba(15, 27, 51, 0.08)',
                    }}>
                      <span style={{ color: '#F59E0B', fontSize: '0.72rem' }}>◆</span>
                      <span>03. ABOUT US</span>
                    </div>

                    {/* Main Headline */}
                    <h2 className="stagger-in" style={{
                      animationDelay: '90ms',
                      fontSize: 'clamp(1.75rem, 2.7vw, 2.6rem)',
                      fontWeight: 800,
                      lineHeight: 1.15,
                      letterSpacing: '-0.035em',
                      color: '#0F1B33',
                      marginBottom: '0.65rem',
                    }}>
                      Great Projects Begin<br />
                      with the <span style={{ color: '#1F4FE0' }}>Right People.</span>
                    </h2>

                    {/* Narrative Paragraphs */}
                    <div className="stagger-in" style={{
                      animationDelay: '180ms',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      fontSize: '0.88rem',
                      color: '#5A6B87',
                      lineHeight: 1.5,
                      marginBottom: '1rem',
                      maxWidth: '480px',
                    }}>
                      <p style={{ margin: 0 }}>
                        Finding teammates shouldn't depend on who you already know. Students have different skills, ideas, interests and ambitions, yet finding people with compatible abilities and availability can be challenging.
                      </p>
                      <p style={{ margin: 0 }}>
                        TeamMatch bridges that gap by bringing students and projects together through intelligent, transparent and compatibility-driven recommendations.
                      </p>
                    </div>

                    {/* Callout with Accent Bar */}
                    <div className="stagger-in" style={{
                      animationDelay: '270ms',
                      display: 'flex',
                      alignItems: 'stretch',
                      marginBottom: '1.1rem',
                    }}>
                      <div style={{ width: '3.5px', background: 'linear-gradient(to bottom, #1F4FE0 65%, #F59E0B 100%)', borderRadius: '2px', marginRight: '12px' }} />
                      <div>
                        <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0F1B33', lineHeight: 1.3 }}>
                          Have an Idea? Looking for a Team?
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#5A6B87', marginTop: '2px' }}>
                          Your next collaboration starts here.
                        </div>
                      </div>
                    </div>

                    {/* Two Chamfered CTAs */}
                    <div className="stagger-in" style={{
                      animationDelay: '360ms',
                      display: 'flex',
                      gap: '1rem',
                      flexWrap: 'wrap',
                      marginBottom: '0.25rem',
                    }}>
                      <button
                        onClick={() => { setAuthModalMode('signup'); setAuthModalOpen(true); }}
                        className="chamfer-btn chamfer-btn-primary"
                        aria-label="Get Started"
                        style={{ padding: '1px' }}
                      >
                        <span className="chamfer-btn-inner" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem', fontWeight: 700 }}>
                          Get Started →
                        </span>
                      </button>
                      <button
                        onClick={() => { setAuthModalMode('login'); setAuthModalOpen(true); }}
                        className="chamfer-btn chamfer-btn-secondary"
                        aria-label="Explore Projects"
                        style={{ padding: '1px' }}
                      >
                        <span className="chamfer-btn-inner" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem', fontWeight: 700 }}>
                          Explore Projects
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: 3 Architectural Perspective Cards on Pedestals + Comparison Matrix Table */}
                  <div className="stagger-in" style={{
                    animationDelay: '270ms',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                    width: '100%',
                  }}>
                    {/* Top: 3 Floating Isometric Cards on Pedestals */}
                    <div style={{
                      position: 'relative',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '10px',
                      alignItems: 'flex-end',
                      paddingBottom: '8px',
                    }}>
                      {/* Isometric Pedestal 3D SVG Foundation */}
                      <svg
                        style={{
                          position: 'absolute',
                          bottom: '0px',
                          left: '-6px',
                          right: '-6px',
                          width: 'calc(100% + 12px)',
                          height: '38px',
                          pointerEvents: 'none',
                          zIndex: 1,
                        }}
                        viewBox="0 0 600 46"
                        preserveAspectRatio="none"
                      >
                        {/* Left Pedestal Step */}
                        <polygon points="8,18 182,12 198,22 24,28" fill="#EFF6FF" />
                        <polygon points="24,28 198,22 198,40 24,46" fill="#DBEAFE" />
                        <polygon points="8,18 24,28 24,46 8,36" fill="#BFDBFE" />

                        {/* Center Pedestal Step (Elevated Warm Amber/Gold) */}
                        <polygon points="208,8 392,3 408,12 224,18" fill="#FEF3C7" />
                        <polygon points="224,18 408,12 408,34 224,40" fill="#FDE68A" />
                        <polygon points="208,8 224,18 224,40 208,30" fill="#F59E0B" />

                        {/* Right Pedestal Step */}
                        <polygon points="418,18 592,12 608,22 434,28" fill="#EFF6FF" />
                        <polygon points="434,28 608,22 608,40 434,46" fill="#DBEAFE" />
                        <polygon points="418,18 434,28 434,46 418,36" fill="#BFDBFE" />
                      </svg>

                      {/* Card 1: Compatibility Over Convenience */}
                      <div style={{
                        position: 'relative',
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: '12px 10px',
                        zIndex: 2,
                        boxShadow: '0 8px 20px -3px rgba(15, 23, 42, 0.05)',
                        minHeight: '130px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '-6px',
                          left: '-6px',
                          width: '18px',
                          height: '18px',
                          borderTop: '3px solid #2563EB',
                          borderLeft: '3px solid #2563EB',
                          borderTopLeftRadius: '4px',
                          pointerEvents: 'none',
                        }} />
                        <div>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '4px' }}>
                            <polygon points="12 2 2 7 12 12 22 7 12 2" />
                            <polyline points="2 17 12 22 22 17" />
                            <polyline points="2 12 12 17 22 12" />
                          </svg>
                          <div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#0F172A', marginBottom: '3px', lineHeight: 1.25 }}>
                            Compatibility Over Convenience
                          </div>
                        </div>
                        <p style={{ fontSize: '0.68rem', color: '#64748B', lineHeight: 1.35, margin: 0 }}>
                          Build teams around complementary skills, interests and availability rather than familiarity alone.
                        </p>
                      </div>

                      {/* Card 2: Transparency Over Guesswork (Elevated with Warm Amber Accent) */}
                      <div style={{
                        position: 'relative',
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: '12px 10px',
                        zIndex: 2,
                        transform: 'translateY(-6px)',
                        boxShadow: '0 12px 24px -4px rgba(245, 158, 11, 0.16), 0 4px 10px -2px rgba(15, 23, 42, 0.04)',
                        minHeight: '130px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-6px',
                          width: '18px',
                          height: '18px',
                          borderTop: '3px solid #F59E0B',
                          borderRight: '3px solid #F59E0B',
                          borderTopRightRadius: '4px',
                          pointerEvents: 'none',
                        }} />
                        <div>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '4px' }}>
                            <path d="M12 3l1.912 5.885a2 2 0 0 0 1.272 1.272L21 12l-5.816 1.843a2 2 0 0 0-1.272 1.272L12 21l-1.912-5.885a2 2 0 0 0-1.272-1.272L3 12l5.885-1.912a2 2 0 0 0 1.272-1.272L12 3z" />
                          </svg>
                          <div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#0F172A', marginBottom: '3px', lineHeight: 1.25 }}>
                            Transparency Over Guesswork
                          </div>
                        </div>
                        <p style={{ fontSize: '0.68rem', color: '#64748B', lineHeight: 1.35, margin: 0 }}>
                          Understand why a student or project is recommended through clear, explainable matching reasons.
                        </p>
                      </div>

                      {/* Card 3: Collaboration Without Barriers */}
                      <div style={{
                        position: 'relative',
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: '12px 10px',
                        zIndex: 2,
                        boxShadow: '0 8px 20px -3px rgba(15, 23, 42, 0.05)',
                        minHeight: '130px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-6px',
                          width: '18px',
                          height: '18px',
                          borderTop: '3px solid #2563EB',
                          borderRight: '3px solid #2563EB',
                          borderTopRightRadius: '4px',
                          pointerEvents: 'none',
                        }} />
                        <div>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '4px' }}>
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                          <div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#0F172A', marginBottom: '3px', lineHeight: 1.25 }}>
                            Collaboration Without Barriers
                          </div>
                        </div>
                        <p style={{ fontSize: '0.68rem', color: '#64748B', lineHeight: 1.35, margin: 0 }}>
                          Make it easier for students to discover opportunities, connect with others and build meaningful projects.
                        </p>
                      </div>
                    </div>

                    {/* Bottom: The Comparison Matrix Table ("What Makes TeamMatch Different?") */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                        <div style={{ width: '3px', height: '14px', background: '#F59E0B', borderRadius: '2px' }} />
                        <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0F1B33' }}>
                          What Makes TeamMatch Different?
                        </span>
                      </div>

                      <div style={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 14px -2px rgba(15, 23, 42, 0.04)',
                      }}>
                        {/* Table Header */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                          <div style={{
                            background: '#F1F5F9',
                            padding: '5px 10px',
                            textAlign: 'center',
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            color: '#0F172A',
                            borderBottom: '1px solid #E2E8F0',
                            borderRight: '1px solid #E2E8F0',
                          }}>
                            Traditional Team Formation
                          </div>
                          <div style={{
                            background: '#1F4FE0',
                            padding: '5px 10px',
                            textAlign: 'center',
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '7px',
                          }}>
                            <div style={{ position: 'relative', width: '14px', height: '14px' }}>
                              <div style={{ position: 'absolute', top: 0, left: 0, width: '9px', height: '9px', border: '1.5px solid #FFFFFF', borderRadius: '1px' }} />
                              <div style={{ position: 'absolute', bottom: 0, right: 0, width: '9px', height: '9px', border: '1.5px solid #F2A33A', borderRadius: '1px' }} />
                            </div>
                            <span>TeamMatch</span>
                          </div>
                        </div>

                        {/* 5 Comparison Rows */}
                        {[
                          { trad: 'Relying on existing friend groups', tm: 'Discovering compatible students' },
                          { trad: 'Manually searching for teammates', tm: 'AI-ranked recommendations' },
                          { trad: 'Guessing compatibility', tm: 'Explainable matching reasons' },
                          { trad: 'Unclear team requirements', tm: 'Defined roles and skill requirements' },
                          { trad: 'Informal coordination', tm: 'Structured applications, invitations and messaging' },
                        ].map((row, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              borderBottom: idx === 4 ? 'none' : '1px solid #F1F5F9',
                              background: idx % 2 === 1 ? '#FAFBFD' : '#FFFFFF',
                            }}
                          >
                            {/* Left Cell (Traditional) */}
                            <div style={{
                              padding: '4px 10px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '0.7rem',
                              color: '#475569',
                              borderRight: '1px solid #E2E8F0',
                            }}>
                              <span style={{
                                width: '14px',
                                height: '14px',
                                borderRadius: '3px',
                                background: '#F1F5F9',
                                color: '#64748B',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.62rem',
                                fontWeight: 800,
                                flexShrink: 0,
                              }}>
                                ✕
                              </span>
                              <span>{row.trad}</span>
                            </div>

                            {/* Right Cell (TeamMatch) */}
                            <div style={{
                              padding: '4px 10px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              color: '#0F172A',
                              background: '#F8FAFC',
                            }}>
                              <span style={{
                                width: '14px',
                                height: '14px',
                                borderRadius: '3px',
                                background: idx === 2 ? '#F59E0B' : '#1F4FE0',
                                color: '#FFFFFF',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.62rem',
                                fontWeight: 900,
                                flexShrink: 0,
                              }}>
                                ✓
                              </span>
                              <span>{row.tm}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </main>

          {/* ============================================================
              FIXED BOTTOM DOCK: 3 Labelled Architectural Markers
             ============================================================ */}
          <nav
            aria-label="Section navigation"
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              height: '64px',
              background: '#F6F8FB',
              borderTop: '1.5px solid #0F1B33',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 60,
              padding: '0 1rem',
              boxShadow: '0 -2px 6px rgba(15, 27, 51, 0.04)',
            }}
          >
            {/* 3 Labelled Markers */}
            <div
              role="tablist"
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#FFFFFF',
                border: '1.5px solid #0F1B33',
                boxShadow: '2px 2px 0px #0F1B33',
                padding: '3px',
                gap: '4px',
              }}
            >
              {[
                { id: 0, label: 'Intro' },
                { id: 1, label: 'How It Works' },
                { id: 2, label: 'About' },
              ].map((m) => {
                const isActive = landingSlide === m.id;
                return (
                  <button
                    key={m.id}
                    role="tab"
                    aria-selected={isActive}
                    aria-current={isActive ? 'step' : undefined}
                    onClick={() => goToSlide(m.id, true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 16px',
                      border: 'none',
                      background: isActive ? '#0F1B33' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#0F1B33',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.82rem',
                      fontWeight: isActive ? 800 : 600,
                      cursor: 'pointer',
                      transition: prefersReducedMotion ? 'none' : 'background 0.15s ease, color 0.15s ease',
                    }}
                  >
                    <span style={{
                      fontSize: '0.78rem',
                      color: isActive ? '#38BDF8' : '#5A6B87',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {isActive ? '◆' : '◇'}
                    </span>
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </>
      ) : isAdmin ? (
        <AdminDashboard
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      ) : (
        <DashboardShell
          currentUser={currentUser}
          userProfile={userProfile}
          onLogout={handleLogout}
          onOpenCreateProject={handleOpenCreateProject}
          onOpenEditProfile={() => setProfileModalOpen(true)}
          onSelectProject={(proj) => setSelectedProject(proj)}
          onOpenApply={handleOpenApply}
          onOpenManageApplicants={handleOpenManageApplicants}
          onOpenAdmin={() => setAdminPortalOpen(true)}
          galleryRefreshKey={galleryRefreshKey}
          dashboardPin={dashboardPin}
          setDashboardPin={setDashboardPin}
          handleVerifyDashboardPin={handleVerifyDashboardPin}
          handleResendDashboardPin={handleResendDashboardPin}
          verifyingDashboardPin={verifyingDashboardPin}
          resendingDashboardPin={resendingDashboardPin}
          dashboardVerifyError={dashboardVerifyError}
          dashboardVerifyMsg={dashboardVerifyMsg}
        />
      )}

      {/* Modals */}
      {authModalOpen && (
        <AuthModal
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {profileModalOpen && (
        <ProfileEditor
          currentUser={currentUser}
          onClose={() => setProfileModalOpen(false)}
          onProfileUpdated={handleProfileUpdated}
        />
      )}

      {createProjectModalOpen && (
        <CreateProjectModal
          currentUser={currentUser}
          onClose={() => setCreateProjectModalOpen(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}

      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          currentUser={currentUser}
          onClose={() => setSelectedProject(null)}
          onProjectUpdated={handleProjectUpdated}
          onOpenApply={(proj) => {
            setSelectedProject(null);
            handleOpenApply(proj);
          }}
          onOpenManageApplicants={(proj) => {
            setSelectedProject(null);
            handleOpenManageApplicants(proj);
          }}
          onMessageCreator={(creator) => {
            setSelectedProject(null);
            handleOpenChat(creator);
          }}
        />
      )}

      {applyModalProject && (
        <ApplyModal
          project={applyModalProject}
          currentUser={currentUser}
          onClose={() => setApplyModalProject(null)}
          onSuccess={() => {
            setGalleryRefreshKey(k => k + 1);
          }}
        />
      )}

      {manageApplicantsProject && (
        <ManageApplicantsModal
          project={manageApplicantsProject}
          onClose={() => setManageApplicantsProject(null)}
          onApplicantDecided={() => {
            setGalleryRefreshKey(k => k + 1);
          }}
          onMessageApplicant={(applicant) => {
            setManageApplicantsProject(null);
            handleOpenChat(applicant);
          }}
        />
      )}

      {myApplicationsModalOpen && (
        <MyApplicationsModal
          onClose={() => setMyApplicationsModalOpen(false)}
          onApplicationWithdrawn={() => {
            setGalleryRefreshKey(k => k + 1);
          }}
        />
      )}

      {chatModalOpen && (
        <ChatModal
          isOpen={chatModalOpen}
          onClose={() => {
            setChatModalOpen(false);
            setChatInitialCounterparty(null);
          }}
          currentStudent={currentUser}
          initialCounterparty={chatInitialCounterparty}
        />
      )}

      {/* Admin Moderation Portal — only accessible for admin accounts */}
      {adminPortalOpen && (currentUser?.accountType === 'admin' || currentUser?.email?.toLowerCase() === 'admin@teammatch.edu' || currentUser?.email?.toLowerCase() === 'admin@teammatch.app') && (
        <AdminPortal
          currentUser={currentUser}
          onClose={() => setAdminPortalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
