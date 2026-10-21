import React, { useState, useEffect, useCallback } from 'react';
import { applicationApi } from '../../api/applicationApi.js';
import { matchingApi } from '../../api/matchingApi.js';
import { MatchScoreBadge } from '../matching/MatchScoreBadge.jsx';

export function ManageApplicantsModal({ project, onClose, onApplicantDecided }) {
  const [activeTab, setActiveTab] = useState('applicants'); // 'applicants' | 'recommendations'
  const [applications, setApplications] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState(null);

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

  const fetchRecommendations = useCallback(async () => {
    if (!project?.id) return;
    setLoading(true);
    try {
      const res = await matchingApi.getMatchedCandidates(project.id);
      setCandidates(res.candidates || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch candidate recommendations.');
    } finally {
      setLoading(false);
    }
  }, [project?.id]);

  useEffect(() => {
    if (activeTab === 'applicants') {
      fetchApplicants();
    } else {
      fetchRecommendations();
    }
  }, [activeTab, fetchApplicants, fetchRecommendations]);

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

  const handleInvite = async (studentId, specialty) => {
    setActionLoading(studentId);
    setError(null);
    setInviteSuccessMsg(null);

    try {
      await applicationApi.invite(project.id, studentId, specialty, 'Invited based on AI matching recommendation.');
      setInviteSuccessMsg('Invitation sent successfully!');
      await fetchRecommendations();
    } catch (err) {
      setError(err.message || 'Failed to invite candidate.');
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

        {/* Tab switch */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('applicants')}
            style={{
              background: 'none',
              border: 'none',
              padding: '6px 14px',
              fontSize: '0.9rem',
              fontWeight: '700',
              color: activeTab === 'applicants' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'applicants' ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            👥 Received Applicants ({applications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('recommendations')}
            style={{
              background: 'none',
              border: 'none',
              padding: '6px 14px',
              fontSize: '0.9rem',
              fontWeight: '700',
              color: activeTab === 'recommendations' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'recommendations' ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            ⚡ AI Recommendations (M4)
          </button>
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

        {inviteSuccessMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#6ee7b7',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontSize: '0.85rem',
          }}>
            {inviteSuccessMsg}
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

        {/* Tab 1: Received Applicants */}
        {activeTab === 'applicants' && (
          loading ? (
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
          )
        )}

        {/* Tab 2: AI Candidate Recommendations (Rule R4) */}
        {activeTab === 'recommendations' && (
          loading ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Computing explainable AI recommendations...</p>
          ) : candidates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>✨</span>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No matching candidates found right now.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {candidates.map(({ student: cand, match }) => (
                <div
                  key={cand.id}
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
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: '800', fontSize: '1.05rem' }}>{cand.name}</span>
                      <MatchScoreBadge match={match} />
                    </div>

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      Specialty: <strong style={{ color: 'var(--text-main)' }}>{cand.profile?.specialty || 'Generalist'}</strong> · Availability: {cand.profile?.weeklyAvailability || 10}h/w · Timezone: {cand.profile?.timezone || 'UTC'}
                    </p>

                    {cand.profile?.skills?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '0.35rem' }}>
                        {cand.profile.skills.map((skill) => (
                          <span
                            key={skill}
                            style={{
                              background: 'rgba(99, 102, 241, 0.1)',
                              border: '1px solid rgba(99, 102, 241, 0.25)',
                              color: 'var(--primary)',
                              padding: '2px 7px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.72rem',
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleInvite(cand.id, cand.profile?.specialty || project.positions[0]?.specialty)}
                    disabled={actionLoading === cand.id}
                    style={{
                      padding: '0.55rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                      color: '#fff',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-glow)',
                    }}
                  >
                    {actionLoading === cand.id ? 'Inviting...' : 'Invite to Team →'}
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
