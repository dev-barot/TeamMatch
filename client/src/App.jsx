import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { AuthModal } from './features/auth/AuthModal.jsx';
import { ProfileEditor } from './features/profile/ProfileEditor.jsx';
import { ProjectsGallery } from './features/projects/ProjectsGallery.jsx';
import { CreateProjectModal } from './features/projects/CreateProjectModal.jsx';
import { ProjectDetailsModal } from './features/projects/ProjectDetailsModal.jsx';
import { ApplyModal } from './features/applications/ApplyModal.jsx';
import { MyApplicationsModal } from './features/applications/MyApplicationsModal.jsx';
import { ManageApplicantsModal } from './features/applications/ManageApplicantsModal.jsx';
import { ChatModal } from './features/messaging/ChatModal.jsx';
import { AdminPortal } from './features/admin/AdminPortal.jsx';
import { FeedbackWidget } from './components/ui/FeedbackWidget.jsx';
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
  const [activeTab, setActiveTab] = useState('projects');
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0);

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

      <main id="main-content" role="main" style={{ flex: 1, maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '2rem 1.5rem' }}>
        {!currentUser ? (
          /* Landing Hero for Visitors */
          <section style={{ padding: '2rem 0 4rem 0' }}>
            {/* 2-Column Hero Showcase */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '3rem',
              alignItems: 'center',
              marginBottom: '5rem',
            }}>
              {/* Left Column: Value Proposition */}
              <div style={{ textAlign: 'left' }}>
                {/* Pill Announcement */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 16px',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 'var(--radius-full)',
                  color: '#1d4ed8',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  marginBottom: '1.5rem',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                }}>
                  <span style={{
                    display: 'inline-block', width: '8px', height: '8px',
                    borderRadius: '50%', background: '#0284c7',
                  }} />
                  <span>AI-Assisted Team Formation</span>
                  <span style={{ color: '#94a3b8' }}>•</span>
                  <span style={{ color: '#475569', fontWeight: '600' }}>Fall 2026 Cohort</span>
                </div>

                {/* Main Headline */}
                <h1 style={{
                  fontSize: 'clamp(2.5rem, 4.5vw, 4rem)',
                  fontWeight: '800',
                  lineHeight: 1.12,
                  letterSpacing: '-1.5px',
                  marginBottom: '1.5rem',
                  color: '#0f172a',
                }}>
                  Form High-Performing Student Teams with{' '}
                  <span style={{ color: '#2563eb' }}>
                    Explainable AI
                  </span>
                </h1>

                {/* Subtitle */}
                <p style={{
                  fontSize: '1.15rem',
                  color: '#475569',
                  lineHeight: 1.65,
                  marginBottom: '2rem',
                  maxWidth: '580px',
                }}>
                  No more awkward group project cold-outreaches or unvetted teams. Find verified classmates by technical skills, availability, and guaranteed seat capacity constraints.
                </p>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                  <button
                    onClick={() => { setAuthModalMode('signup'); setAuthModalOpen(true); }}
                    className="btn-primary"
                    style={{ padding: '0.9rem 2.25rem', fontSize: '1rem' }}
                  >
                    Get Started Free →
                  </button>
                  <button
                    onClick={() => {
                      const el = document.getElementById('public-listings-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="btn-secondary"
                    style={{ padding: '0.9rem 1.75rem', fontSize: '1rem' }}
                  >
                    Explore Projects ↓
                  </button>
                </div>

                {/* Trust Checklist */}
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: '#475569', fontWeight: '500' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#059669', fontWeight: '800' }}>✓</span> Verified Student Profiles (R5)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#2563eb', fontWeight: '800' }}>✓</span> Top-5 Explainable Reasons (R4)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#0284c7', fontWeight: '800' }}>✓</span> Strict Capacity Enforced (R3)
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Team Formation Glass Preview Card */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 'var(--radius-xl)',
                padding: '2rem',
                boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
                position: 'relative',
              }}>
                {/* Preview Header Pill */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#059669', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                      Real-Time AI Matching
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                    CS420 • Fall 2026
                  </span>
                </div>

                {/* Project Title */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem' }}>
                    Autonomous Campus Delivery Rover
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#475569' }}>
                    Class Capstone Project • Robotics & Distributed Systems
                  </p>
                </div>

                {/* Capacity Meter */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  marginBottom: '1.5rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
                    <span style={{ color: '#475569' }}>Team Capacity Status</span>
                    <span style={{ color: '#059669' }}>● 2 / 3 Seats Reserved</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: '66%', height: '100%', background: '#059669', borderRadius: 'var(--radius-full)' }} />
                  </div>
                </div>

                {/* AI Candidate Match Card */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #dbeafe',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  marginBottom: '1.25rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: '#2563eb',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '800', fontSize: '0.85rem', color: '#fff',
                      }}>
                        AP
                      </div>
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>Ava Patel</div>
                        <div style={{ fontSize: '0.78rem', color: '#475569' }}>Backend & ML Lead</div>
                      </div>
                    </div>
                    <div style={{
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      color: '#059669',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8rem',
                      fontWeight: '800',
                    }}>
                      ⚡ 94% Match Fit
                    </div>
                  </div>

                  {/* Explainable Reasons Tags */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#2563eb' }}>✓</span>
                      <span><strong>Skills Overlap:</strong> Python, PyTorch, Node.js (+35 pts)</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#2563eb' }}>✓</span>
                      <span><strong>Schedule Fit:</strong> 18 hrs/wk available (High Commitment)</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#2563eb' }}>✓</span>
                      <span><strong>Working Style:</strong> Collaborative & Fast-Paced match</span>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => { setAuthModalMode('signup'); setAuthModalOpen(true); }}
                    className="btn-primary"
                    style={{ flex: 1, padding: '0.65rem 1rem', fontSize: '0.85rem' }}
                  >
                    Join Team as ML Engineer →
                  </button>
                </div>
              </div>
            </div>

            {/* "How It Works" 3-Step Feature Cards */}
            <div style={{ marginBottom: '5rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <span style={{
                  fontSize: '0.78rem', fontWeight: '800', color: '#2563eb',
                  textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px',
                }}>
                  The Architecture
                </span>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.5px', color: '#0f172a' }}>
                  How TeamMatch Works
                </h2>
                <p style={{ color: '#475569', fontSize: '1rem', marginTop: '0.5rem', maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
                  From solo student to high-performing squad in three transparent, verifiable steps.
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
              }}>
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2rem',
                  textAlign: 'left',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
                }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: 'var(--radius-md)',
                    background: '#eff6ff', border: '1px solid #bfdbfe',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#2563eb', fontWeight: '800', fontSize: '1.1rem', marginBottom: '1.25rem',
                  }}>
                    01
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem', color: '#0f172a' }}>
                    Profile & Skills (R2)
                  </h3>
                  <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    Students declare verified skill tags, primary specialty, weekly available hours, and preferred working style.
                  </p>
                </div>

                <div style={{
                  background: '#ffffff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2rem',
                  textAlign: 'left',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)',
                }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: 'var(--radius-md)',
                    background: '#eff6ff', border: '1px solid #bfdbfe',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#2563eb', fontWeight: '800', fontSize: '1.1rem', marginBottom: '1.25rem',
                  }}>
                    02
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem', color: '#0f172a' }}>
                    Explainable AI Engine (R4)
                  </h3>
                  <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    No black-box mystery. Our deterministic matching engine provides transparent score breakdown across 5 weighted reasons.
                  </p>
                </div>

                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2rem',
                  textAlign: 'left',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
                }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: 'var(--radius-md)',
                    background: '#ecfdf5', border: '1px solid #a7f3d0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#059669', fontWeight: '800', fontSize: '1.1rem', marginBottom: '1.25rem',
                  }}>
                    03
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem', color: '#0f172a' }}>
                    Atomic Formation (R1 & R3)
                  </h3>
                  <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    Concurrency-safe applications guarantee no double-booking and zero team overfill once headcount limits are reached.
                  </p>
                </div>
              </div>
            </div>

            {/* Public Live Projects Gallery (R5: unverified / visitor can browse) */}
            <div id="public-listings-section" style={{ textAlign: 'left', marginTop: '2rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginBottom: '1.75rem',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '1.25rem',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669', display: 'inline-block' }} />
                    <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#059669', fontWeight: '800' }}>
                      Live Project Listings
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.5px', color: '#0f172a' }}>
                    Explore Active Postings
                  </h2>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Rule R5: Public discovery open to all students
                </div>
              </div>
              <ProjectsGallery
                currentUser={currentUser}
                onOpenCreateProject={handleOpenCreateProject}
                onSelectProject={(proj) => setSelectedProject(proj)}
                onOpenApply={handleOpenApply}
                refreshTrigger={galleryRefreshKey}
              />
            </div>
          </section>
        ) : (
          /* Authenticated Student Dashboard */
          <section>
            {/* Header Greeting Banner */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              padding: '1.75rem 2rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '2rem',
              boxShadow: 'var(--shadow-md)',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
                  <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>
                    Welcome back, {currentUser.name}! 👋
                  </h1>
                  {currentUser.isEmailVerified ? (
                    <span style={{
                      background: 'rgba(34, 197, 94, 0.15)',
                      color: '#4ade80',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                    }}>
                      ✓ Verified (R5)
                    </span>
                  ) : (
                    <span style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#f87171',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                    }}>
                      Unverified (R5)
                    </span>
                  )}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Logged in as <code style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{currentUser.email}</code>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={handleOpenCreateProject}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    color: '#fff',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    boxShadow: 'var(--shadow-glow)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  + Post a Project (M2)
                </button>
                <button
                  onClick={() => setProfileModalOpen(true)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  ✏️ Edit Profile (R2)
                </button>
              </div>
            </div>

            {/* Dashboard Tabs */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              borderBottom: '1px solid var(--border)',
              marginBottom: '2rem',
              paddingBottom: '0.5rem',
            }}>
              <button
                onClick={() => setActiveTab('projects')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '8px 16px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: activeTab === 'projects' ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'projects' ? '2px solid var(--primary)' : '2px solid transparent',
                  cursor: 'pointer',
                }}
              >
                📁 Projects Gallery (M2)
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '8px 16px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'profile' ? '2px solid var(--primary)' : '2px solid transparent',
                  cursor: 'pointer',
                }}
              >
                👤 My Matching Profile (M1)
              </button>
            </div>

            {/* Tab 1: Projects Gallery */}
            {activeTab === 'projects' && (
              <ProjectsGallery
                currentUser={currentUser}
                onOpenCreateProject={handleOpenCreateProject}
                onSelectProject={(proj) => setSelectedProject(proj)}
                onOpenApply={handleOpenApply}
                refreshTrigger={galleryRefreshKey}
              />
            )}

            {/* Tab 2: Profile Overview Card */}
            {activeTab === 'profile' && (
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Active Matching Profile</h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    Enforced by Rule R2 (Student owns profile)
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Specialty</span>
                    <p style={{ fontSize: '1.1rem', fontWeight: '700', marginTop: '0.25rem' }}>
                      {userProfile?.specialty || 'Other'}
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Availability</span>
                    <p style={{ fontSize: '1.1rem', fontWeight: '700', marginTop: '0.25rem' }}>
                      {userProfile?.weeklyAvailability || 10} hours / week
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Timezone</span>
                    <p style={{ fontSize: '1.1rem', fontWeight: '700', marginTop: '0.25rem' }}>
                      {userProfile?.timezone || 'UTC'}
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Working Style</span>
                    <p style={{ fontSize: '1.1rem', fontWeight: '700', marginTop: '0.25rem', textTransform: 'capitalize' }}>
                      {userProfile?.workingStyle || 'collaborative'}
                    </p>
                  </div>
                </div>

                {/* Skills */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Skills</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {userProfile?.skills && userProfile.skills.length > 0 ? (
                      userProfile.skills.map((skill) => (
                        <span
                          key={skill}
                          style={{
                            background: 'rgba(99, 102, 241, 0.15)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            color: '#fff',
                            padding: '4px 12px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                          }}
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>No skills listed yet. Click Edit Profile to add skills.</span>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bio</span>
                  <p style={{ marginTop: '0.4rem', color: userProfile?.bio ? 'var(--text-main)' : 'var(--text-dim)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    {userProfile?.bio || 'No bio provided.'}
                  </p>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Global Modern Platform Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        background: 'rgba(10, 14, 26, 0.85)',
        backdropFilter: 'blur(16px)',
        padding: '3rem 1.5rem 2rem 1.5rem',
        marginTop: 'auto',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
                background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: '800', color: '#fff', fontSize: '0.9rem',
              }}>
                TM
              </div>
              <span style={{ fontWeight: '800', fontSize: '1.2rem', letterSpacing: '-0.5px' }}>
                Team<span className="text-gradient">Match</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, maxWidth: '320px' }}>
              Explainable AI-assisted team formation platform for university capstones, hackathons, and class projects.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#fff', marginBottom: '1rem' }}>
              Architecture & Rules
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <li>Rule R1: Duplicate Prevention</li>
              <li>Rule R2: Student Profile Ownership</li>
              <li>Rule R3: Atomic Headcount Capacity</li>
              <li>Rule R4: Explainable Match Scoring</li>
              <li>Rule R5: Email Verification Required</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#fff', marginBottom: '1rem' }}>
              Live System Status
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: '600' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                Realtime Socket.IO Gateway Online
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                Port: <code style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>4000</code> • Health: <code style={{ color: '#34d399', fontFamily: 'var(--font-mono)' }}>200 OK</code>
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                Hexagonal Architecture with Zero Express domain imports
              </div>
            </div>
          </div>
        </div>

        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          borderTop: '1px solid var(--border)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-dim)',
        }}>
          <div>
            © 2026 TeamMatch • MSc IT Software Design & Testing Semester Project
          </div>
          <div>
            Crafted for High-Performing Student Teams
          </div>
        </div>
      </footer>

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

      {/* M6: Admin Moderation Portal — only accessible for admin accounts (R2) */}
      {adminPortalOpen && currentUser?.accountType === 'admin' && (
        <AdminPortal
          currentUser={currentUser}
          onClose={() => setAdminPortalOpen(false)}
        />
      )}

      {/* M7: Feedback widget — every page (step 7) */}
      <FeedbackWidget />
    </div>
  );
}

export default App;
