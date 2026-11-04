import React, { useState, useMemo } from 'react';
import { CircularGauge, GeometricAccents, CardCornerBrackets } from './ArchitecturalGraphics.jsx';
import { IconSearch } from '../../components/ui/Icons.jsx';

const DEFAULT_PROJECTS = [
  {
    id: 'FS4601',
    badge: 'Startup',
    badgeColor: '#F59E0B',
    title: 'Fintech Peer-to-Peer Microloans Platform',
    description: 'A platform for student microloans with credit scoring and repayments.',
    rolesFilled: 2,
    rolesTotal: 4,
    skills: ['node.js', 'react', 'mongodb'],
    duration: '10 weeks',
    location: 'DAU Campus',
    workload: 'MEDIUM',
    openSpots: 4,
    score: 90,
    scoreColor: '#1F4FE0',
    category: 'Startup',
    specialty: 'Backend',
  },
  {
    id: 'ESF04',
    badge: 'Open Source',
    badgeColor: '#F59E0B',
    title: 'Campus Event Finder',
    description: 'Discover and manage campus events, clubs and activities.',
    rolesFilled: 2,
    rolesTotal: 3,
    skills: ['react', 'node.js', 'figma'],
    duration: '4 weeks',
    location: 'Remote',
    workload: 'LOW',
    openSpots: 2,
    score: 83,
    scoreColor: '#1F4FE0',
    category: 'Open Source',
    specialty: 'Frontend',
  },
  {
    id: 'CS530',
    badge: 'Class Project',
    badgeColor: '#F59E0B',
    title: 'Real-Time Collaborative Code Editor',
    description: 'A real-time code editor with live collaboration, sync and chat.',
    rolesFilled: 3,
    rolesTotal: 5,
    skills: ['frontend', 'backend', 'typescript'],
    duration: '8 weeks',
    location: 'Remote',
    workload: 'MEDIUM',
    openSpots: 3,
    score: 63,
    scoreColor: '#F59E0B',
    category: 'Class Project',
    specialty: 'Backend',
  },
  {
    id: 'TI661',
    badge: 'Research',
    badgeColor: '#F59E0B',
    title: 'Lecture Notes Summarizer',
    description: 'Summarize lecture slides and notes using NLP for faster studying.',
    rolesFilled: 2,
    rolesTotal: 4,
    skills: ['python', 'llm', 'fastapi'],
    duration: '10 weeks',
    location: 'Remote',
    workload: 'MEDIUM',
    openSpots: 2,
    score: 35,
    scoreColor: '#F59E0B',
    category: 'Research',
    specialty: 'ML',
  },
  {
    id: 'CS408',
    badge: 'Hackathon',
    badgeColor: '#F59E0B',
    title: 'Autonomous Campus Delivery Rover',
    description: 'A robotic rover for short-distance deliveries across campus.',
    rolesFilled: 1,
    rolesTotal: 4,
    skills: ['python', 'ros', 'computer-vision'],
    duration: '12 weeks',
    location: 'Robotics Lab',
    workload: 'HIGH',
    openSpots: 4,
    score: 15,
    scoreColor: '#F59E0B',
    category: 'Hackathon',
    specialty: 'Backend',
  },
];

export function ExploreView({
  onOpenCreateProject,
  onSelectProject,
  onOpenApply,
}) {
  const [tabMode, setTabMode] = useState('all'); // 'all' | 'ai_matches'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('Any');
  const [selectedWorkload, setSelectedWorkload] = useState('Any');
  const [selectedCategory, setSelectedCategory] = useState('Any');

  const filteredProjects = useMemo(() => {
    return DEFAULT_PROJECTS.filter((p) => {
      if (tabMode === 'ai_matches' && p.score < 50) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesSkills = p.skills.some((s) => s.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesSkills) return false;
      }
      if (selectedSpecialty !== 'Any' && p.specialty !== selectedSpecialty) return false;
      if (selectedWorkload !== 'Any' && p.workload !== selectedWorkload) return false;
      if (selectedCategory !== 'Any' && p.category !== selectedCategory) return false;
      return true;
    });
  }, [tabMode, searchQuery, selectedSpecialty, selectedWorkload, selectedCategory]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ color: '#F59E0B', fontSize: '0.85rem' }}>◆</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: '700', letterSpacing: '0.08em', color: '#1F4FE0' }}>
              02 / EXPLORE OU
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#0F1B33', letterSpacing: '-0.02em', margin: 0 }}>
            Find your <span style={{ color: '#1F4FE0' }}>seat</span>
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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

          <GeometricAccents size={16} />
        </div>
      </div>

      {/* BEST MATCH FOR YOU Hero Banner */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1.5px solid #0F1B33',
          padding: '1.5rem 1.75rem',
          boxShadow: '2px 2px 0px #0F1B33',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
        }}
      >
        <CardCornerBrackets corners={['topLeft', 'bottomLeft']} color="#F59E0B" size={14} thickness={2.5} />
        <CardCornerBrackets corners={['topRight']} color="#F59E0B" size={14} thickness={2.5} />

        {/* Left details */}
        <div style={{ flex: 1, minWidth: '280px', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 9px',
                backgroundColor: '#FFFBEB',
                border: '1px solid #F59E0B',
                color: '#B45309',
                fontSize: '0.72rem',
                fontWeight: '800',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              <span style={{ color: '#F59E0B' }}>◆</span> BEST MATCH FOR YOU
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#475569', fontWeight: '700' }}>
              FS4601
            </span>
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#0F1B33', margin: '0 0 0.85rem 0', letterSpacing: '-0.01em' }}>
            Fintech Peer-to-Peer Microloans Platform
          </h2>

          {/* Reason chips */}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <span
              style={{
                fontSize: '0.76rem',
                fontWeight: '700',
                padding: '4px 10px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                color: '#1E40AF',
                borderRadius: '999px',
              }}
            >
              +25 Has 2 of 4 required skills: node.js, react
            </span>
            <span
              style={{
                fontSize: '0.76rem',
                fontWeight: '700',
                padding: '4px 10px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                color: '#1E40AF',
                borderRadius: '999px',
              }}
            >
              +15 Fills skill gap: node.js
            </span>
            <span
              style={{
                fontSize: '0.76rem',
                fontWeight: '700',
                padding: '4px 10px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                color: '#1E40AF',
                borderRadius: '999px',
              }}
            >
              +15 Fills skill gap: react
            </span>
          </div>

          {/* Meta line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.82rem', fontWeight: '700', color: '#475569' }}>
            <span>📅 10 weeks</span>
            <span>📍 DAU Campus</span>
            <span>👥 4 open spots</span>
          </div>
        </div>

        {/* Right Gauge with isometric backdrop */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, padding: '0.5rem 1.5rem' }}>
          {/* Blueprint linework background */}
          <svg
            width="220"
            height="110"
            viewBox="0 0 220 110"
            fill="none"
            style={{ position: 'absolute', right: '-20px', top: '-10px', pointerEvents: 'none', opacity: 0.3 }}
          >
            <polygon points="110,10 190,55 110,100 30,55" stroke="#1F4FE0" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="30" y1="55" x2="30" y2="95" stroke="#1F4FE0" strokeWidth="1" />
            <line x1="190" y1="55" x2="190" y2="95" stroke="#1F4FE0" strokeWidth="1" />
            <line x1="110" y1="100" x2="110" y2="140" stroke="#1F4FE0" strokeWidth="1" />
          </svg>

          <CircularGauge percentage={90} size={100} strokeWidth={10} />
        </div>
      </div>

      {/* Filter and Search Bar — All items in a single line */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          width: '100%',
          flexWrap: 'nowrap',
          overflowX: 'auto',
          boxSizing: 'border-box',
        }}
      >
        {/* All projects / AI matches toggle */}
        <div
          style={{
            display: 'inline-flex',
            border: '1.5px solid #0F1B33',
            padding: '2px',
            backgroundColor: '#FFFFFF',
            flexShrink: 0,
            height: '38px',
            boxSizing: 'border-box',
          }}
        >
          <button
            type="button"
            onClick={() => setTabMode('all')}
            style={{
              padding: '0 16px',
              border: 'none',
              backgroundColor: tabMode === 'all' ? '#0F1B33' : '#FFFFFF',
              color: tabMode === 'all' ? '#FFFFFF' : '#0F1B33',
              fontWeight: '800',
              fontSize: '0.82rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            All projects
          </button>
          <button
            type="button"
            onClick={() => setTabMode('ai_matches')}
            style={{
              padding: '0 16px',
              border: 'none',
              backgroundColor: tabMode === 'ai_matches' ? '#0F1B33' : '#FFFFFF',
              color: tabMode === 'ai_matches' ? '#FFFFFF' : '#0F1B33',
              fontWeight: '800',
              fontSize: '0.82rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            AI matches
          </button>
        </div>

        {/* Search input */}
        <div
          style={{
            flex: '1 1 180px',
            minWidth: '150px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            height: '38px',
          }}
        >
          <span style={{ position: 'absolute', left: '12px', color: '#5A6B87', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
            <IconSearch size={16} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            style={{
              width: '100%',
              height: '38px',
              padding: '0 0.85rem 0 2.25rem',
              border: '1.5px solid #0F1B33',
              borderRadius: '0px',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.86rem',
              outline: 'none',
              backgroundColor: '#FFFFFF',
              boxSizing: 'border-box',
              color: '#0F1B33',
            }}
          />
        </div>

        {/* Dropdowns — compact auto width so all stay on the same line */}
        <select
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
          style={{
            width: 'auto',
            minWidth: '135px',
            flexShrink: 0,
            height: '38px',
            padding: '0 1.25rem 0 0.85rem',
            border: '1.5px solid #0F1B33',
            borderRadius: '0px',
            backgroundColor: '#FFFFFF',
            fontSize: '0.84rem',
            fontWeight: '700',
            color: '#0F1B33',
            cursor: 'pointer',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        >
          <option value="Any">Any specialty</option>
          <option value="Frontend">Frontend</option>
          <option value="Backend">Backend</option>
          <option value="ML">ML</option>
        </select>

        <select
          value={selectedWorkload}
          onChange={(e) => setSelectedWorkload(e.target.value)}
          style={{
            width: 'auto',
            minWidth: '135px',
            flexShrink: 0,
            height: '38px',
            padding: '0 1.25rem 0 0.85rem',
            border: '1.5px solid #0F1B33',
            borderRadius: '0px',
            backgroundColor: '#FFFFFF',
            fontSize: '0.84rem',
            fontWeight: '700',
            color: '#0F1B33',
            cursor: 'pointer',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        >
          <option value="Any">Any workload</option>
          <option value="LOW">Low workload</option>
          <option value="MEDIUM">Medium workload</option>
          <option value="HIGH">High workload</option>
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            width: 'auto',
            minWidth: '135px',
            flexShrink: 0,
            height: '38px',
            padding: '0 1.25rem 0 0.85rem',
            border: '1.5px solid #0F1B33',
            borderRadius: '0px',
            backgroundColor: '#FFFFFF',
            fontSize: '0.84rem',
            fontWeight: '700',
            color: '#0F1B33',
            cursor: 'pointer',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        >
          <option value="Any">Any category</option>
          <option value="Startup">Startup</option>
          <option value="Open Source">Open Source</option>
          <option value="Class Project">Class Project</option>
          <option value="Research">Research</option>
          <option value="Hackathon">Hackathon</option>
        </select>
      </div>

      {/* 5 Project Cards Horizontal/Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
        }}
      >
        {filteredProjects.map((p) => (
          <div
            key={p.id}
            onClick={() => {
              if (onSelectProject) {
                onSelectProject({
                  id: p.id,
                  title: p.title,
                  category: p.category,
                  description: p.description,
                  positions: [{ specialty: p.specialty, headcount: p.openSpots }],
                  skills: p.skills,
                  commitmentLevel: p.workload.toLowerCase(),
                });
              } else if (onOpenApply) {
                onOpenApply(p);
              }
            }}
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #0F1B33',
              padding: '1.25rem 1.15rem',
              boxShadow: '2px 2px 0px #0F1B33',
              position: 'relative',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(-2px, -2px)';
              e.currentTarget.style.boxShadow = '4px 4px 0px #0F1B33';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '2px 2px 0px #0F1B33';
            }}
          >
            {/* Top-left Blue Corner Bracket */}
            <CardCornerBrackets corners={['topLeft']} color="#1F4FE0" size={12} thickness={2.5} />
            <CardCornerBrackets corners={['bottomRight']} color="#1F4FE0" size={12} thickness={2.5} />

            <div>
              {/* Badge & Code */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    border: '1px solid #0F1B33',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    backgroundColor: '#FFFFFF',
                    color: '#0F1B33',
                  }}
                >
                  <span style={{ color: '#F59E0B' }}>◆</span> {p.badge}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#475569', fontWeight: '700' }}>
                  {p.id}
                </span>
              </div>

              {/* Title */}
              <h3 style={{ fontSize: '1rem', fontWeight: '900', color: '#0F1B33', lineHeight: 1.3, margin: '0 0 0.5rem 0' }}>
                {p.title}
              </h3>

              {/* Description */}
              <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0 0 0.85rem 0', lineHeight: 1.4 }}>
                {p.description}
              </p>

              {/* Roles indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: '800', color: '#0F1B33' }}>
                  Roles ({p.rolesFilled}/{p.rolesTotal})
                </span>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {Array.from({ length: p.rolesTotal }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: i < p.rolesFilled ? '#1F4FE0' : '#FFFFFF',
                        border: '1.5px solid #1F4FE0',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Skill pills */}
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
                {p.skills.map((s, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.72rem',
                      padding: '2px 7px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '2px',
                      backgroundColor: '#F8FAFC',
                      color: '#334155',
                      fontWeight: '700',
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Meta */}
              <div style={{ fontSize: '0.74rem', color: '#475569', fontWeight: '700', display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <span>📅 {p.duration}</span>
                <span>📍 {p.location}</span>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '0.65rem',
                borderTop: '1px solid #EEF2F6',
              }}
            >
              <span style={{ fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.04em', color: '#475569' }}>
                {p.workload} • {p.openSpots} OPEN
              </span>
              <div
                style={{
                  width: '32px',
                  height: '28px',
                  backgroundColor: p.scoreColor,
                  color: '#FFFFFF',
                  fontWeight: '900',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)',
                }}
              >
                {p.score}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
