import React from 'react';
import { SteppedCapacityBar } from './ArchitecturalGraphics.jsx';

export function OverviewView({
  currentUser,
  onOpenCreateProject,
  onNavigateTab,
  onOpenProfile,
  onOpenManageProjects,
  onSelectProject,
}) {
  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Dev';

  const matches = [
    {
      id: 'FS4601',
      score: 90,
      scoreColor: '#1F4FE0',
      title: 'Fintech Peer-to-Peer Microloans Platform',
      tags: ['Skill overlap: Node.js', 'Fills skill gap: React', 'Open role: Backend'],
      category: 'Startup',
      specialty: 'Backend',
    },
    {
      id: 'ESF04',
      score: 83,
      scoreColor: '#1F4FE0',
      title: 'Campus Event Finder',
      tags: ['Skill overlap: React', 'Fills skill gap: Node.js', 'Open role: Frontend'],
      category: 'Open Source',
      specialty: 'Frontend',
    },
    {
      id: 'CS530',
      score: 63,
      scoreColor: '#F59E0B',
      title: 'Real-Time Collaborative Code Editor',
      tags: ['Skill overlap: React', 'Fills skill gap: Code Editor', 'Open role: Backend'],
      category: 'Class Project',
      specialty: 'Backend',
    },
  ];

  const activities = [
    {
      type: 'match',
      color: '#F59E0B',
      filled: true,
      text: 'New 90-point match: Fintech Peer-to-Peer Microloans Platform',
      time: 'JUST NOW',
    },
    {
      type: 'invite',
      color: '#0F1B33',
      filled: false,
      text: 'Rover Team invited you as Backend',
      time: '2 HOURS AGO',
    },
    {
      type: 'application',
      color: '#0F1B33',
      filled: false,
      text: '3 students applied to your project',
      time: 'YESTERDAY',
    },
    {
      type: 'message',
      color: '#0F1B33',
      filled: false,
      text: 'Aisha Patel replied about Code Editor',
      time: 'YESTERDAY',
    },
  ];

  const skillBars = [
    { name: 'React', count: 3, percentage: 80, color: '#1F4FE0' },
    { name: 'Node.js', count: 2, percentage: 55, color: '#2563EB' },
    { name: 'Python', count: 2, percentage: 55, color: '#0F1B33' },
    { name: 'MongoDB', count: 1, percentage: 30, color: '#0F1B33' },
    { name: 'Figma', count: 1, percentage: 30, color: '#0F1B33' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%' }}>
      {/* Welcome Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#F59E0B', fontSize: '1.4rem' }}>◆</span>
          <h1
            style={{
              fontSize: '1.9rem',
              fontWeight: '900',
              color: '#0F1B33',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Welcome back, <span style={{ color: '#1F4FE0' }}>{firstName}.</span>
          </h1>
        </div>

        <button
          onClick={onOpenCreateProject}
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
          Post a project
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Strong Matches */}
        <div
          onClick={() => onNavigateTab('explore')}
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #0F1B33',
            padding: '1.25rem 1.4rem',
            boxShadow: '2px 2px 0px #0F1B33',
            position: 'relative',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, right: 0, width: '16px', height: '16px', borderTop: '2px solid #CBD5E1', borderRight: '2px solid #CBD5E1' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.65rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1F4FE0',
                borderRadius: '4px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.06em', color: '#5A6B87', textTransform: 'uppercase' }}>
                STRONG MATCHES
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0F1B33', lineHeight: 1.1, marginTop: '2px' }}>
                3
              </div>
            </div>
          </div>
          <SteppedCapacityBar pattern={['dark', 'dark', 'dark', 'amber', 'empty']} />
        </div>

        {/* Applications */}
        <div
          onClick={() => onNavigateTab('applications')}
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #0F1B33',
            padding: '1.25rem 1.4rem',
            boxShadow: '2px 2px 0px #0F1B33',
            position: 'relative',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, right: 0, width: '16px', height: '16px', borderTop: '2px solid #CBD5E1', borderRight: '2px solid #CBD5E1' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.65rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1F4FE0',
                borderRadius: '4px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.06em', color: '#5A6B87', textTransform: 'uppercase' }}>
                APPLICATIONS
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0F1B33', lineHeight: 1.1, marginTop: '2px' }}>
                1
              </div>
            </div>
          </div>
          <SteppedCapacityBar pattern={['dark', 'empty', 'empty', 'empty', 'amber']} />
        </div>

        {/* Invitations */}
        <div
          onClick={() => onNavigateTab('applications')}
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #0F1B33',
            padding: '1.25rem 1.4rem',
            boxShadow: '2px 2px 0px #0F1B33',
            position: 'relative',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, right: 0, width: '16px', height: '16px', borderTop: '2px solid #CBD5E1', borderRight: '2px solid #CBD5E1' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.65rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1F4FE0',
                borderRadius: '4px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.06em', color: '#5A6B87', textTransform: 'uppercase' }}>
                INVITATIONS
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0F1B33', lineHeight: 1.1, marginTop: '2px' }}>
                1
              </div>
            </div>
          </div>
          <SteppedCapacityBar pattern={['dark', 'empty', 'empty', 'empty', 'amber']} />
        </div>

        {/* New Messages */}
        <div
          onClick={() => onNavigateTab('messages')}
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #0F1B33',
            padding: '1.25rem 1.4rem',
            boxShadow: '2px 2px 0px #0F1B33',
            position: 'relative',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, right: 0, width: '16px', height: '16px', borderTop: '2px solid #CBD5E1', borderRight: '2px solid #CBD5E1' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.65rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1F4FE0',
                borderRadius: '4px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.06em', color: '#5A6B87', textTransform: 'uppercase' }}>
                NEW MESSAGES
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0F1B33', lineHeight: 1.1, marginTop: '2px' }}>
                1
              </div>
            </div>
          </div>
          <SteppedCapacityBar pattern={['dark', 'empty', 'empty', 'empty', 'amber']} />
        </div>
      </div>

      {/* Middle Row: Best Matches (Left) + Activity (Right) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1fr)',
          gap: '1.5rem',
        }}
      >
        {/* Best matches for you */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #0F1B33',
            padding: '1.5rem',
            boxShadow: '2px 2px 0px #0F1B33',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: '3px', height: '18px', backgroundColor: '#1F4FE0' }} />
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F1B33', margin: 0 }}>
                Best matches for you
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('explore')}
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#1F4FE0',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              See all →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
            {matches.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (onSelectProject) {
                    onSelectProject({
                      id: item.id,
                      title: item.title,
                      category: item.category,
                      positions: [{ specialty: item.specialty, headcount: 1 }],
                      skills: ['React', 'Node.js'],
                      description: 'Platform connecting students and projects.',
                    });
                  } else {
                    onNavigateTab('explore');
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.85rem 1rem',
                  border: '1px solid #E2E8F0',
                  borderRadius: '2px',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease, border-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#1F4FE0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                {/* Score badge */}
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    backgroundColor: item.scoreColor,
                    color: '#FFFFFF',
                    fontWeight: '900',
                    fontSize: '1.15rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    borderRadius: '2px',
                  }}
                >
                  {item.score}
                </div>

                {/* Match Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '800', fontSize: '0.96rem', color: '#0F1B33', marginBottom: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </div>
                  <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                    {item.tags.map((t, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.74rem',
                          padding: '2px 8px',
                          border: '1px solid #CBD5E1',
                          borderRadius: '2px',
                          backgroundColor: '#F8FAFC',
                          color: '#475569',
                          fontWeight: '600',
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <span style={{ color: '#0F1B33', fontWeight: '800', fontSize: '1.1rem', flexShrink: 0 }}>
                  →
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #0F1B33',
            padding: '1.5rem',
            boxShadow: '2px 2px 0px #0F1B33',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: '3px', height: '18px', backgroundColor: '#1F4FE0' }} />
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F1B33', margin: 0 }}>
                Activity
              </h2>
            </div>
            <span
              style={{
                color: '#1F4FE0',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              View all →
            </span>
          </div>

          {/* Stepped timeline */}
          <div style={{ position: 'relative', paddingLeft: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {/* Vertical timeline line */}
            <div
              style={{
                position: 'absolute',
                left: '6px',
                top: '8px',
                bottom: '16px',
                width: '1.5px',
                backgroundColor: '#CBD5E1',
              }}
            />

            {activities.map((act, idx) => (
              <div key={idx} style={{ position: 'relative', marginBottom: idx !== activities.length - 1 ? '1.1rem' : 0 }}>
                {/* Stepped diamond marker */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-1.75rem',
                    top: '3px',
                    width: '13px',
                    height: '13px',
                    backgroundColor: act.filled ? act.color : '#FFFFFF',
                    border: `1.5px solid ${act.color}`,
                    transform: 'rotate(45deg)',
                    zIndex: 2,
                  }}
                />
                <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#0F1B33', lineHeight: 1.35 }}>
                  {act.text}
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#8F9FB8', letterSpacing: '0.04em', marginTop: '2px' }}>
                  {act.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Most Requested Skills (Left) + Your Path to a Team (Right) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.25fr)',
          gap: '1.5rem',
        }}
      >
        {/* Most requested skills */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #0F1B33',
            padding: '1.5rem',
            boxShadow: '2px 2px 0px #0F1B33',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
            <span style={{ display: 'inline-block', width: '3px', height: '18px', backgroundColor: '#1F4FE0' }} />
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F1B33', margin: 0 }}>
              Most requested skills
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {skillBars.map((sk) => (
              <div key={sk.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ width: '75px', fontSize: '0.86rem', fontWeight: '700', color: '#0F1B33' }}>
                  {sk.name}
                </span>
                <div style={{ flex: 1, height: '14px', backgroundColor: '#EEF2F6', borderRadius: '1px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${sk.percentage}%`,
                      height: '100%',
                      backgroundColor: sk.color,
                      borderRadius: '1px',
                    }}
                  />
                </div>
                <span style={{ width: '16px', fontSize: '0.88rem', fontWeight: '800', color: '#0F1B33', textAlign: 'right' }}>
                  {sk.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Your path to a team */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #0F1B33',
            padding: '1.5rem',
            boxShadow: '2px 2px 0px #0F1B33',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
            <span style={{ display: 'inline-block', width: '3px', height: '18px', backgroundColor: '#1F4FE0' }} />
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F1B33', margin: 0 }}>
              Your path to a team
            </h2>
          </div>

          {/* Diamond Milestones progression */}
          <div style={{ position: 'relative', margin: '1rem 1.5rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Connecting dashed line */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '20px',
                right: '20px',
                height: '1.5px',
                borderTop: '2px dashed #CBD5E1',
                transform: 'translateY(-50%)',
                zIndex: 1,
              }}
            />

            {/* Step 1: Applied */}
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #0F1B33',
                  transform: 'rotate(45deg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '1px 1px 0px #0F1B33',
                }}
              >
                <span style={{ transform: 'rotate(-45deg)', fontWeight: '900', fontSize: '0.92rem', color: '#0F1B33' }}>
                  2
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Applied</span>
            </div>

            {/* Step 2: Invited */}
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #F59E0B',
                  transform: 'rotate(45deg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '1px 1px 0px #F59E0B',
                }}
              >
                <span style={{ transform: 'rotate(-45deg)', fontWeight: '900', fontSize: '0.92rem', color: '#0F1B33' }}>
                  1
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Invited</span>
            </div>

            {/* Step 3: Accepted */}
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #0F1B33',
                  transform: 'rotate(45deg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '1px 1px 0px #0F1B33',
                }}
              >
                <span style={{ transform: 'rotate(-45deg)', fontWeight: '900', fontSize: '0.92rem', color: '#0F1B33' }}>
                  0
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Accepted</span>
            </div>

            {/* Step 4: Led */}
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#F59E0B',
                  border: '1.5px solid #0F1B33',
                  transform: 'rotate(45deg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '2px 2px 0px #0F1B33',
                }}
              >
                <span style={{ transform: 'rotate(-45deg)', fontWeight: '900', fontSize: '0.92rem', color: '#FFFFFF' }}>
                  1
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0F1B33' }}>Led</span>
            </div>
          </div>

          {/* Action buttons row */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigateTab('explore')}
              type="button"
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                backgroundColor: '#FFFFFF',
                color: '#0F1B33',
                border: '1.5px solid #0F1B33',
                fontWeight: '700',
                fontSize: '0.86rem',
                cursor: 'pointer',
                boxShadow: '2px 2px 0px #0F1B33',
                whiteSpace: 'nowrap',
              }}
            >
              Explore projects
            </button>
            <button
              onClick={onOpenManageProjects}
              type="button"
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                backgroundColor: '#FFFFFF',
                color: '#0F1B33',
                border: '1.5px solid #0F1B33',
                fontWeight: '700',
                fontSize: '0.86rem',
                cursor: 'pointer',
                boxShadow: '2px 2px 0px #0F1B33',
                whiteSpace: 'nowrap',
              }}
            >
              Manage projects
            </button>
            <button
              onClick={onOpenProfile}
              type="button"
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                backgroundColor: '#FFFFFF',
                color: '#0F1B33',
                border: '1.5px solid #0F1B33',
                fontWeight: '700',
                fontSize: '0.86rem',
                cursor: 'pointer',
                boxShadow: '2px 2px 0px #0F1B33',
                whiteSpace: 'nowrap',
              }}
            >
              Edit profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

