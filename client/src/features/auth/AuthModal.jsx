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
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={() => { setMode('login'); setError(null); setMessage(null); }}
            style={{
              flex: 1,
              padding: '1rem',
              fontWeight: '700',
              fontSize: '0.95rem',
              color: mode === 'login' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: mode === 'login' ? '2px solid var(--primary)' : 'none',
              background: mode === 'login' ? 'rgba(99, 102, 241, 0.05)' : 'none',
            }}
          >
            Log In
          </button>
          <button
            onClick={() => { setMode('signup'); setError(null); setMessage(null); }}
            style={{
              flex: 1,
              padding: '1rem',
              fontWeight: '700',
              fontSize: '0.95rem',
              color: mode === 'signup' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: mode === 'signup' ? '2px solid var(--primary)' : 'none',
              background: mode === 'signup' ? 'rgba(99, 102, 241, 0.05)' : 'none',
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
            }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#6ee7b7',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
            }}>
              {message}
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Johnson"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
              University Email
            </label>
            <input
              type="email"
              required
              placeholder="alex@university.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {mode === 'signup' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
                  Preferred Specialty
                </label>
                <select
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
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
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="React, Python, Docker"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
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
              disabled={loading}
              style={{
                flex: 2,
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                color: '#fff',
                fontWeight: '700',
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
