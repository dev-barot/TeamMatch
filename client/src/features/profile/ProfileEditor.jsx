import React, { useState, useEffect } from 'react';
import { studentApi } from '../../api/studentApi.js';

export function ProfileEditor({ currentUser, onClose, onProfileUpdated }) {
  const [profile, setProfile] = useState({
    skills: [],
    specialty: 'Backend',
    weeklyAvailability: 10,
    timezone: 'UTC',
    workingStyle: 'collaborative',
    experienceLevel: 'intermediate',
    bio: '',
  });

  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const data = await studentApi.getMe();
        if (data.profile) {
          setProfile({
            skills: data.profile.skills || [],
            specialty: data.profile.specialty || 'Backend',
            weeklyAvailability: data.profile.weeklyAvailability || 10,
            timezone: data.profile.timezone || 'UTC',
            workingStyle: data.profile.workingStyle || 'collaborative',
            experienceLevel: data.profile.experienceLevel || 'intermediate',
            bio: data.profile.bio || '',
          });
        }
      } catch {
        setErrorMessage('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    }

    if (currentUser) {
      loadProfile();
    }
  }, [currentUser]);

  const handleAddSkill = (e) => {
    e.preventDefault();
    const clean = skillInput.trim();
    if (!clean) return;
    const lower = clean.toLowerCase();
    if (!profile.skills.includes(lower)) {
      setProfile({
        ...profile,
        skills: [...profile.skills, lower],
      });
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((s) => s !== skillToRemove),
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      // Calls PATCH /students/:id/profile (Rule R2 guarded)
      const updated = await studentApi.updateProfile(currentUser.id, profile);
      setStatusMessage('Profile updated successfully (Guarded by Rule R2).');
      if (onProfileUpdated) {
        onProfileUpdated(updated);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 100 }}>
      <div className="modal-sheet" style={{ maxWidth: '600px', padding: '1.75rem', background: '#ffffff', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a' }}>Student Profile</h2>
            <p style={{ fontSize: '0.85rem', color: '#475569' }}>
              Matching-relevant attributes for Projects & Teams (Guarded by Rule R2)
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close profile editor"
            style={{
              padding: '0.4rem 0.6rem',
              color: '#64748b',
              fontSize: '1.25rem',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {statusMessage && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#059669',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontSize: '0.85rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <span>✓</span>
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontSize: '0.85rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {loading ? (
          <p style={{ color: '#475569', padding: '2rem 0', textAlign: 'center' }}>Loading profile...</p>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Specialty */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.35rem', color: '#334155' }}>
                Primary Specialty
              </label>
              <select
                value={profile.specialty}
                onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '0.92rem',
                }}
              >
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="ML">ML</option>
                <option value="DevOps">DevOps</option>
                <option value="UI/UX">UI/UX</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Skills Chip Manager */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.35rem', color: '#334155' }}>
                Skills (Used by Explainable AI Matcher)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, Docker, PyTorch..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '0.92rem',
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="btn-primary"
                  style={{
                    padding: '0.75rem 1.25rem',
                    fontSize: '0.88rem',
                  }}
                >
                  Add
                </button>
              </div>

              {/* Skills Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {profile.skills.length === 0 && (
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>No skills added yet.</span>
                )}
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    style={{
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      color: '#1d4ed8',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      aria-label={`Remove skill ${skill}`}
                      style={{ color: '#2563eb', fontSize: '1rem', lineHeight: 1, cursor: 'pointer', padding: '0 2px' }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Availability & Timezone Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.35rem', color: '#334155' }}>
                  Weekly Availability ({profile.weeklyAvailability} hrs/wk)
                </label>
                <input
                  type="number"
                  min="0"
                  max="80"
                  value={profile.weeklyAvailability}
                  onChange={(e) => setProfile({ ...profile, weeklyAvailability: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '0.92rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.35rem', color: '#334155' }}>
                  Timezone (IANA)
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTC, America/New_York"
                  value={profile.timezone}
                  onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '0.92rem',
                  }}
                />
              </div>
            </div>

            {/* Working Style & Experience Level Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.35rem', color: '#334155' }}>
                  Working Style
                </label>
                <select
                  value={profile.workingStyle}
                  onChange={(e) => setProfile({ ...profile, workingStyle: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '0.92rem',
                  }}
                >
                  <option value="collaborative">Collaborative</option>
                  <option value="independent">Independent</option>
                  <option value="detail-oriented">Detail-Oriented</option>
                  <option value="fast-paced">Fast-Paced</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.35rem', color: '#334155' }}>
                  Experience Level
                </label>
                <select
                  value={profile.experienceLevel}
                  onChange={(e) => setProfile({ ...profile, experienceLevel: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '0.92rem',
                  }}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Bio with 500-char counter */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#334155' }}>
                  Bio (Brief Overview)
                </label>
                <span style={{ fontSize: '0.75rem', color: profile.bio.length > 500 ? '#dc2626' : '#64748b' }}>
                  {profile.bio.length} / 500
                </span>
              </div>
              <textarea
                rows="3"
                placeholder="What projects are you excited to build?"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '0.92rem',
                }}
              />
            </div>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontWeight: '600',
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
                style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.92rem',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? 'Saving...' : 'Save Profile (R2)'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
