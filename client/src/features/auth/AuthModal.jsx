import React, { useState, useEffect } from 'react';
import { authApi } from '../../api/authApi.js';
import { IconMail, IconClose, IconCheck, IconWarning } from '../../components/ui/Icons.jsx';

export function AuthModal({ initialMode = 'login', onClose, onSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup' | 'verify'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialty: 'Backend',
    skills: 'React, Node.js',
  });
  const [verificationPin, setVerificationPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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

        setMessage(res.message || 'Account created! Enter the 4-digit PIN sent to your email.');
        setMode('verify');
      } else if (mode === 'login') {
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

  const handleVerifyPin = async (e) => {
    e.preventDefault();
    if (!verificationPin || verificationPin.trim().length !== 4) {
      setError('Please enter a complete 4-digit verification PIN.');
      return;
    }

    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      await authApi.verifyEmail(verificationPin.trim(), formData.email);
      setMessage('Email verified! Auto-approving and logging in...');

      // Auto login immediately
      if (formData.email && formData.password) {
        const loginRes = await authApi.login(formData.email, formData.password);
        onSuccess(loginRes.student);
        onClose();
      } else {
        setTimeout(() => setMode('login'), 1000);
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendPin = async () => {
    if (!formData.email) {
      setError('Email address is missing.');
      return;
    }
    setResending(true);
    setError(null);
    try {
      const res = await authApi.resendVerificationCode(formData.email);
      setMessage(res.message || 'A new 4-digit code has been sent to your email.');
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  const handleSkipToLogin = async () => {
    if (formData.email && formData.password) {
      try {
        const loginRes = await authApi.login(formData.email, formData.password);
        onSuccess(loginRes.student);
        onClose();
      } catch {
        setMode('login');
      }
    } else {
      setMode('login');
    }
  };

  return (
    <div
      className="modal-overlay"
      style={{ zIndex: 100 }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div
        className="modal-sheet"
        style={{
          maxWidth: '440px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Modal Header Tabs */}
        {mode !== 'verify' ? (
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}
          >
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
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.5rem',
              borderBottom: '1.5px solid var(--border-structural)',
              background: '#f8fafc',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconMail size={18} color="var(--primary)" />
              <span style={{ fontWeight: '800', color: 'var(--ink)', fontSize: '0.95rem' }}>
                Verify University Email
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--ink-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconClose size={18} />
            </button>
          </div>
        )}

        {/* Modal Body */}
        {mode === 'verify' ? (
          <form onSubmit={handleVerifyPin} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1.5px solid #fecaca',
                color: '#b91c1c',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <IconWarning size={15} color="#b91c1c" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div style={{
                background: '#ecfdf5',
                border: '1.5px solid #a7f3d0',
                color: '#059669',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <IconCheck size={14} color="#059669" />
                <span>{message}</span>
              </div>
            )}

            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
                A 4-digit verification code has been dispatched to:
              </p>
              <p style={{ fontWeight: '700', color: '#0f172a', fontSize: '1rem', marginTop: '4px' }}>
                {formData.email}
              </p>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px' }}>
                Enter the code below for instant auto-approval. No waiting for admin verification!
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.5rem', color: '#334155', textAlign: 'center' }}>
                4-DIGIT VERIFICATION PIN
              </label>
              <input
                type="text"
                required
                maxLength={4}
                autoFocus
                placeholder="••••"
                value={verificationPin}
                onChange={(e) => setVerificationPin(e.target.value.replace(/[^0-9]/g, ''))}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#f8fafc',
                  border: '2px solid #2563eb',
                  color: '#1d4ed8',
                  fontSize: '2rem',
                  fontWeight: '800',
                  letterSpacing: '14px',
                  textAlign: 'center',
                  fontFamily: 'var(--font-mono, monospace)',
                  outline: 'none',
                  boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.12)',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={handleResendPin}
                disabled={resending}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {resending ? 'Sending code...' : "Didn't receive email? Resend code"}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={loading || verificationPin.length !== 4}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  fontSize: '0.95rem',
                  opacity: loading || verificationPin.length !== 4 ? 0.6 : 1,
                  cursor: verificationPin.length === 4 ? 'pointer' : 'not-allowed',
                }}
              >
                {loading ? 'Verifying & Activating...' : 'Verify PIN & Activate Account'}
              </button>

              <button
                type="button"
                onClick={handleSkipToLogin}
                style={{
                  background: 'transparent',
                  border: '1px solid #cbd5e1',
                  color: '#64748b',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Skip for now (Account remains unverified)
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <IconWarning size={15} color="#b91c1c" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div style={{
                background: '#ecfdf5',
                border: '1.5px solid #a7f3d0',
                color: '#059669',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <IconCheck size={14} color="#059669" />
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
        )}
      </div>
    </div>
  );
}
