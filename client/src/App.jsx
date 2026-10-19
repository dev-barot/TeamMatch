import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { AuthModal } from './features/auth/AuthModal.jsx';
import { ProfileEditor } from './features/profile/ProfileEditor.jsx';
import { authApi } from './api/authApi.js';
import { studentApi } from './api/studentApi.js';

export function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // Check local session
    const cached = authApi.getCurrentUser();
    if (cached) {
      setCurrentUser(cached);
      studentApi.getMe()
        .then((data) => {
          setCurrentUser(data);
          setUserProfile(data.profile);
        })
        .catch(() => {
          authApi.logout();
          setCurrentUser(null);
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
  };

  const handleProfileUpdated = (updatedStudent) => {
    setCurrentUser(updatedStudent);
    setUserProfile(updatedStudent.profile);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        currentUser={currentUser}
        onOpenAuth={(mode) => { setAuthModalMode(mode); setAuthModalOpen(true); }}
        onOpenProfile={() => setProfileModalOpen(true)}
        onLogout={handleLogout}
      />

      <main style={{ flex: 1, maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '2.5rem 1.5rem' }}>
        {!currentUser ? (
          /* Landing Hero for Visitors */
          <section style={{ textAlign: 'center', padding: '3rem 1rem' }}>
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
              ✨ Module 1 Active: Identity & Verified Profiles
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
              Post semester projects or hackathon ideas with specific positions. Match based on skills, timezone, and working style with transparent match reasons.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
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
                }}
              >
                Log In
              </button>
            </div>

            {/* Feature Highlights Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginTop: '4rem',
              textAlign: 'left',
            }}>
              <div style={{
                padding: '1.75rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
              }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>🎯</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>Explainable Match Engine</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Every match score breaks down into top 5 human-readable reasons (e.g. fills skill gap, timezone overlap). No opaque black-box scores.
                </p>
              </div>

              <div style={{
                padding: '1.75rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
              }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>🛡️</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>Rigorous Business Rules</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Strict domain enforcement: positions never overfill (R3), one active application per project (R1), and verified identity gates (R5).
                </p>
              </div>

              <div style={{
                padding: '1.75rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
              }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>💬</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>1-on-1 Direct Messaging</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Chat directly with project creators or candidates before accepting invitations or making final team decisions.
                </p>
              </div>
            </div>
          </section>
        ) : (
          /* Authenticated Student Dashboard */
          <section>
            {/* Header Greeting */}
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
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                  Welcome back, {currentUser.name}! 👋
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Logged in as <code style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{currentUser.email}</code>
                </p>
              </div>

              <button
                onClick={() => setProfileModalOpen(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                }}
              >
                ✏️ Edit My Profile (R2)
              </button>
            </div>

            {/* Profile Overview Card */}
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
    </div>
  );
}

export default App;
