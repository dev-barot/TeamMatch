import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApplyModal } from '../features/applications/ApplyModal.jsx';

// Mock applicationApi so we don't need a real server
vi.mock('../api/applicationApi.js', () => ({
  applicationApi: {
    apply: vi.fn(),
  },
}));

import { applicationApi } from '../api/applicationApi.js';

const mockProject = {
  id: 'proj_001',
  title: 'AI Tutor App',
  positions: [
    { specialty: 'Backend', headcount: 2, filledCount: 0, remaining: 2 },
    { specialty: 'Frontend', headcount: 1, filledCount: 0, remaining: 1 },
  ],
};

const mockUserVerified = {
  id: 'student_001',
  name: 'Alice',
  isEmailVerified: true,
  profile: { specialty: 'Backend' },
};

const mockUserUnverified = {
  id: 'student_002',
  name: 'Bob',
  isEmailVerified: false,
};

// ─── ApplyModal — Apply button states ─────────────────────────────────────────

describe('ApplyModal — Apply button states', () => {
  let onClose, onSuccess;

  beforeEach(() => {
    onClose = vi.fn();
    onSuccess = vi.fn();
    vi.clearAllMocks();
  });

  it('renders "Apply to Project" heading with correct project title', () => {
    render(
      <ApplyModal project={mockProject} currentUser={mockUserVerified} onClose={onClose} onSuccess={onSuccess} />,
    );
    expect(screen.getByText('Apply to Project')).toBeInTheDocument();
    expect(screen.getByText('AI Tutor App')).toBeInTheDocument();
  });

  it('shows available positions as options', () => {
    render(
      <ApplyModal project={mockProject} currentUser={mockUserVerified} onClose={onClose} onSuccess={onSuccess} />,
    );
    expect(screen.getByRole('option', { name: /Backend/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Frontend/i })).toBeInTheDocument();
  });

  it('Close (✕) button has accessible aria-label and calls onClose', () => {
    render(
      <ApplyModal project={mockProject} currentUser={mockUserVerified} onClose={onClose} onSuccess={onSuccess} />,
    );
    const closeBtn = screen.getByRole('button', { name: /close apply modal/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Submit button is disabled and shows warning when email is unverified (Rule R5)', () => {
    render(
      <ApplyModal project={mockProject} currentUser={mockUserUnverified} onClose={onClose} onSuccess={onSuccess} />,
    );
    const submitBtn = screen.getByText(/Submit Application/i).closest('button');
    expect(submitBtn).toBeDisabled();
    expect(screen.getByText(/email is unverified/i)).toBeInTheDocument();
  });

  it('Submit button shows "Submitting…" text and is disabled while in-flight', async () => {
    applicationApi.apply.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ message: 'Done' }), 300)),
    );
    render(
      <ApplyModal project={mockProject} currentUser={mockUserVerified} onClose={onClose} onSuccess={onSuccess} />,
    );

    const submitBtn = screen.getByText(/Submit Application/i).closest('button');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Submitting/i)).toBeInTheDocument();
    });
    const inFlightBtn = screen.getByText(/Submitting/i).closest('button');
    expect(inFlightBtn).toBeDisabled();
  });

  it('shows error message when API call fails (R1 guard)', async () => {
    applicationApi.apply.mockRejectedValue(
      new Error('You already have a Pending Application for this project.'),
    );
    render(
      <ApplyModal project={mockProject} currentUser={mockUserVerified} onClose={onClose} onSuccess={onSuccess} />,
    );
    fireEvent.click(screen.getByText(/Submit Application/i).closest('button'));
    await waitFor(() => {
      expect(screen.getByText(/already have a Pending Application/i)).toBeInTheDocument();
    });
  });

  it('calls onSuccess after successful application', async () => {
    const fakeApplication = { id: 'app_001', status: 'pending' };
    applicationApi.apply.mockResolvedValue({ message: 'Applied!', application: fakeApplication });
    render(
      <ApplyModal project={mockProject} currentUser={mockUserVerified} onClose={onClose} onSuccess={onSuccess} />,
    );
    fireEvent.click(screen.getByText(/Submit Application/i).closest('button'));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(fakeApplication), { timeout: 2000 });
  });
});
