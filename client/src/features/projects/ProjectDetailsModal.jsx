import React, { useState } from 'react';
import { projectApi } from '../../api/projectApi.js';

export function ProjectDetailsModal({ project, currentUser, onClose, onProjectUpdated, onOpenApply, onOpenManageApplicants }) {
  const [closing, setClosing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!project) return null;

  const isCreator = currentUser && project.creatorId === currentUser.id;
  const isClosed = project.status === 'closed';

  const handleCloseProject = async () => {
    if (!window.confirm('Are you sure you want to close this project? This action is terminal (R3).')) {
      return;
    }

    setClosing(true);
    setErrorMessage('');
    try {
      const updated = await projectApi.closeProject(project.id);
      onProjectUpdated(updated);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to close project.');
    } finally {
      setClosing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 7, 15, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1.5rem',
      overflowY: 'auto',
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '720px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-glow)',
        padding: '2.5rem',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{
                background: project.status === 'open' ? 'rgba(34, 197, 94, 0.15)' : project.status === 'filled' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                color: project.status === 'open' ? '#4ade80' : project.status === 'filled' ? '#facc15' : '#94a3b8',
                border: `1px solid ${project.status === 'open' ? 'rgba(34, 197, 94, 0.3)' : project.status === 'filled' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(148, 163, 184, 0.3)'}`,
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {project.status}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {project.category}
              </span>
              {project.courseTag && project.courseTag.courseCode && (
                <span style={{
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  color: 'var(--primary)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                }}>
                  📚 {project.courseTag.courseCode} {project.courseTag.term && `(${project.courseTag.term})`}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', lineHeight: 1.25 }}>
              {project.title}
            </h1>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '1.4rem',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {errorMessage && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem',
            color: '#f87171',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
          }}>
            {errorMessage}
          </div>
        )}

        {/* Commitment & Meta Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          padding: '1rem',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          marginBottom: '1.5rem',
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Commitment</span>
            <p style={{ fontSize: '0.95rem', fontWeight: '700', marginTop: '2px', textTransform: 'capitalize' }}>
              {project.commitmentLevel} Workload
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Positions Open</span>
            <p style={{ fontSize: '0.95rem', fontWeight: '700', marginTop: '2px' }}>
              {project.positions.reduce((acc, p) => acc + (p.headcount - p.filledCount), 0)} seats available
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Posted</span>
            <p style={{ fontSize: '0.95rem', fontWeight: '600', marginTop: '2px', color: 'var(--text-dim)' }}>
              {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.5rem' }}>About the Project</h3>
          <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
            {project.description}
          </p>
        </div>

        {/* Positions & Capacity (Rule R3) */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Positions Capacity (Rule R3)</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Positions never overfill
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {project.positions.map((pos) => {
              const percentage = Math.min(100, Math.round((pos.filledCount / pos.headcount) * 100));
              const isFull = pos.filledCount >= pos.headcount;

              return (
                <div
                  key={pos.id || pos.specialty}
                  style={{
                    padding: '1rem 1.25rem',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{pos.specialty}</span>
                      {isFull && (
                        <span style={{
                          background: 'rgba(234, 179, 8, 0.2)',
                          color: '#facc15',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.7rem',
                          fontWeight: '700',
                        }}>
                          FILLED
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <strong>{pos.filledCount}</strong> of <strong>{pos.headcount}</strong> filled ({pos.headcount - pos.filledCount} open)
                    </span>
                  </div>

                  {/* Capacity Bar */}
                  <div style={{
                    width: '100%',
                    height: '6px',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${percentage}%`,
                      background: isFull ? 'linear-gradient(90deg, #eab308, #ca8a04)' : 'linear-gradient(90deg, var(--primary), var(--secondary))',
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Required Skills */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.6rem' }}>Required Tech Stack</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {project.requiredSkills.map(skill => (
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
            ))}
          </div>
        </div>

        {/* Creator Actions vs Student Application info */}
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          {isCreator ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                👑 You are the <strong>Creator</strong> of this Project (Rule R2).
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => onOpenManageApplicants && onOpenManageApplicants(project)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    color: '#fff',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-glow)',
                  }}
                >
                  👥 Manage Applicants
                </button>
                {!isClosed && (
                  <button
                    type="button"
                    onClick={handleCloseProject}
                    disabled={closing}
                    style={{
                      padding: '0.65rem 1.25rem',
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      color: '#f87171',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      cursor: closing ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {closing ? 'Closing...' : 'Close Project (R2/R3)'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {isClosed ? 'This project is closed.' : 'Ready to collaborate? Apply for an open position (Rule R1).'}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {!isClosed && (
                  <button
                    type="button"
                    onClick={() => onOpenApply && onOpenApply(project)}
                    style={{
                      padding: '0.65rem 1.5rem',
                      background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                      color: '#fff',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-glow)',
                    }}
                  >
                    Apply Now →
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '0.65rem 1.5rem',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Close View
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
