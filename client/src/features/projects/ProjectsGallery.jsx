import React, { useState, useEffect, useCallback } from 'react';
import { projectApi } from '../../api/projectApi.js';
import { matchingApi } from '../../api/matchingApi.js';
import { MatchScoreBadge } from '../matching/MatchScoreBadge.jsx';
import { LoadingSpinner, EmptyState, ErrorBanner } from '../../components/ui/States.jsx';

const SPECIALTIES = ['All', 'Frontend', 'Backend', 'ML', 'DevOps', 'UI/UX', 'Other'];
const COMMITMENTS = ['All', 'low', 'medium', 'high'];

export function ProjectsGallery({
  currentUser,
  onOpenCreateProject,
  onSelectProject,
  onOpenApply,
  refreshTrigger = 0,
}) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'recommended'

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedCommitment, setSelectedCommitment] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      if (viewMode === 'recommended' && currentUser) {
        const res = await matchingApi.getMatchedProjects(20);
        // Normalize matched structure
        const normalized = (res.matches || []).map(m => ({
          ...m.project,
          match: m.match,
        }));
        setProjects(normalized);
      } else {
        const params = {
          query: searchQuery.trim(),
          specialty: selectedSpecialty !== 'All' ? selectedSpecialty : '',
          commitment: selectedCommitment !== 'All' ? selectedCommitment : '',
          category: selectedCategory !== 'All' ? selectedCategory : '',
        };
        const res = await projectApi.browseProjects(params);
        setProjects(res.projects || []);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, [viewMode, currentUser, searchQuery, selectedSpecialty, selectedCommitment, selectedCategory]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProjects();
    }, 250);
    return () => clearTimeout(handler);
  }, [fetchProjects, refreshTrigger]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header & Controls Bar */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem',
        boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
              Explore Projects & Positions
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Discover open team seats by skill, specialty, and commitment level with explainable AI matching (M4)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {currentUser && (
              <div style={{
                display: 'inline-flex',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                padding: '3px',
                border: '1px solid var(--border)',
              }}>
                <button
                  type="button"
                  onClick={() => setViewMode('all')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: viewMode === 'all' ? 'var(--primary)' : 'transparent',
                    color: viewMode === 'all' ? '#fff' : 'var(--text-muted)',
                    fontWeight: '700',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  All Projects
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('recommended')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: viewMode === 'recommended' ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'transparent',
                    color: viewMode === 'recommended' ? '#fff' : 'var(--text-muted)',
                    fontWeight: '700',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  ⚡ AI Matches (R4)
                </button>
              </div>
            )}

            <button
              onClick={onOpenCreateProject}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                color: '#fff',
                fontWeight: '700',
                fontSize: '0.9rem',
                boxShadow: 'var(--shadow-glow)',
                cursor: 'pointer',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>+</span> Post a Project
            </button>
          </div>
        </div>

        {/* Search input */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label htmlFor="projects-search" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>Search projects</label>
          <input
            id="projects-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title, description, or tech stack (e.g. React, Python, AI, Docker)..."
            aria-label="Search projects"
            style={{
              width: '100%',
              padding: '0.9rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: 'var(--text-main)',
              fontSize: '0.95rem',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
              outline: 'none',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#cbd5e1';
              e.target.style.boxShadow = '0 1px 2px rgba(15, 23, 42, 0.05)';
            }}
          />
        </div>

        {/* Filter Chips: Specialties */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '6px' }}>
            Specialty:
          </span>
          {SPECIALTIES.map((spec) => {
            const active = selectedSpecialty === spec;
            return (
              <button
                key={spec}
                type="button"
                onClick={() => setSelectedSpecialty(spec)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: active ? '700' : '600',
                  cursor: 'pointer',
                  border: active ? '1px solid #2563eb' : '1px solid #e2e8f0',
                  background: active ? '#2563eb' : '#ffffff',
                  color: active ? '#ffffff' : '#475569',
                  boxShadow: active ? '0 2px 4px rgba(37, 99, 235, 0.2)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {spec}
              </button>
            );
          })}
        </div>

        {/* Secondary Filters: Commitment & Category */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Commitment:</span>
            <select
              value={selectedCommitment}
              onChange={(e) => setSelectedCommitment(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontSize: '0.82rem',
                fontWeight: '500',
              }}
            >
              {COMMITMENTS.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Commitments' : `${c.toUpperCase()} workload`}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontSize: '0.82rem',
                fontWeight: '500',
              }}
            >
              <option value="All">All Categories</option>
              <option value="Class Project">Class Project</option>
              <option value="Hackathon">Hackathon</option>
              <option value="Startup">Startup</option>
              <option value="Research">Research</option>
              <option value="Open Source">Open Source</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error state */}
      {errorMessage && (
        <ErrorBanner message={errorMessage} onRetry={fetchProjects} />
      )}

      {/* Loading state */}
      {loading && <LoadingSpinner label="Searching projects…" />}

      {/* Empty State */}
      {!loading && projects.length === 0 && !errorMessage && (
        <EmptyState
          icon="🔍"
          title="No projects found"
          message="Try adjusting your search, clearing specialty filters, or be the first to post a project!"
          action={
            <button
              onClick={onOpenCreateProject}
              className="btn-primary"
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '0.9rem',
                minHeight: '44px',
              }}
            >Post a Project</button>
          }
        />
      )}

      {/* Projects Grid — responsive via CSS class (1col mobile → 2col tablet → 3col desktop) */}
      {!loading && projects.length > 0 && (
        <div className="grid-responsive">
          {projects.map((project) => {
            const totalHeadcount = project.positions.reduce((acc, p) => acc + p.headcount, 0);
            const totalFilled = project.positions.reduce((acc, p) => acc + p.filledCount, 0);
            const openSeats = totalHeadcount - totalFilled;
            const isCreator = currentUser && project.creatorId === currentUser.id;

            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = '#93c5fd';
                  e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(15, 23, 42, 0.05)';
                }}
              >
                <div>
                  {/* Top Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        border: '1px solid #dbeafe',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        letterSpacing: '0.3px',
                      }}>
                        {project.category}
                      </span>
                      {project.match && (
                        <MatchScoreBadge match={project.match} compact={true} />
                      )}
                      {project.courseTag?.courseCode && (
                        <span style={{
                          background: '#f1f5f9',
                          color: '#475569',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.7rem',
                          fontFamily: 'var(--font-mono)',
                          border: '1px solid #e2e8f0',
                          fontWeight: '600',
                        }}>
                          {project.courseTag.courseCode}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        width: '7px', height: '7px', borderRadius: '50%',
                        background: openSeats > 0 ? '#059669' : '#7c3aed',
                      }} />
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: openSeats > 0 ? '#059669' : '#7c3aed',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                      }}>
                        {openSeats > 0 ? `${openSeats} open` : 'Filled'}
                      </span>
                    </div>
                  </div>

                  {/* Capacity Meter Bar */}
                  <div style={{
                    width: '100%',
                    height: '5px',
                    background: '#f1f5f9',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                    marginBottom: '1rem',
                  }}>
                    <div style={{
                      width: `${totalHeadcount > 0 ? Math.min(100, Math.round((totalFilled / totalHeadcount) * 100)) : 0}%`,
                      height: '100%',
                      background: totalFilled >= totalHeadcount ? '#7c3aed' : (openSeats === 1 ? '#d97706' : '#2563eb'),
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>

                  {/* Title & Description */}
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem', lineHeight: 1.35, color: '#0f172a' }}>
                    {project.title}
                  </h3>
                  <p style={{
                    color: '#475569',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    marginBottom: '1.25rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {project.description}
                  </p>

                  {/* Positions Chips */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '6px', fontWeight: '700' }}>
                      Required Positions
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {project.positions.map((pos) => {
                        const isFull = pos.filledCount >= pos.headcount;
                        return (
                          <span
                            key={pos.id || pos.specialty}
                            style={{
                              background: isFull ? '#fef3c7' : '#f8fafc',
                              border: `1px solid ${isFull ? '#fde68a' : '#e2e8f0'}`,
                              color: isFull ? '#92400e' : '#1e293b',
                              padding: '3px 10px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.76rem',
                              fontWeight: '600',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>{pos.specialty}</span>
                            <span style={{ color: isFull ? '#b45309' : '#64748b', fontSize: '0.7rem' }}>
                              ({pos.filledCount}/{pos.headcount})
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Skills */}
                  {project.requiredSkills?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.25rem' }}>
                      {project.requiredSkills.slice(0, 4).map(skill => (
                        <span
                          key={skill}
                          style={{
                            background: '#eff6ff',
                            border: '1px solid #dbeafe',
                            color: '#1d4ed8',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.74rem',
                            fontWeight: '600',
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                      {project.requiredSkills.length > 4 && (
                        <span style={{ fontSize: '0.74rem', color: '#64748b', alignSelf: 'center' }}>
                          +{project.requiredSkills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div style={{
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '0.9rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: project.commitmentLevel === 'high' ? '#dc2626' : (project.commitmentLevel === 'medium' ? '#d97706' : '#059669'),
                    }} />
                    <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'capitalize', fontWeight: '600' }}>
                      {project.commitmentLevel} workload
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isCreator ? (
                      <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: '700' }}>
                        👑 Your Project
                      </span>
                    ) : (
                      currentUser && openSeats > 0 && project.status === 'open' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onOpenApply) onOpenApply(project);
                          }}
                          style={{
                            padding: '4px 10px',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            color: '#1d4ed8',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.78rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          Quick Apply
                        </button>
                      )
                    )}
                    <span style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: '700' }}>
                      View Details →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
