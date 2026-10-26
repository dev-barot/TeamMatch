import React, { useState } from 'react';
import { applicationApi } from '../../api/applicationApi.js';

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
      <div className="modal-sheet" style={{ maxWidth: '520px', padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Apply to Project</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {project?.title}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close apply modal" style={{ color: 'var(--text-muted)', fontSize: '1.2rem', minHeight: '44px', minWidth: '44px' }}>✕</button>
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

        {successMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#6ee7b7',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontSize: '0.85rem',
          }}>
            {successMsg}
          </div>
        )}

        {!currentUser?.isEmailVerified && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#fde68a',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontSize: '0.85rem',
          }}>
            ⚠️ Rule R5 Warning: Your email is unverified. Verified email is required before you can apply.
          </div>
        )}

        {openPositions.length === 0 ? (
          <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>
            All positions on this project are currently filled to capacity (Rule R3).
          </p>
        ) : (
          <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                Select Open Position
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                required
              >
                {openPositions.map((pos) => (
                  <option key={pos.specialty} value={pos.specialty}>
                    {pos.specialty} ({pos.remaining} seat{pos.remaining > 1 ? 's' : ''} left)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                Application Notes (Why you are a great fit)
              </label>
              <textarea
                rows="3"
                placeholder="Mention relevant coursework, past projects, or why you want to build this..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  fontWeight: '600',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !currentUser?.isEmailVerified}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  color: '#fff',
                  fontWeight: '700',
                  opacity: (submitting || !currentUser?.isEmailVerified) ? 0.6 : 1,
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Application (R1)'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
