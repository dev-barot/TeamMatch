import React, { useState } from 'react';

/**
 * MatchScoreBadge Component
 * Displays an explainable match score badge with popover breakdown (Rule R4).
 */
export function MatchScoreBadge({ match, compact = false }) {
  const [showPopover, setShowPopover] = useState(false);

  if (!match || match.totalScore === undefined) return null;

  const score = match.totalScore;
  const reasons = match.reasons || [];

  // Color tiering
  const getBadgeColors = () => {
    if (score >= 60) {
      return {
        bg: 'rgba(16, 185, 129, 0.15)',
        border: 'rgba(16, 185, 129, 0.35)',
        text: '#34d399',
        glow: '0 0 12px rgba(16, 185, 129, 0.3)',
      };
    }
    if (score >= 35) {
      return {
        bg: 'rgba(99, 102, 241, 0.15)',
        border: 'rgba(99, 102, 241, 0.35)',
        text: '#818cf8',
        glow: '0 0 12px rgba(99, 102, 241, 0.3)',
      };
    }
    return {
      bg: 'rgba(234, 179, 8, 0.15)',
      border: 'rgba(234, 179, 8, 0.35)',
      text: '#fbbf24',
      glow: '0 0 12px rgba(234, 179, 8, 0.3)',
    };
  };

  const colors = getBadgeColors();

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowPopover(!showPopover);
        }}
        onMouseEnter={() => setShowPopover(true)}
        onMouseLeave={() => setShowPopover(false)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: compact ? '2px 8px' : '4px 10px',
          borderRadius: 'var(--radius-full)',
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          color: colors.text,
          fontSize: compact ? '0.75rem' : '0.82rem',
          fontWeight: '700',
          cursor: 'pointer',
          boxShadow: colors.glow,
          transition: 'all 0.2s ease',
        }}
      >
        <span>⚡</span>
        <span>{score} pts match</span>
        <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>ℹ️</span>
      </button>

      {/* Explainable Match Reasons Popover (Rule R4) */}
      {showPopover && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%) translateY(-8px)',
            width: '280px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 100,
            pointerEvents: 'auto',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-main)' }}>
              Explainable AI Match (R4)
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: colors.text }}>
              {score} total pts
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {reasons.length === 0 ? (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                No specific bonus factors matched.
              </span>
            ) : (
              reasons.map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '6px',
                    fontSize: '0.75rem',
                    lineHeight: 1.35,
                  }}
                >
                  <span style={{
                    color: '#34d399',
                    fontWeight: '700',
                    background: 'rgba(16, 185, 129, 0.1)',
                    padding: '1px 5px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.7rem',
                    whiteSpace: 'nowrap',
                  }}>
                    +{r.points}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>{r.text}</span>
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: '0.6rem', paddingTop: '0.4rem', borderTop: '1px solid var(--border)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>
            Rule R4: Every point is explained. Top 5 factors descending.
          </div>
        </div>
      )}
    </div>
  );
}
