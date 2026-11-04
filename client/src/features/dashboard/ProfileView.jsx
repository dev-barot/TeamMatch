import React from 'react';
import { CircularGauge, CardCornerBrackets } from './ArchitecturalGraphics.jsx';

export function ProfileView({
  currentUser,
  userProfile,
  onOpenEditProfile,
}) {
  const name = currentUser?.name || 'Dev Barot';
  const email = currentUser?.email || '202512069@dau.ac.in';
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const specialty = userProfile?.specialty || 'Backend';
  const availability = userProfile?.weeklyAvailability ? `${userProfile.weeklyAvailability} hours / week` : '10 hours / week';
  const timezone = userProfile?.timezone || 'UTC';
  const workingStyle = userProfile?.workingStyle
    ? userProfile.workingStyle.charAt(0).toUpperCase() + userProfile.workingStyle.slice(1)
    : 'Collaborative';
  const experience = userProfile?.experienceLevel
    ? userProfile.experienceLevel.charAt(0).toUpperCase() + userProfile.experienceLevel.slice(1)
    : 'Intermediate';
  const skills = userProfile?.skills && userProfile.skills.length > 0 ? userProfile.skills : ['React', 'Node.js'];
  const bio = userProfile?.bio || null;

  // Compute completeness score
  const checks = [
    { label: 'Specialty', checked: Boolean(specialty) },
    { label: 'Skills', checked: skills.length > 0 },
    { label: 'Weekly hours', checked: Boolean(availability) },
    { label: 'Working style', checked: Boolean(workingStyle) },
    { label: 'Experience', checked: Boolean(experience) },
    { label: 'Bio', checked: Boolean(bio) },
  ];
  const completedCount = checks.filter((c) => c.checked).length;
  const percentage = Math.round((completedCount / checks.length) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ color: '#F59E0B', fontSize: '0.85rem' }}>◆</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: '700', letterSpacing: '0.08em', color: '#1F4FE0' }}>
              06 / PROFILE
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#0F1B33', letterSpacing: '-0.02em', margin: 0 }}>
            {name}
          </h1>
        </div>

        <button
          onClick={onOpenEditProfile}
          type="button"
          style={{
            position: 'relative',
            backgroundColor: '#1F4FE0',
            color: '#FFFFFF',
            border: 'none',
            padding: '0.7rem 1.6rem',
            fontFamily: 'var(--font-sans)',
            fontWeight: '700',
            fontSize: '0.92rem',
            clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 9px), calc(100% - 9px) 100%, 0 100%)',
            boxShadow: '3px 3px 0px #0F1B33',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translate(-1px, -1px)';
            e.currentTarget.style.boxShadow = '4px 4px 0px #0F1B33';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '3px 3px 0px #0F1B33';
          }}
        >
          Edit profile
        </button>
      </div>

      {/* 2-Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 340px) minmax(0, 1fr)',
          gap: '1.5rem',
        }}
      >
        {/* Left Column: Avatar & Completeness Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #0F1B33',
            padding: '1.75rem 1.5rem',
            boxShadow: '2px 2px 0px #0F1B33',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <CardCornerBrackets corners={['topLeft', 'bottomRight']} color="#F59E0B" size={14} thickness={2.5} />

          {/* Completeness Gauge */}
          <div style={{ marginBottom: '1.5rem' }}>
            <CircularGauge percentage={percentage || 83} size={90} strokeWidth={9} showAmberAccent={false} />
          </div>

          {/* Avatar with blue and amber offset framing */}
          <div style={{ position: 'relative', margin: '0.25rem 0 1.25rem' }}>
            {/* Top-left Blue Bracket */}
            <div
              style={{
                position: 'absolute',
                top: '-7px',
                left: '-7px',
                width: '18px',
                height: '18px',
                borderTop: '2.5px solid #1F4FE0',
                borderLeft: '2.5px solid #1F4FE0',
              }}
            />
            {/* Bottom-right Amber Bracket */}
            <div
              style={{
                position: 'absolute',
                bottom: '-7px',
                right: '-7px',
                width: '18px',
                height: '18px',
                borderBottom: '2.5px solid #F59E0B',
                borderRight: '2.5px solid #F59E0B',
              }}
            />

            <div
              style={{
                width: '68px',
                height: '68px',
                backgroundColor: '#EFF6FF',
                border: '1.5px solid #BFDBFE',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                fontSize: '1.45rem',
                color: '#0F1B33',
                letterSpacing: '-0.02em',
              }}
            >
              {initials}
            </div>
          </div>

          {/* Name & Email */}
          <h2 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F1B33', margin: '0 0 0.25rem 0' }}>
            {name}
          </h2>
          <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '600', marginBottom: '0.75rem' }}>
            {email}
          </span>

          {/* Verification Badge */}
          <div
            style={{
              padding: '4px 12px',
              border: '1.5px solid #0F1B33',
              borderRadius: '2px',
              backgroundColor: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              fontWeight: '800',
              color: '#0F1B33',
              marginBottom: '1.5rem',
            }}
          >
            <span style={{ color: '#F59E0B' }}>◆</span> Verified
          </div>

          <div style={{ width: '100%', height: '1px', backgroundColor: '#EEF2F6', marginBottom: '1.25rem' }} />

          {/* Checklist */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F1B33', marginBottom: '0.25rem' }}>
              Profile completeness
            </span>
            {checks.map((c) => (
              <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    backgroundColor: c.checked ? '#1F4FE0' : '#FFFFFF',
                    border: `1.5px solid ${c.checked ? '#1F4FE0' : '#CBD5E1'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '2px',
                    color: '#FFFFFF',
                    fontSize: '0.65rem',
                    fontWeight: '900',
                  }}
                >
                  {c.checked ? '✓' : ''}
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: '700', color: c.checked ? '#0F1B33' : '#64748B' }}>
                  {c.label}
                </span>
              </div>
            ))}
          </div>

          {/* Prompt card at bottom */}
          <div
            style={{
              marginTop: '1.5rem',
              width: '100%',
              padding: '0.85rem 1rem',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#1F4FE0', fontSize: '1rem', fontWeight: '800' }}>ⓘ</span>
              <span style={{ fontSize: '0.74rem', color: '#1E40AF', fontWeight: '700' }}>
                Complete your bio to improve your matches.
              </span>
            </div>
            <button
              onClick={onOpenEditProfile}
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#1F4FE0',
                fontWeight: '800',
                fontSize: '0.74rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Add bio →
            </button>
          </div>
        </div>

        {/* Right Column: Matching Profile & How it helps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Matching Profile Table */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #0F1B33',
              padding: '1.75rem',
              boxShadow: '2px 2px 0px #0F1B33',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
              <span style={{ display: 'inline-block', width: '3px', height: '18px', backgroundColor: '#1F4FE0' }} />
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F1B33', margin: 0 }}>
                Matching profile
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Specialty */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '0.85rem 0', borderBottom: '1px solid #EEF2F6' }}>
                <div style={{ width: '160px', display: 'flex', alignItems: 'center', gap: '8px', color: '#5A6B87', fontSize: '0.86rem', fontWeight: '700' }}>
                  <span style={{ color: '#1F4FE0' }}>❖</span> Specialty
                </div>
                <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0F1B33' }}>
                  {specialty}
                </div>
              </div>

              {/* Availability */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '0.85rem 0', borderBottom: '1px solid #EEF2F6' }}>
                <div style={{ width: '160px', display: 'flex', alignItems: 'center', gap: '8px', color: '#5A6B87', fontSize: '0.86rem', fontWeight: '700' }}>
                  <span style={{ color: '#1F4FE0' }}>⏱</span> Availability
                </div>
                <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0F1B33' }}>
                  {availability}
                </div>
              </div>

              {/* Timezone */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '0.85rem 0', borderBottom: '1px solid #EEF2F6' }}>
                <div style={{ width: '160px', display: 'flex', alignItems: 'center', gap: '8px', color: '#5A6B87', fontSize: '0.86rem', fontWeight: '700' }}>
                  <span style={{ color: '#1F4FE0' }}>🌐</span> Timezone
                </div>
                <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0F1B33' }}>
                  {timezone}
                </div>
              </div>

              {/* Working style */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '0.85rem 0', borderBottom: '1px solid #EEF2F6' }}>
                <div style={{ width: '160px', display: 'flex', alignItems: 'center', gap: '8px', color: '#5A6B87', fontSize: '0.86rem', fontWeight: '700' }}>
                  <span style={{ color: '#1F4FE0' }}>👥</span> Working style
                </div>
                <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0F1B33' }}>
                  {workingStyle}
                </div>
              </div>

              {/* Experience */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '0.85rem 0', borderBottom: '1px solid #EEF2F6' }}>
                <div style={{ width: '160px', display: 'flex', alignItems: 'center', gap: '8px', color: '#5A6B87', fontSize: '0.86rem', fontWeight: '700' }}>
                  <span style={{ color: '#1F4FE0' }}>📊</span> Experience
                </div>
                <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0F1B33' }}>
                  {experience}
                </div>
              </div>

              {/* Skills */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '0.85rem 0', borderBottom: '1px solid #EEF2F6' }}>
                <div style={{ width: '160px', display: 'flex', alignItems: 'center', gap: '8px', color: '#5A6B87', fontSize: '0.86rem', fontWeight: '700' }}>
                  <span style={{ color: '#1F4FE0' }}>&lt;/&gt;</span> Skills
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {skills.map((s) => (
                    <span
                      key={s}
                      style={{
                        fontSize: '0.8rem',
                        padding: '3px 10px',
                        backgroundColor: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        color: '#1E40AF',
                        fontWeight: '700',
                        borderRadius: '999px',
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div style={{ display: 'flex', alignItems: 'flex-start', padding: '0.85rem 0' }}>
                <div style={{ width: '160px', display: 'flex', alignItems: 'center', gap: '8px', color: '#5A6B87', fontSize: '0.86rem', fontWeight: '700' }}>
                  <span style={{ color: '#1F4FE0' }}>📄</span> Bio
                </div>
                <div style={{ fontStyle: bio ? 'normal' : 'italic', color: bio ? '#0F1B33' : '#64748B', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  {bio || 'No bio yet.'}
                </div>
              </div>
            </div>
          </div>

          {/* How your profile helps matching */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #0F1B33',
              padding: '1.75rem',
              boxShadow: '2px 2px 0px #0F1B33',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
              <span style={{ display: 'inline-block', width: '3px', height: '18px', backgroundColor: '#1F4FE0' }} />
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F1B33', margin: 0 }}>
                How your profile helps matching
              </h2>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {/* Card 1 */}
              <div
                style={{
                  padding: '1.15rem',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '2px',
                }}
              >
                <div style={{ color: '#1F4FE0', fontSize: '1.4rem', marginBottom: '0.65rem' }}>
                  ❖
                </div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: '900', color: '#0F1B33', margin: '0 0 0.4rem 0' }}>
                  Skill compatibility
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#5A6B87', margin: 0, lineHeight: 1.45 }}>
                  Matches you with projects that need your skills (e.g., {skills.slice(0, 2).join(', ')}).
                </p>
              </div>

              {/* Card 2 */}
              <div
                style={{
                  padding: '1.15rem',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '2px',
                }}
              >
                <div style={{ color: '#1F4FE0', fontSize: '1.4rem', marginBottom: '0.65rem' }}>
                  📅
                </div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: '900', color: '#0F1B33', margin: '0 0 0.4rem 0' }}>
                  Availability alignment
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#5A6B87', margin: 0, lineHeight: 1.45 }}>
                  Find teammates and projects that fit your weekly availability ({availability}).
                </p>
              </div>

              {/* Card 3 */}
              <div
                style={{
                  padding: '1.15rem',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '2px',
                }}
              >
                <div style={{ color: '#1F4FE0', fontSize: '1.4rem', marginBottom: '0.65rem' }}>
                  👥
                </div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: '900', color: '#0F1B33', margin: '0 0 0.4rem 0' }}>
                  Working-style fit
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#5A6B87', margin: 0, lineHeight: 1.45 }}>
                  Connect with people who prefer a similar way of working (e.g., {workingStyle}).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

