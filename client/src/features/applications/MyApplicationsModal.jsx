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
        return { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' };
      case 'Rejected':
        return { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' };
      case 'Withdrawn':
        return { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' };
      default:
        return { bg: '#fffbeb', text: '#b45309', border: '#fde68a' };
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 110 }}>
      <div className="modal-sheet" style={{ padding: '2rem', maxWidth: '720px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>My Applications</h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
              Track applications and project memberships (Rule R1)
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close applications panel"
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              color: '#64748b',
              fontSize: '1rem',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            fontWeight: '500',
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>Loading applications...</p>
        ) : applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>📋</span>
            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>You have not submitted any applications yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {applications.map((app) => {
              const statusStyle = getStatusColor(app.status);
              return (
                <div
                  key={app.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: '700', fontSize: '1rem', color: '#0f172a' }}>Position: {app.specialty}</span>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontWeight: '600',
                        background: statusStyle.bg,
                        color: statusStyle.text,
                        border: `1px solid ${statusStyle.border}`,
                      }}>
                        {app.status === 'Accepted' ? '🎉 Accepted (Member)' : app.status}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem', margin: '0 0 0.25rem 0' }}>
                      Project ID: <code style={{ color: '#2563eb', background: '#eff6ff', padding: '1px 6px', borderRadius: '4px' }}>{app.projectId}</code> · {app.origin === 'invited' ? 'Received Invitation' : 'Applied by You'}
                    </p>

                    {app.notes && (
                      <p style={{ fontSize: '0.85rem', color: '#475569', fontStyle: 'italic', marginTop: '0.35rem', margin: '0.35rem 0 0 0' }}>
                        "{app.notes}"
                      </p>
                    )}

                    {app.rejectionReason && (
                      <p style={{ fontSize: '0.8rem', color: '#b91c1c', marginTop: '0.3rem', margin: '0.3rem 0 0 0' }}>
                        Reason: {app.rejectionReason}
                      </p>
                    )}
                  </div>

                  {(app.status === 'Pending' || app.status === 'Accepted') && (
                    <button
                      onClick={() => handleWithdraw(app.id)}
                      disabled={actionLoading === app.id}
                      style={{
                        padding: '0.45rem 0.95rem',
                        borderRadius: '6px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#b91c1c',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: 'pointer',
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
