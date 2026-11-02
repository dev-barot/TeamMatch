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
import { connectSocket, disconnectSocket } from './api/socketClient.js';
import { authApi } from './api/authApi.js';
import { studentApi } from './api/studentApi.js';
import {
  IconCheck,
  IconSpark,
  IconEdit,
  IconPlus,
  IconProjects,
  IconProfile,
  IconWarning,
} from './components/ui/Icons.jsx';

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
                    onClick={() => { setAuthModalMode('login'); setAuthModalOpen(true); }}
                    className="btn-secondary"
                    style={{ padding: '0.9rem 1.75rem', fontSize: '1rem' }}
                  >
                    Sign In →
                  </button>
                </div>

                {/* Trust Checklist */}
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IconCheck size={14} color="#059669" /> Verified Student Profiles
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IconCheck size={14} color="#2563eb" /> Top Explainable Match Fit
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IconCheck size={14} color="#0284c7" /> Strict Capacity Enforced
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
                      border: '1.5px solid #a7f3d0',
                      color: '#059669',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}>
                      <IconSpark size={13} color="#059669" /> 94% MATCH FIT
                    </div>
                  </div>

                  {/* Explainable Reasons Tags */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconCheck size={12} color="#2563eb" />
                      <span><strong>Skills Overlap:</strong> Python, PyTorch, Node.js (+35 pts)</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconCheck size={12} color="#2563eb" />
                      <span><strong>Schedule Fit:</strong> 18 hrs/wk available (High Commitment)</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconCheck size={12} color="#2563eb" />
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
                    Profile & Skills
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
                    Explainable AI Engine
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
                    Atomic Team Formation
                  </h3>
                  <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    Concurrency-safe applications guarantee no double-booking and zero team overfill once headcount limits are reached.
                  </p>
                </div>
              </div>
            </div>
          </section>
        ) : (
          /* Authenticated Student Dashboard */
          <section>
            {/* Header Greeting Banner */}
            <div className="geo-card" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.25rem',
              padding: '1.75rem 2rem',
              background: '#ffffff',
              border: '2px solid var(--border-structural)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '2rem',
              boxShadow: 'var(--shadow-geo)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, transparent 50%, var(--primary) 50%)',
                opacity: 0.15,
                pointerEvents: 'none',
              }} />

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: '900', letterSpacing: '-0.02em', color: 'var(--ink)' }}>
                    Welcome back, {currentUser.name}
                  </h1>
                  {currentUser.isEmailVerified ? (
                    <span className="geo-tag" style={{
                      background: '#ecfdf5',
                      color: '#059669',
                      borderColor: '#a7f3d0',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      <IconCheck size={12} color="#059669" /> VERIFIED
                    </span>
                  ) : (
                    <span className="geo-tag" style={{
                      background: '#fffbeb',
                      color: '#b45309',
                      borderColor: '#fde68a',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      <IconWarning size={12} color="#b45309" /> UNVERIFIED
                    </span>
                  )}
                </div>
                <p style={{ color: 'var(--ink-muted)', fontSize: '0.88rem', margin: 0 }}>
                  Logged in as <code style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontWeight: '600' }}>{currentUser.email}</code>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={handleOpenCreateProject}
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <IconPlus size={15} />
                  <span>Post a Project</span>
                </button>
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <IconEdit size={14} />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>

            {/* Unverified Email Warning & 4-Digit PIN Gate */}
            {currentUser && !currentUser.isEmailVerified && (
              <div style={{
                background: '#fffbeb',
                border: '2px solid #f59e0b',
                borderRadius: 'var(--radius-sm)',
                padding: '1.25rem 1.75rem',
                marginBottom: '2rem',
                boxShadow: '2px 2px 0px #f59e0b',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ maxWidth: '640px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontWeight: '800', fontSize: '1rem', marginBottom: '4px' }}>
                      <IconWarning size={18} color="#b45309" /> Email Verification Required
                    </div>
                    <p style={{ color: '#92400e', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
                      We sent a 4-digit PIN to <strong>{currentUser.email}</strong>. Enter it below for instant auto-approval to post projects and apply to teams.
                    </p>
                    {dashboardVerifyError && (
                      <p style={{ color: '#b91c1c', fontSize: '0.82rem', fontWeight: '700', marginTop: '6px', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <IconWarning size={14} color="#b91c1c" /> {dashboardVerifyError}
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
                        width: '90px',
                        padding: '0.65rem 0.5rem',
                        textAlign: 'center',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '1.15rem',
                        fontWeight: '800',
                        letterSpacing: '4px',
                        borderRadius: 'var(--radius-sm)',
                        border: '2px solid #d97706',
                        background: '#ffffff',
                        color: '#0f172a',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="submit"
                      disabled={verifyingDashboardPin || dashboardPin.length !== 4}
                      style={{
                        padding: '0.65rem 1.2rem',
                        background: '#d97706',
                        color: '#ffffff',
                        border: '2px solid #b45309',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: '800',
                        fontSize: '0.88rem',
                        cursor: dashboardPin.length === 4 ? 'pointer' : 'not-allowed',
                        opacity: dashboardPin.length === 4 ? 1 : 0.6,
                        boxShadow: '1px 1px 0px #b45309',
                      }}
                    >
                      {verifyingDashboardPin ? 'Verifying...' : 'Verify PIN'}
                    </button>
                    <button
                      type="button"
                      onClick={handleResendDashboardPin}
                      disabled={resendingDashboardPin}
                      style={{
                        padding: '0.65rem 0.9rem',
                        background: '#ffffff',
                        color: '#b45309',
                        border: '1.5px solid #fde68a',
                        borderRadius: 'var(--radius-sm)',
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

            {/* Dashboard Tabs */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              borderBottom: '2px solid var(--border-structural)',
              marginBottom: '2rem',
              paddingBottom: 0,
            }}>
              <button
                onClick={() => setActiveTab('projects')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: activeTab === 'projects' ? '#ffffff' : 'transparent',
                  border: '2px solid',
                  borderColor: activeTab === 'projects' ? 'var(--border-structural)' : 'transparent',
                  borderBottom: activeTab === 'projects' ? '2px solid #ffffff' : 'none',
                  marginBottom: activeTab === 'projects' ? '-2px' : '0',
                  padding: '10px 18px',
                  fontSize: '0.92rem',
                  fontWeight: '800',
                  color: activeTab === 'projects' ? 'var(--primary)' : 'var(--ink-muted)',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                  transition: 'all 0.15s ease',
                }}
              >
                <IconProjects size={16} color={activeTab === 'projects' ? 'var(--primary)' : 'var(--ink-muted)'} />
                <span>Projects Gallery</span>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: activeTab === 'profile' ? '#ffffff' : 'transparent',
                  border: '2px solid',
                  borderColor: activeTab === 'profile' ? 'var(--border-structural)' : 'transparent',
                  borderBottom: activeTab === 'profile' ? '2px solid #ffffff' : 'none',
                  marginBottom: activeTab === 'profile' ? '-2px' : '0',
                  padding: '10px 18px',
                  fontSize: '0.92rem',
                  fontWeight: '800',
                  color: activeTab === 'profile' ? 'var(--primary)' : 'var(--ink-muted)',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                  transition: 'all 0.15s ease',
                }}
              >
                <IconProfile size={16} color={activeTab === 'profile' ? 'var(--primary)' : 'var(--ink-muted)'} />
                <span>My Matching Profile</span>
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
                  <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                    Only you can edit your profile details
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
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            color: '#1d4ed8',
                            padding: '4px 12px',
                            borderRadius: '999px',
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
      {adminPortalOpen && currentUser?.accountType === 'admin' && (
        <AdminPortal
          currentUser={currentUser}
          onClose={() => setAdminPortalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
