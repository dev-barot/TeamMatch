import React, { useState, useEffect, useMemo } from 'react';
import { CircularGauge, GeometricAccents, CardCornerBrackets } from './ArchitecturalGraphics.jsx';
import { IconSearch } from '../../components/ui/Icons.jsx';
import { projectApi } from '../../api/projectApi.js';
import { matchingApi } from '../../api/matchingApi.js';

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
  const [projects, setProjects] = useState([]);
  const [matchedProjects, setMatchedProjects] = useState([]);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function loadProjects() {
      setLoading(true);
      try {
        const [browseRes, matchRes] = await Promise.allSettled([
          projectApi.browseProjects({ limit: 100 }),
          matchingApi.getMatchedProjects(20),
        ]);

        if (ignore) return;

        if (browseRes.status === 'fulfilled' && browseRes.value?.projects) {
          setProjects(browseRes.value.projects);
        }

        if (matchRes.status === 'fulfilled' && matchRes.value?.matches) {
          setMatchedProjects(matchRes.value.matches);
        }
      } catch {
        // empty state fallback
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadProjects();
    return () => {
      ignore = true;
    };
  }, []);

  const filteredProjects = useMemo(() => {
    const source = tabMode === 'ai_matches'
      ? matchedProjects.map((m) => ({
          ...m.project,
          score: m.match?.score ?? m.score ?? 50,
          reasons: m.match?.reasons ?? [],
        }))
      : projects;

    return source.filter((p) => {
      if (tabMode === 'ai_matches' && (p.score ?? 0) < 40) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (p.title || '').toLowerCase().includes(q);
        const matchesDesc = (p.description || '').toLowerCase().includes(q);
        const pSkills = Array.isArray(p.requiredSkills) ? p.requiredSkills : Array.isArray(p.skills) ? p.skills : [];
        const matchesSkills = pSkills.some((s) => typeof s === 'string' && s.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesSkills) return false;
      }
      if (selectedCategory !== 'Any' && p.category !== selectedCategory) return false;
      return true;
    });
  }, [tabMode, projects, matchedProjects, searchQuery, selectedCategory]);

  const bestMatch = matchedProjects.length > 0 ? matchedProjects[0] : null;

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

      {/* Dynamic Best Match Hero Banner — only shown when real recommendation exists */}
      {bestMatch && (
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
                {bestMatch.project?.id ? String(bestMatch.project.id).slice(-6).toUpperCase() : 'MATCH'}
              </span>
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#0F1B33', margin: '0 0 0.85rem 0', letterSpacing: '-0.01em' }}>
              {bestMatch.project?.title || 'Matched Project'}
            </h2>

            {/* Reason chips */}
            {Array.isArray(bestMatch.match?.reasons) && (
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {bestMatch.match.reasons.slice(0, 3).map((r, idx) => (
                  <span
                    key={idx}
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
                    {typeof r === 'string' ? r : r.reason}
                  </span>
                ))}
              </div>
            )}

            {/* Meta line */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.82rem', fontWeight: '700', color: '#475569' }}>
              <span>Category: {bestMatch.project?.category || 'General'}</span>
              <span>Commitment: {bestMatch.project?.commitmentLevel || 'Flexible'}</span>
            </div>
          </div>

          {/* Right Gauge */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, padding: '0.5rem 1.5rem' }}>
            <CircularGauge percentage={bestMatch.match?.score || 85} size={100} strokeWidth={10} color="#1F4FE0" />
          </div>
        </div>
      )}

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
        {filteredProjects.length === 0 ? (
        <div
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
            border: '1.5px dashed #CBD5E1',
            color: '#64748B',
          }}
        >
          <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F1B33', marginBottom: '8px' }}>
            No projects found
          </h3>
          <p style={{ fontSize: '0.88rem', margin: '0 auto 1.25rem', maxWidth: '420px', lineHeight: 1.5 }}>
            Be the first to post a semester project, hackathon team, or research idea on campus!
          </p>
          <button
            onClick={onOpenCreateProject}
            type="button"
            style={{
              padding: '0.65rem 1.4rem',
              backgroundColor: '#1F4FE0',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: '800',
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '2px 2px 0px #0F1B33',
            }}
          >
            Post a project
          </button>
        </div>
      ) : (
        filteredProjects.map((p) => (
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
                  <span style={{ color: '#F59E0B' }}>◆</span> {p.badge || p.category || 'General'}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#475569', fontWeight: '700' }}>
                  {p.id ? String(p.id).slice(-6).toUpperCase() : 'PROJECT'}
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
              {(() => {
                const totalRoles = (p.positions || []).reduce((acc, pos) => acc + (pos.headcount || 1), p.rolesTotal || 1);
                const filledRoles = (p.positions || []).reduce((acc, pos) => acc + (pos.filledCount || 0), p.rolesFilled || 0);
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.85rem' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: '800', color: '#0F1B33' }}>
                      Roles ({filledRoles}/{totalRoles})
                    </span>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {Array.from({ length: Math.min(8, totalRoles) }).map((_, i) => (
                        <div
                          key={i}
                          style={{
                            width: '10px',
                            height: '10px',
                            backgroundColor: i < filledRoles ? '#1F4FE0' : '#FFFFFF',
                            border: '1.5px solid #1F4FE0',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Skill pills */}
              {(() => {
                const pSkills = Array.isArray(p.requiredSkills) ? p.requiredSkills : Array.isArray(p.skills) ? p.skills : [];
                return (
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
                    {pSkills.map((s, idx) => (
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
                );
              })()}

              {/* Meta */}
              <div style={{ fontSize: '0.74rem', color: '#475569', fontWeight: '700', display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <span>📅 {p.duration || p.timeline || 'Semester'}</span>
                <span>📍 {p.location || 'Campus / Remote'}</span>
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
                {p.workload || (p.commitmentLevel ? p.commitmentLevel.toUpperCase() : 'MEDIUM')} • {p.openSpots || (p.positions ? p.positions.length : 1)} OPEN
              </span>
              <div
                style={{
                  width: '32px',
                  height: '28px',
                  backgroundColor: p.scoreColor || '#1F4FE0',
                  color: '#FFFFFF',
                  fontWeight: '900',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)',
                }}
              >
                {p.score || 50}
              </div>
            </div>
          </div>
        )))}
      </div>
    </div>
  );
}
