import React, { useState, useEffect, useCallback } from 'react';
import { projectApi } from '../../api/projectApi.js';

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

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedCommitment, setSelectedCommitment] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const params = {
        query: searchQuery.trim(),
        specialty: selectedSpecialty !== 'All' ? selectedSpecialty : '',
        commitment: selectedCommitment !== 'All' ? selectedCommitment : '',
        category: selectedCategory !== 'All' ? selectedCategory : '',
      };
      const res = await projectApi.browseProjects(params);
      setProjects(res.projects || []);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedSpecialty, selectedCommitment, selectedCategory]);

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
              Discover open team seats by skill, specialty, and commitment level (M2)
            </p>
          </div>

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

        {/* Search input */}
        <div style={{ marginBottom: '1.25rem' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title, description, or tech stack (e.g. React, Node, AI)..."
            style={{
              width: '100%',
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-main)',
              fontSize: '0.95rem',
            }}
          />
        </div>

        {/* Filter Chips: Specialties */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', marginRight: '4px' }}>
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
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  border: active ? '1px solid var(--primary)' : '1px solid var(--border)',
                  background: active ? 'rgba(99, 102, 241, 0.25)' : 'var(--bg-surface)',
                  color: active ? '#fff' : 'var(--text-muted)',
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
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Commitment:</span>
            <select
              value={selectedCommitment}
              onChange={(e) => setSelectedCommitment(e.target.value)}
              style={{
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-main)',
                fontSize: '0.8rem',
              }}
            >
              {COMMITMENTS.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Commitments' : `${c.toUpperCase()} workload`}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-main)',
                fontSize: '0.8rem',
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

      {/* Error message */}
      {errorMessage && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          color: '#f87171',
          fontSize: '0.9rem',
        }}>
          {errorMessage}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>Searching projects...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && projects.length === 0 && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px dashed var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '4rem 2rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>No projects found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
            Try adjusting your search keywords, clearing specialty filters, or be the first to post a new project!
          </p>
          <button
            onClick={onOpenCreateProject}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: '#fff',
              fontWeight: '700',
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Post a Project
          </button>
        </div>
      )}

      {/* Projects Grid */}
      {!loading && projects.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}>
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
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div>
                  {/* Top Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        color: 'var(--primary)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                      }}>
                        {project.category}
                      </span>
                      {project.courseTag?.courseCode && (
                        <span style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text-muted)',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.7rem',
                        }}>
                          {project.courseTag.courseCode}
                        </span>
                      )}
                    </div>

                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: project.status === 'open' ? '#4ade80' : '#facc15',
                      textTransform: 'uppercase',
                    }}>
                      ● {openSeats} seats open
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                    {project.title}
                  </h3>
                  <p style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                    marginBottom: '1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {project.description}
                  </p>

                  {/* Positions Chips */}
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>
                      Open Positions
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {project.positions.map((pos) => (
                        <span
                          key={pos.id || pos.specialty}
                          style={{
                            background: pos.filledCount >= pos.headcount ? 'rgba(234, 179, 8, 0.15)' : 'var(--bg-surface)',
                            border: '1px solid var(--border)',
                            color: pos.filledCount >= pos.headcount ? '#facc15' : 'var(--text-main)',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                          }}
                        >
                          {pos.specialty} ({pos.filledCount}/{pos.headcount})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  {project.requiredSkills?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '1rem' }}>
                      {project.requiredSkills.slice(0, 4).map(skill => (
                        <span
                          key={skill}
                          style={{
                            background: 'rgba(99, 102, 241, 0.08)',
                            color: 'var(--primary)',
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.72rem',
                            fontWeight: '500',
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                      {project.requiredSkills.length > 4 && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', alignSelf: 'center' }}>
                          +{project.requiredSkills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div style={{
                  borderTop: '1px solid var(--border)',
                  paddingTop: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>
                    {project.commitmentLevel} commitment
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isCreator ? (
                      <span style={{ fontSize: '0.7rem', color: 'var(--secondary)', fontWeight: '700' }}>
                        👑 Creator (R2)
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
                            padding: '3px 8px',
                            background: 'rgba(99, 102, 241, 0.15)',
                            border: '1px solid rgba(99, 102, 241, 0.35)',
                            color: 'var(--primary)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          Apply
                        </button>
                      )
                    )}
                    <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '700' }}>
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
