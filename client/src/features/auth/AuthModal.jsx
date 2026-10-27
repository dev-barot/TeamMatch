import React, { useState } from 'react';
import { authApi } from '../../api/authApi.js';

export function AuthModal({ initialMode = 'login', onClose, onSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialty: 'Backend',
    skills: 'React, Node.js',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const skillsList = formData.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        const res = await authApi.signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          specialty: formData.specialty,
          skills: skillsList,
        });

        setMessage(res.message || 'Account created! Now log in.');
        setTimeout(() => setMode('login'), 1200);
      } else {
        const res = await authApi.login(formData.email, formData.password);
        onSuccess(res.student);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Action failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 100 }}>
      <div className="modal-sheet" style={{ maxWidth: '440px', overflow: 'hidden' }}>
        {/* Modal Header Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); setMessage(null); }}
            style={{
              flex: 1,
              padding: '1rem',
              fontWeight: '700',
              fontSize: '0.95rem',
              color: mode === 'login' ? 'var(--primary)' : '#64748b',
              borderBottom: mode === 'login' ? '2px solid var(--primary)' : '2px solid transparent',
              background: mode === 'login' ? '#ffffff' : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); setMessage(null); }}
            style={{
              flex: 1,
              padding: '1rem',
              fontWeight: '700',
              fontSize: '0.95rem',
              color: mode === 'signup' ? 'var(--primary)' : '#64748b',
              borderBottom: mode === 'signup' ? '2px solid var(--primary)' : '2px solid transparent',
              background: mode === 'signup' ? '#ffffff' : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#059669',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span>✓</span>
              <span>{message}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.35rem', color: '#334155' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Johnson"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.35rem', color: '#334155' }}>
              University Email
            </label>
            <input
              type="email"
              required
              placeholder="alex@university.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.35rem', color: '#334155' }}>
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

          {mode === 'signup' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.35rem', color: '#334155' }}>
                  Preferred Specialty
                </label>
                <select
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
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
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="ML">ML</option>
                  <option value="DevOps">DevOps</option>
                  <option value="UI/UX">UI/UX</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.35rem', color: '#334155' }}>
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="React, Python, Docker"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
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
            </>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#475569',
                fontWeight: '600',
                fontSize: '0.92rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                flex: 2,
                padding: '0.75rem',
                fontSize: '0.92rem',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Log In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
