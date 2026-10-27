import React, { useState } from 'react';
import { projectApi } from '../../api/projectApi.js';

const SPECIALTIES = ['Frontend', 'Backend', 'ML', 'DevOps', 'UI/UX', 'Other'];
const COMMITMENT_LEVELS = [
  { value: 'low', label: 'Low (<10 hrs/wk)' },
  { value: 'medium', label: 'Medium (10-20 hrs/wk)' },
  { value: 'high', label: 'High (20+ hrs/wk)' },
];

export function CreateProjectModal({ currentUser, onClose, onProjectCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Class Project');
  const [commitmentLevel, setCommitmentLevel] = useState('medium');
  const [courseCode, setCourseCode] = useState('');
  const [term, setTerm] = useState('');

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  const [positions, setPositions] = useState([
    { specialty: 'Backend', headcount: 1 },
  ]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isVerified = Boolean(currentUser?.isEmailVerified);

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleAddPosition = () => {
    setPositions([...positions, { specialty: 'Frontend', headcount: 1 }]);
  };

  const handleRemovePosition = (index) => {
    if (positions.length <= 1) return;
    setPositions(positions.filter((_, i) => i !== index));
  };

  const handlePositionChange = (index, field, value) => {
    const updated = [...positions];
    updated[index] = {
      ...updated[index],
      [field]: field === 'headcount' ? Math.max(1, parseInt(value, 10) || 1) : value,
    };
    setPositions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isVerified) {
      setErrorMessage('Rule R5: Email verification is required before creating a Project.');
      return;
    }

    if (title.trim().length < 3) {
      setErrorMessage('Project title must be at least 3 characters.');
      return;
    }
    if (description.trim().length < 10) {
      setErrorMessage('Project description must be at least 10 characters.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        commitmentLevel,
        requiredSkills: skills,
        positions,
        courseTag: courseCode.trim() ? { courseCode: courseCode.trim(), term: term.trim() } : null,
      };

      const newProject = await projectApi.createProject(payload);
      onProjectCreated(newProject);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 7, 15, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1.5rem',
      overflowY: 'auto',
    }}>
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-lg)',
        padding: '2rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0f172a' }}>Post a New Project</h2>
            <p style={{ fontSize: '0.85rem', color: '#475569' }}>
              Define your project team requirements and open positions (Rule R3)
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              fontSize: '1.35rem',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            ✕
          </button>
        </div>

        {!isVerified && (
          <div style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            color: '#b45309',
            fontSize: '0.88rem',
            marginBottom: '1.5rem',
          }}>
            <strong>Rule R5: Verification Gate.</strong> Your university email is not verified yet. You can browse projects, but must verify your account before posting a project.
          </div>
        )}

        {errorMessage && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            color: '#b91c1c',
            fontSize: '0.85rem',
            fontWeight: '500',
            marginBottom: '1.5rem',
          }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.35rem', color: '#334155' }}>
              Project Title *
            </label>
            <input
              type="text"
              required
              disabled={!isVerified}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Task Orchestrator"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontSize: '0.92rem',
              }}
            />
          </div>

          {/* Category & Commitment */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.35rem', color: '#334155' }}>
                Category
              </label>
              <select
                disabled={!isVerified}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '0.92rem',
                }}
              >
                <option value="Class Project">Class Project</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Startup">Startup</option>
                <option value="Research">Research</option>
                <option value="Open Source">Open Source</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.35rem', color: '#334155' }}>
                Commitment Level
              </label>
              <select
                disabled={!isVerified}
                value={commitmentLevel}
                onChange={(e) => setCommitmentLevel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '0.92rem',
                }}
              >
                {COMMITMENT_LEVELS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.35rem', color: '#334155' }}>
              Project Description *
            </label>
            <textarea
              required
              rows={4}
              disabled={!isVerified}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the project scope, technical vision, and goals..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontSize: '0.92rem',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Positions Builder (R3: Headcount >= 1) */}
          <div style={{
            background: '#f8fafc',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a', marginBottom: 0 }}>
                  Open Positions (Capacity) *
                </label>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Enforces Rule R3 (Headcount ≥ 1 per Position)
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddPosition}
                disabled={!isVerified}
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: isVerified ? 'pointer' : 'not-allowed',
                }}
              >
                + Add Position
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {positions.map((pos, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <select
                    disabled={!isVerified}
                    value={pos.specialty}
                    onChange={(e) => handlePositionChange(idx, 'specialty', e.target.value)}
                    style={{
                      flex: 2,
                      padding: '0.6rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      fontSize: '0.88rem',
                    }}
                  >
                    {SPECIALTIES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Headcount:</span>
                    <input
                      type="number"
                      min={1}
                      disabled={!isVerified}
                      value={pos.headcount}
                      onChange={(e) => handlePositionChange(idx, 'headcount', e.target.value)}
                      style={{
                        width: '65px',
                        padding: '0.6rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#0f172a',
                        fontSize: '0.88rem',
                        textAlign: 'center',
                      }}
                    />
                  </div>

                  {positions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePosition(idx)}
                      aria-label="Remove position"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#dc2626',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        fontSize: '1rem',
                        fontWeight: '700',
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Required Skills */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.35rem', color: '#334155' }}>
              Required Tech Stack
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                disabled={!isVerified}
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                placeholder="Type skill & press Add (e.g. React, PostgreSQL)"
                style={{
                  flex: 1,
                  padding: '0.65rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '0.9rem',
                }}
              />
              <button
                type="button"
                onClick={handleAddSkill}
                disabled={!isVerified}
                className="btn-primary"
                style={{
                  padding: '0.65rem 1.25rem',
                  fontSize: '0.85rem',
                }}
              >
                Add
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {skills.map(s => (
                <span
                  key={s}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#1d4ed8',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                  }}
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s)}
                    aria-label={`Remove skill ${s}`}
                    style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.85rem', padding: '0 2px' }}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Optional Course Tag */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            background: '#f8fafc',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #e2e8f0',
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.3rem', color: '#334155' }}>
                Course Code (Optional)
              </label>
              <input
                type="text"
                disabled={!isVerified}
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g. CS680"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '0.85rem',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.3rem', color: '#334155' }}>
                Academic Term (Optional)
              </label>
              <input
                type="text"
                disabled={!isVerified}
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="e.g. Fall 2026"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '0.85rem',
                }}
              />
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#475569',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isVerified}
              className="btn-primary"
              style={{
                padding: '0.75rem 1.75rem',
                fontSize: '0.9rem',
                opacity: isVerified && !loading ? 1 : 0.6,
              }}
            >
              {loading ? 'Creating...' : 'Publish Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
