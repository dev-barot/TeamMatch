import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { AuthModal } from './features/auth/AuthModal.jsx';
import { ProfileEditor } from './features/profile/ProfileEditor.jsx';
import { ProjectsGallery } from './features/projects/ProjectsGallery.jsx';
import { CreateProjectModal } from './features/projects/CreateProjectModal.jsx';
import { ProjectDetailsModal } from './features/projects/ProjectDetailsModal.jsx';
import { authApi } from './api/authApi.js';
import { studentApi } from './api/studentApi.js';

export function App() {
  const [currentUser, setCurrentUser] = useState(() => authApi.getCurrentUser());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
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
        })
        .catch(() => {
          authApi.logout();
          setCurrentUser(null);
          setUserProfile(null);
        });
    }
  }, []);

  const handleLogout = () => {
    authApi.logout();
    setCurrentUser(null);
    setUserProfile(null);
  };

  const handleAuthSuccess = (student) => {
    setCurrentUser(student);
    setUserProfile(student.profile);
    setGalleryRefreshKey(k => k + 1);
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        currentUser={currentUser}
        onOpenAuth={(mode) => { setAuthModalMode(mode); setAuthModalOpen(true); }}
        onOpenProfile={() => setProfileModalOpen(true)}
        onLogout={handleLogout}
      />

      <main style={{ flex: 1, maxWidth: '1180px', margin: '0 auto', width: '100%', padding: '2.5rem 1.5rem' }}>
        {!currentUser ? (
          /* Landing Hero for Visitors */
          <section style={{ textAlign: 'center', padding: '2rem 1rem 3rem 1rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--primary)',
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
            }}>
              ✨ Module 2 Live: Projects & Positions Capacity
            </div>

            <h1 style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
              fontWeight: '800',
              lineHeight: 1.15,
              letterSpacing: '-1.5px',
              maxWidth: '850px',
              margin: '0 auto 1.5rem auto',
            }}>
              Form high-performing student teams with{' '}
              <span style={{
                background: 'linear-gradient(135deg, #818cf8, #22d3ee)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                explainable AI matching
              </span>
            </h1>

            <p style={{
              fontSize: '1.15rem',
              color: 'var(--text-muted)',
              maxWidth: '650px',
              margin: '0 auto 2.5rem auto',
              lineHeight: 1.6,
            }}>
              Discover semester projects and hackathon postings. Browse open seats by specialty and commitment level with guaranteed capacity constraints (R3).
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
              <button
                onClick={() => { setAuthModalMode('signup'); setAuthModalOpen(true); }}
                style={{
                  padding: '0.85rem 2rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '1rem',
                  boxShadow: 'var(--shadow-glow)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Create Student Account
              </button>
              <button
                onClick={() => { setAuthModalMode('login'); setAuthModalOpen(true); }}
                style={{
                  padding: '0.85rem 1.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-main)',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: 'pointer',
                }}
              >
                Log In
              </button>
            </div>

            {/* Public Live Projects Gallery (R5: unverified / visitor can browse) */}
            <div style={{ textAlign: 'left', marginTop: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Active Project Listings</h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  Rule R5: Public browsing enabled
                </span>
              </div>
              <ProjectsGallery
                currentUser={currentUser}
                onOpenCreateProject={handleOpenCreateProject}
                onSelectProject={(proj) => setSelectedProject(proj)}
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
        />
      )}
    </div>
  );
}

export default App;
