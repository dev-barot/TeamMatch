import React, { useState, useEffect, useCallback } from 'react';
import { applicationApi } from '../../api/applicationApi.js';

export function ManageApplicantsModal({ project, onClose, onApplicantDecided }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchApplicants = useCallback(async () => {
    if (!project?.id) return;
    setLoading(true);
    try {
      const res = await applicationApi.getProjectApplications(project.id);
      setApplications(res.applications || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch applicants.');
    } finally {
      setLoading(false);
    }
  }, [project?.id]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const handleDecision = async (applicationId, decision) => {
    setActionLoading(applicationId);
    setError(null);

    try {
      await applicationApi.decideApplication(applicationId, decision);
      await fetchApplicants();
      if (onApplicantDecided) onApplicantDecided();
    } catch (err) {
      setError(err.message || `Failed to ${decision} application.`);
    } finally {
      setActionLoading(null);
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
      zIndex: 110,
      padding: '1.5rem',
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '720px',
        maxHeight: '85vh',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-lg)',
        padding: '2rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800' }}>Manage Applicants</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Project: <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{project?.title}</span> (Rule R2 Creator Access)
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>✕</button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontSize: '0.85rem',
          }}>
            {error}
          </div>
        )}

        {/* Positions Fill Overview */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {project?.positions?.map((pos) => (
            <span
              key={pos.specialty}
              style={{
                fontSize: '0.8rem',
                padding: '4px 10px',
                borderRadius: 'var(--radius-md)',
                background: pos.remaining === 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                color: pos.remaining === 0 ? 'var(--danger)' : 'var(--primary)',
                border: `1px solid ${pos.remaining === 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
                fontWeight: '600',
              }}
            >
              {pos.specialty}: {pos.filledCount}/{pos.headcount} {pos.remaining === 0 ? '(Filled - R3)' : `(${pos.remaining} seat left)`}
            </span>
          ))}
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading applicants...</p>
        ) : applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>👥</span>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No applicants have applied to this project yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {applications.map((app) => (
              <div
                key={app.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                    <span style={{ fontWeight: '700', fontSize: '1rem' }}>Position: {app.specialty}</span>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: '600',
                      background: app.status === 'Accepted' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: app.status === 'Accepted' ? 'var(--success)' : 'var(--warning)',
                    }}>
                      {app.status === 'Accepted' ? 'Accepted Member' : app.status}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    Student ID: <code style={{ color: 'var(--primary)' }}>{app.studentId}</code>
                  </p>

                  {app.notes && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem', fontStyle: 'italic' }}>
                      "{app.notes}"
                    </p>
                  )}
                </div>

                {app.status === 'Pending' && (
                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <button
                      onClick={() => handleDecision(app.id, 'reject')}
                      disabled={actionLoading === app.id}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                      }}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleDecision(app.id, 'accept')}
                      disabled={actionLoading === app.id}
                      style={{
                        padding: '0.5rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'linear-gradient(135deg, var(--success), #059669)',
                        color: '#fff',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                      }}
                    >
                      Accept Member (R3)
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
