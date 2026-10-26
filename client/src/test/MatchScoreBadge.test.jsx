import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MatchScoreBadge } from '../features/matching/MatchScoreBadge.jsx';

// ─── MatchScoreBadge — M7 step 3: "Show Match Reasons next to every Match Score, never a bare number" ───
// Reason shape from MatchingEngine: { points: number, text: string }

const highMatch = {
  totalScore: 75,
  reasons: [
    { points: 30, text: 'Skill Overlap — Shares: react, node.js' },
    { points: 25, text: 'Specialty Match — Both Backend' },
    { points: 20, text: 'Availability — 15 hrs/week overlap' },
  ],
};

describe('MatchScoreBadge', () => {
  it('renders the numeric score in the badge (never a bare hidden number)', () => {
    render(<MatchScoreBadge match={highMatch} />);
    // Score appears as "75 pts match"
    expect(screen.getByText(/75 pts match/i)).toBeInTheDocument();
  });

  it('shows label text "pts match" — score is always contextualised, not bare (R4)', () => {
    render(<MatchScoreBadge match={highMatch} />);
    const badge = screen.getByText(/75 pts match/i);
    expect(badge.textContent).toMatch(/pts match/);
  });

  it('clicking the badge opens the Reasons popover with reason text', () => {
    render(<MatchScoreBadge match={highMatch} />);
    fireEvent.click(screen.getByText(/75 pts match/i));
    expect(screen.getByText(/Skill Overlap/i)).toBeInTheDocument();
    expect(screen.getByText(/Specialty Match/i)).toBeInTheDocument();
    expect(screen.getByText(/Availability/i)).toBeInTheDocument();
  });

  it('popover shows point values (+30, +25, +20) for each reason', () => {
    render(<MatchScoreBadge match={highMatch} />);
    fireEvent.click(screen.getByText(/75 pts match/i));
    expect(screen.getByText('+30')).toBeInTheDocument();
    expect(screen.getByText('+25')).toBeInTheDocument();
    expect(screen.getByText('+20')).toBeInTheDocument();
  });

  it('popover contains the R4 footer text', () => {
    render(<MatchScoreBadge match={highMatch} />);
    fireEvent.click(screen.getByText(/75 pts match/i));
    expect(screen.getByText(/Rule R4: Every point is explained/i)).toBeInTheDocument();
  });

  it('renders nothing when match prop is null', () => {
    const { container } = render(<MatchScoreBadge match={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when totalScore is missing', () => {
    const { container } = render(<MatchScoreBadge match={{ reasons: [] }} />);
    expect(container.firstChild).toBeNull();
  });

  it('handles empty reasons array — shows "No specific bonus factors matched"', () => {
    render(<MatchScoreBadge match={{ totalScore: 42, reasons: [] }} />);
    expect(screen.getByText(/42 pts match/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/42 pts match/i));
    expect(screen.getByText(/No specific bonus factors matched/i)).toBeInTheDocument();
  });
});
