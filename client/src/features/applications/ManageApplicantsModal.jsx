import React, { useState, useEffect, useCallback } from 'react';
import { applicationApi } from '../../api/applicationApi.js';
import { matchingApi } from '../../api/matchingApi.js';
import { MatchScoreBadge } from '../matching/MatchScoreBadge.jsx';
import { IconClose, IconUsers, IconSpark, IconMessages, IconCheck, IconEmptyDraft } from '../../components/ui/Icons.jsx';

export function ManageApplicantsModal({ project, onClose, onApplicantDecided, onMessageApplicant }) {
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
    <div className="modal-overlay" style={{ zIndex: 110 }}>
      <div className="modal-sheet" style={{ maxWidth: '780px', padding: '2rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>Manage Applicants</h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
              Project: <span style={{ color: '#0f172a', fontWeight: '600' }}>{project?.title}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close applicants panel"
            style={{
              background: '#f8fafc',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--ink-muted)',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconClose size={18} />
          </button>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', borderBottom: '2px solid var(--border-structural)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('applicants')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: activeTab === 'applicants' ? '#ffffff' : 'transparent',
              border: '1.5px solid',
              borderColor: activeTab === 'applicants' ? 'var(--border-structural)' : 'transparent',
              borderBottom: activeTab === 'applicants' ? '2px solid #ffffff' : 'none',
              borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
              padding: '8px 14px',
              fontSize: '0.88rem',
              fontWeight: '800',
              color: activeTab === 'applicants' ? 'var(--primary)' : 'var(--ink-muted)',
              cursor: 'pointer',
              marginBottom: '-2px',
            }}
          >
            <IconUsers size={16} />
            <span>Received Applicants ({applications.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('recommendations')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: activeTab === 'recommendations' ? '#ffffff' : 'transparent',
              border: '1.5px solid',
              borderColor: activeTab === 'recommendations' ? 'var(--border-structural)' : 'transparent',
              borderBottom: activeTab === 'recommendations' ? '2px solid #ffffff' : 'none',
              borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
              padding: '8px 14px',
              fontSize: '0.88rem',
              fontWeight: '800',
              color: activeTab === 'recommendations' ? 'var(--primary)' : 'var(--ink-muted)',
              cursor: 'pointer',
              marginBottom: '-2px',
            }}
          >
            <IconSpark size={15} />
            <span>AI Recommendations</span>
          </button>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.85rem',
            fontWeight: '500',
          }}>
            {error}
          </div>
        )}

        {inviteSuccessMsg && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#059669',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.85rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <IconCheck size={14} color="#059669" />
            <span>{inviteSuccessMsg}</span>
          </div>
        )}

        {/* Positions Fill Overview */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {project?.positions?.map((pos) => (
            <span
              key={pos.specialty}
              className="geo-tag"
              style={{
                background: pos.remaining === 0 ? '#fef2f2' : '#eff6ff',
                color: pos.remaining === 0 ? '#b91c1c' : '#1d4ed8',
                borderColor: pos.remaining === 0 ? '#fecaca' : '#bfdbfe',
              }}
            >
              {pos.specialty}: {pos.filledCount}/{pos.headcount} {pos.remaining === 0 ? '(Filled)' : `(${pos.remaining} remaining)`}
            </span>
          ))}
        </div>

        {/* Tab 1: Received Applicants */}
        {activeTab === 'applicants' && (
          loading ? (
            <p style={{ color: 'var(--ink-muted)', textAlign: 'center', padding: '2rem' }}>Loading applicants...</p>
          ) : applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1.5px dashed var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                <IconEmptyDraft size={44} color="#94a3b8" />
              </div>
              <p style={{ color: 'var(--ink-muted)', fontSize: '0.95rem', margin: 0 }}>No applicants have applied to this project yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {applications.map((app) => (
                <div
                  key={app.id}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    boxShadow: 'var(--shadow-geo-sm)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--ink)' }}>Position: {app.specialty}</span>
                      <span className="geo-tag" style={{
                        background: app.status === 'Accepted' ? '#ecfdf5' : '#fffbeb',
                        color: app.status === 'Accepted' ? '#059669' : '#b45309',
                        borderColor: app.status === 'Accepted' ? '#a7f3d0' : '#fde68a',
                      }}>
                        {app.status === 'Accepted' ? 'Accepted Member' : app.status}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', margin: '0.2rem 0' }}>
                      Student ID: <code style={{ color: 'var(--primary)', background: '#eff6ff', padding: '1px 6px', borderRadius: '2px', fontFamily: 'var(--font-mono)' }}>{app.studentId}</code>
                    </p>

                    {app.notes && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginTop: '0.35rem', fontStyle: 'italic', margin: '0.35rem 0 0 0' }}>
                        "{app.notes}"
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    {onMessageApplicant && (
                      <button
                        type="button"
                        onClick={() => onMessageApplicant({
                          id: app.studentId,
                          name: 'Applicant',
                          specialty: app.specialty,
                        })}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '0.45rem 0.85rem',
                          borderRadius: 'var(--radius-sm)',
                          background: '#ffffff',
                          border: '1px solid var(--border)',
                          color: 'var(--primary)',
                          fontSize: '0.85rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        <IconMessages size={14} />
                        <span>Message</span>
                      </button>
                    )}

                    {app.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleDecision(app.id, 'reject')}
                          disabled={actionLoading === app.id}
                          style={{
                            padding: '0.45rem 0.9rem',
                            borderRadius: '6px',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#b91c1c',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                          }}
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleDecision(app.id, 'accept')}
                          disabled={actionLoading === app.id}
                          style={{
                            padding: '0.45rem 1.1rem',
                            borderRadius: '6px',
                            background: '#059669',
                            border: 'none',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                          }}
                        >
                          Accept Member
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Tab 2: AI Candidate Recommendations */}
        {activeTab === 'recommendations' && (
          loading ? (
            <p style={{ color: 'var(--ink-muted)', textAlign: 'center', padding: '2rem' }}>Computing explainable AI recommendations...</p>
          ) : candidates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1.5px dashed var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                <IconEmptyDraft size={44} color="#94a3b8" />
              </div>
              <p style={{ color: 'var(--ink-muted)', fontSize: '0.95rem', margin: 0 }}>No matching candidates found right now.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {candidates.map(({ student: cand, match }) => (
                <div
                  key={cand.id}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    boxShadow: 'var(--shadow-geo-sm)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--ink)' }}>{cand.name}</span>
                      <MatchScoreBadge match={match} />
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: '0.4rem', margin: '0 0 0.4rem 0' }}>
                      Specialty: <strong style={{ color: 'var(--ink)' }}>{cand.profile?.specialty || 'Generalist'}</strong> · Availability: {cand.profile?.weeklyAvailability || 10}h/w · Timezone: {cand.profile?.timezone || 'UTC'}
                    </p>

                    {cand.profile?.skills?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '0.35rem' }}>
                        {cand.profile.skills.map((skill) => (
                          <span
                            key={skill}
                            className="geo-tag"
                            style={{
                              background: '#eff6ff',
                              borderColor: '#bfdbfe',
                              color: '#1d4ed8',
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    {onMessageApplicant && (
                      <button
                        type="button"
                        onClick={() => onMessageApplicant({
                          id: cand.id,
                          name: cand.name || 'Candidate',
                          specialty: cand.profile?.specialty || 'General',
                        })}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '0.45rem 0.85rem',
                          borderRadius: 'var(--radius-sm)',
                          background: '#ffffff',
                          border: '1px solid var(--border)',
                          color: 'var(--primary)',
                          fontSize: '0.85rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        <IconMessages size={14} />
                        <span>Message</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleInvite(cand.id, cand.profile?.specialty || project.positions[0]?.specialty)}
                      disabled={actionLoading === cand.id}
                      style={{
                        padding: '0.45rem 1.1rem',
                        borderRadius: '6px',
                        background: '#2563eb',
                        color: '#ffffff',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                      }}
                    >
                      {actionLoading === cand.id ? 'Inviting...' : 'Invite to Team →'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
