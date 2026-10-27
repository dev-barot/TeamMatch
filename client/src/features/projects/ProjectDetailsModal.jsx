import React, { useState } from 'react';
import { projectApi } from '../../api/projectApi.js';

export function ProjectDetailsModal({
  project,
  currentUser,
  onClose,
  onProjectUpdated,
  onOpenApply,
  onOpenManageApplicants,
  onMessageCreator,
}) {
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
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <div className="modal-sheet" style={{ maxWidth: '720px', padding: '1.75rem', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-lg)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{
                background: project.status === 'open' ? '#ecfdf5' : project.status === 'filled' ? '#fffbeb' : '#f1f5f9',
                color: project.status === 'open' ? '#059669' : project.status === 'filled' ? '#d97706' : '#64748b',
                border: `1px solid ${project.status === 'open' ? '#a7f3d0' : project.status === 'filled' ? '#fde68a' : '#e2e8f0'}`,
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.72rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {project.status}
              </span>
              <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600' }}>
                {project.category}
              </span>
              {project.courseTag && project.courseTag.courseCode && (
                <span style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                }}>
                  📚 {project.courseTag.courseCode} {project.courseTag.term && `(${project.courseTag.term})`}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', lineHeight: 1.25, color: '#0f172a' }}>
              {project.title}
            </h1>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              fontSize: '1.35rem',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            ✕
          </button>
        </div>

        {errorMessage && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            color: '#b91c1c',
            fontSize: '0.85rem',
            fontWeight: '500',
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
          background: '#f8fafc',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #e2e8f0',
          marginBottom: '1.5rem',
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Commitment</span>
            <p style={{ fontSize: '0.95rem', fontWeight: '700', marginTop: '2px', textTransform: 'capitalize', color: '#0f172a' }}>
              {project.commitmentLevel} Workload
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Positions Open</span>
            <p style={{ fontSize: '0.95rem', fontWeight: '700', marginTop: '2px', color: '#059669' }}>
              {project.positions.reduce((acc, p) => acc + (p.headcount - p.filledCount), 0)} seats available
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Posted</span>
            <p style={{ fontSize: '0.95rem', fontWeight: '600', marginTop: '2px', color: '#64748b' }}>
              {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.5rem', color: '#0f172a' }}>About the Project</h3>
          <p style={{ color: '#334155', fontSize: '0.92rem', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
            {project.description}
          </p>
        </div>

        {/* Positions & Capacity (Rule R3) */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>Positions Capacity (Rule R3)</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Strict capacity limits enforced
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
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a' }}>{pos.specialty}</span>
                      {isFull && (
                        <span style={{
                          background: '#fef3c7',
                          color: '#92400e',
                          border: '1px solid #fde68a',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.7rem',
                          fontWeight: '700',
                        }}>
                          FILLED
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                      <strong style={{ color: '#0f172a' }}>{pos.filledCount}</strong> of <strong style={{ color: '#0f172a' }}>{pos.headcount}</strong> filled ({pos.headcount - pos.filledCount} open)
                    </span>
                  </div>

                  {/* Capacity Bar */}
                  <div style={{
                    width: '100%',
                    height: '6px',
                    background: '#e2e8f0',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${percentage}%`,
                      background: isFull ? '#7c3aed' : 'var(--primary)',
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
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.6rem', color: '#0f172a' }}>Required Tech Stack</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {project.requiredSkills.map(skill => (
              <span
                key={skill}
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
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
          borderTop: '1px solid #e2e8f0',
          paddingTop: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          {isCreator ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                👑 You are the <strong>Creator</strong> of this Project (Rule R2).
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => onOpenManageApplicants && onOpenManageApplicants(project)}
                  className="btn-primary"
                  style={{
                    padding: '0.65rem 1.25rem',
                    fontSize: '0.85rem',
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
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#dc2626',
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
              <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                {isClosed ? 'This project is closed.' : 'Ready to collaborate? Apply for an open position (Rule R1).'}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {currentUser && project.creatorId && (
                  <button
                    type="button"
                    onClick={() => onMessageCreator && onMessageCreator({
                      id: project.creatorId,
                      name: 'Project Creator',
                      specialty: 'Creator',
                    })}
                    style={{
                      padding: '0.65rem 1.25rem',
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      color: '#1d4ed8',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    💬 Message Creator
                  </button>
                )}
                {!isClosed && (
                  <button
                    type="button"
                    onClick={() => onOpenApply && onOpenApply(project)}
                    className="btn-primary"
                    style={{
                      padding: '0.65rem 1.5rem',
                      fontSize: '0.85rem',
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
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '600',
                    fontSize: '0.85rem',
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
