import React, { useState } from 'react';
import { IconSpark } from '../../components/ui/Icons.jsx';

/**
 * MatchScoreBadge Component
 * Displays an explainable match score badge with popover breakdown.
 */
export function MatchScoreBadge({ match, compact = false }) {
  const [showPopover, setShowPopover] = useState(false);

  if (!match || match.totalScore === undefined) return null;

  const score = match.totalScore;
  const reasons = match.reasons || [];

  // Color tiering - Clean University SaaS
  const getBadgeColors = () => {
    if (score >= 60) {
      return {
        bg: '#ecfdf5',
        border: '#a7f3d0',
        text: '#059669',
      };
    }
    if (score >= 35) {
      return {
        bg: '#eff6ff',
        border: '#bfdbfe',
        text: '#1d4ed8',
      };
    }
    return {
      bg: '#fffbeb',
      border: '#fde68a',
      text: '#b45309',
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
          borderRadius: 'var(--radius-sm)',
          background: colors.bg,
          border: `1.5px solid ${colors.border}`,
          color: colors.text,
          fontSize: compact ? '0.74rem' : '0.8rem',
          fontWeight: '800',
          cursor: 'pointer',
          letterSpacing: '0.2px',
          transition: 'all 0.15s ease',
        }}
      >
        <IconSpark size={12} color={colors.text} />
        <span>{score} PTS MATCH</span>
      </button>

      {/* Explainable Match Reasons Popover */}
      {showPopover && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%) translateY(-8px)',
            width: '280px',
            background: '#ffffff',
            border: '2px solid var(--border-structural)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem',
            boxShadow: 'var(--shadow-geo-md)',
            zIndex: 100,
            pointerEvents: 'auto',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--ink)' }}>
              Explainable Match Fit
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: colors.text }}>
              {score} total pts
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {reasons.length === 0 ? (
              <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
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
                    color: '#059669',
                    fontWeight: '800',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.7rem',
                    whiteSpace: 'nowrap',
                  }}>
                    +{r.points}
                  </span>
                  <span style={{ color: 'var(--ink-muted)' }}>{r.text}</span>
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: '0.6rem', paddingTop: '0.4rem', borderTop: '1px solid var(--border)', fontSize: '0.68rem', color: 'var(--ink-muted)' }}>
            Every score point is explained based on skills, availability, and working style.
          </div>
        </div>
      )}
    </div>
  );
}
