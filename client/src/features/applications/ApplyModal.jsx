import React, { useState } from 'react';
import { applicationApi } from '../../api/applicationApi.js';
import { IconClose, IconCheck, IconWarning } from '../../components/ui/Icons.jsx';

export function ApplyModal({ project, currentUser, onClose, onSuccess }) {
  const openPositions = project?.positions?.filter(p => (p.remaining !== undefined ? p.remaining > 0 : (p.headcount > (p.filledCount || 0)))) || [];
  const [selectedSpecialty, setSelectedSpecialty] = useState(openPositions[0]?.specialty || '');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedSpecialty) {
      setError('Please select an open position.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await applicationApi.apply(project.id, selectedSpecialty, notes);
      setSuccessMsg(res.message || 'Application submitted successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess(res.application);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 110 }}>
      <div className="modal-sheet" style={{ maxWidth: '520px', padding: '2rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>Apply to Project</h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
              {project?.title}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close apply modal"
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

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1.5px solid #fecaca',
            color: '#b91c1c',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            fontWeight: '600',
          }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{
            background: '#ecfdf5',
            border: '1.5px solid #a7f3d0',
            color: '#059669',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <IconCheck size={14} color="#059669" />
            <span>{successMsg}</span>
          </div>
        )}

        {!currentUser?.isEmailVerified && (
          <div style={{
            background: '#fffbeb',
            border: '1.5px solid #fde68a',
            color: '#b45309',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <IconWarning size={16} color="#b45309" />
            <span>Your email is unverified. Verified status is required by the academic coordinator before applying.</span>
          </div>
        )}

        {openPositions.length === 0 ? (
          <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.875rem' }}>
            All positions on this project are currently filled to capacity.
          </div>
        ) : (
          <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.45rem', color: '#334155' }}>
                Select Open Position <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              >
                {openPositions.map((pos) => (
                  <option key={pos.specialty} value={pos.specialty}>
                    {pos.specialty} ({pos.remaining} seat{pos.remaining > 1 ? 's' : ''} remaining)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.45rem', color: '#334155' }}>
                Application Notes (Why you are a great fit)
              </label>
              <textarea
                rows="3"
                placeholder="Mention relevant coursework, past projects, or why you want to build this..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '0.9rem',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '0.7rem 1.25rem',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !currentUser?.isEmailVerified}
                style={{
                  padding: '0.7rem 1.5rem',
                  borderRadius: '8px',
                  background: (submitting || !currentUser?.isEmailVerified) ? '#94a3b8' : '#2563eb',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '0.875rem',
                  cursor: (submitting || !currentUser?.isEmailVerified) ? 'not-allowed' : 'pointer',
                  boxShadow: (submitting || !currentUser?.isEmailVerified) ? 'none' : '0 2px 8px rgba(37, 99, 235, 0.25)',
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
