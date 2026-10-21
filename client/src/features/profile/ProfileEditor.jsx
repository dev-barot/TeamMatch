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
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 7, 12, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1.5rem',
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-lg)',
        padding: '2rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Student Profile</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Matching-relevant attributes for Projects & Teams
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem',
              color: 'var(--text-muted)',
              fontSize: '1.25rem',
            }}
          >
            ✕
          </button>
        </div>

        {statusMessage && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#6ee7b7',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontSize: '0.85rem',
          }}>
            {statusMessage}
          </div>
        )}

        {errorMessage && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontSize: '0.85rem',
          }}>
            {errorMessage}
          </div>
        )}

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading profile...</p>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Specialty */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                Specialty
              </label>
              <select
                value={profile.specialty}
                onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
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
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                Skills (Normalized & Deduplicated)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, Docker..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--primary)',
                    color: '#fff',
                    fontWeight: '600',
                  }}
                >
                  Add
                </button>
              </div>

              {/* Skills Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {profile.skills.length === 0 && (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>No skills added yet.</span>
                )}
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    style={{
                      background: 'rgba(99, 102, 241, 0.15)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      color: 'var(--text-main)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1 }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Availability & Timezone Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                  Weekly Availability ({profile.weeklyAvailability} hrs/wk)
                </label>
                <input
                  type="number"
                  min="0"
                  max="80"
                  value={profile.weeklyAvailability}
                  onChange={(e) => setProfile({ ...profile, weeklyAvailability: Number(e.target.value) })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                  Timezone (IANA)
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTC, America/New_York"
                  value={profile.timezone}
                  onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                />
              </div>
            </div>

            {/* Working Style & Experience Level Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                  Working Style
                </label>
                <select
                  value={profile.workingStyle}
                  onChange={(e) => setProfile({ ...profile, workingStyle: e.target.value })}
                >
                  <option value="collaborative">Collaborative</option>
                  <option value="independent">Independent</option>
                  <option value="detail-oriented">Detail-Oriented</option>
                  <option value="fast-paced">Fast-Paced</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                  Experience Level
                </label>
                <select
                  value={profile.experienceLevel}
                  onChange={(e) => setProfile({ ...profile, experienceLevel: e.target.value })}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Bio with 500-char counter */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                  Bio (Brief Overview)
                </label>
                <span style={{ fontSize: '0.75rem', color: profile.bio.length > 500 ? 'var(--danger)' : 'var(--text-dim)' }}>
                  {profile.bio.length} / 500
                </span>
              </div>
              <textarea
                rows="3"
                placeholder="What projects are you excited to build?"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              />
            </div>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  fontWeight: '600',
                }}
              >
                Close
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  color: '#fff',
                  fontWeight: '700',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
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
