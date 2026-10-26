import React, { useState } from 'react';

/**
 * FeedbackWidget — M7 step 7.
 * Floating "Give Feedback" button on every page. Links to external form (Tally/Google Form).
 * FEEDBACK_URL env var → falls back to mailto link in dev.
 */
const FEEDBACK_URL =
  import.meta.env.VITE_FEEDBACK_URL ||
  'mailto:feedback@teammatch.app?subject=TeamMatch Feedback';

export function FeedbackWidget() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="feedback-widget">
      {expanded && (
        <div style={{
          marginBottom: '0.75rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem',
          width: '220px',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideUp 0.2s ease',
        }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
            Found a bug or have a suggestion? We'd love to hear from you.
          </p>
          <a
            href={FEEDBACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            id="feedback-link"
            onClick={() => setExpanded(false)}
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.875rem',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
            }}>
            Share Feedback →
          </a>
        </div>
      )}
      <button
        onClick={() => setExpanded((v) => !v)}
        id="feedback-toggle"
        aria-label={expanded ? 'Close feedback panel' : 'Give feedback'}
        aria-expanded={expanded}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '10px 16px',
          borderRadius: 'var(--radius-full)',
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.82rem',
          boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
          border: 'none',
          cursor: 'pointer',
          transition: 'transform 0.15s, box-shadow 0.15s',
          minHeight: '44px',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.5)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.4)'; }}
      >
        <span aria-hidden="true">💬</span>
        <span className="hide-mobile">Feedback</span>
      </button>
    </div>
  );
}
