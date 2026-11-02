import React, { useState } from 'react';
import { IconMessages } from './Icons.jsx';

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
          background: '#ffffff',
          border: '2px solid var(--border-structural)',
          borderRadius: 'var(--radius-sm)',
          padding: '1rem',
          width: '240px',
          boxShadow: 'var(--shadow-geo)',
          animation: 'slideUp 0.2s ease',
        }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
            Found a bug or have a suggestion? We'd love to hear from you.
          </p>
          <a
            href={FEEDBACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            id="feedback-link"
            onClick={() => setExpanded(false)}
            className="btn-primary"
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '8px 16px',
              fontSize: '0.85rem',
              textDecoration: 'none',
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
          gap: '8px',
          padding: '8px 16px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--ink)',
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.84rem',
          boxShadow: 'var(--shadow-geo-sm)',
          border: '1.5px solid var(--ink)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          minHeight: '40px',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; e.currentTarget.style.boxShadow = '3px 3px 0px rgba(15, 23, 42, 0.4)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-geo-sm)'; }}
      >
        <IconMessages size={16} color="#ffffff" />
        <span className="hide-mobile">Feedback</span>
      </button>
    </div>
  );
}
