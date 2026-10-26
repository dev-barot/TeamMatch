import React, { useState, useEffect } from 'react';
import { applicationApi } from '../../api/applicationApi.js';
import { LoadingSpinner, ErrorBanner, EmptyState } from '../../components/ui/States.jsx';

export function MyApplicationsModal({ onClose, onApplicationWithdrawn }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await applicationApi.getMyApplications();
      setApplications(res.applications || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw this application or leave this team?')) {
      return;
    }

    setActionLoading(applicationId);
    try {
      await applicationApi.withdrawApplication(applicationId);
      await fetchApplications();
      if (onApplicationWithdrawn) onApplicationWithdrawn();
    } catch (err) {
      alert(err.message || 'Failed to withdraw application.');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: 'var(--success)', border: 'rgba(16, 185, 129, 0.3)' };
      case 'Rejected':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: 'var(--danger)', border: 'rgba(239, 68, 68, 0.3)' };
      case 'Withdrawn':
        return { bg: 'rgba(148, 163, 184, 0.15)', text: 'var(--text-muted)', border: 'rgba(148, 163, 184, 0.3)' };
      default:
        return { bg: 'rgba(245, 158, 11, 0.15)', text: 'var(--warning)', border: 'rgba(245, 158, 11, 0.3)' };
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 110 }}>
      <div className="modal-sheet" style={{ padding: '1.75rem', maxWidth: '680px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800' }}>My Applications</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Track applications and project memberships (Rule R1)
            </p>
          </div>
          <button onClick={onClose} aria-label="Close applications panel" style={{ color: 'var(--text-muted)', fontSize: '1.25rem', minHeight: '44px', minWidth: '44px' }}>✕</button>
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

        {loading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading applications...</p>
        ) : applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>📋</span>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>You have not submitted any applications yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {applications.map((app) => {
              const statusStyle = getStatusColor(app.status);
              return (
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
                        background: statusStyle.bg,
                        color: statusStyle.text,
                        border: `1px solid ${statusStyle.border}`,
                      }}>
                        {app.status === 'Accepted' ? '🎉 Accepted (Member)' : app.status}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
                      Project ID: <code style={{ color: 'var(--primary)' }}>{app.projectId}</code> · {app.origin === 'invited' ? 'Received Invitation' : 'Applied by You'}
                    </p>

                    {app.notes && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.4rem' }}>
                        "{app.notes}"
                      </p>
                    )}

                    {app.rejectionReason && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '0.3rem' }}>
                        Reason: {app.rejectionReason}
                      </p>
                    )}
                  </div>

                  {(app.status === 'Pending' || app.status === 'Accepted') && (
                    <button
                      onClick={() => handleWithdraw(app.id)}
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
                      {actionLoading === app.id ? 'Withdrawing...' : app.status === 'Accepted' ? 'Leave Team' : 'Withdraw Application'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
