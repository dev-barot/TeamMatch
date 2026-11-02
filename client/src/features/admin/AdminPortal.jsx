import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../api/adminApi.js';
import { IconAdmin, IconUsers, IconFlag, IconCheck, IconHourglass, IconClose } from '../../components/ui/Icons.jsx';

// ─── Small reusable components ───────────────────────────────────────────────

function StatusBadge({ isActive, isEmailVerified }) {
  if (!isActive) {
    return (
      <span style={{
        background: 'rgba(239,68,68,0.15)', color: '#f87171',
        border: '1px solid rgba(239,68,68,0.3)',
        padding: '2px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700,
      }}>Deactivated</span>
    );
  }
  if (!isEmailVerified) {
    return (
      <span style={{
        background: 'rgba(234,179,8,0.15)', color: '#fbbf24',
        border: '1px solid rgba(234,179,8,0.3)',
        padding: '2px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700,
      }}>Unverified</span>
    );
  }
  return (
    <span style={{
      background: 'rgba(34,197,94,0.15)', color: '#4ade80',
      border: '1px solid rgba(34,197,94,0.3)',
      padding: '2px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700,
    }}>Active</span>
  );
}

function ReportStatusBadge({ status }) {
  const isPending = status === 'pending';
  return (
    <span style={{
      background: isPending ? 'rgba(249,115,22,0.15)' : 'rgba(34,197,94,0.15)',
      color: isPending ? '#fb923c' : '#4ade80',
      border: `1px solid ${isPending ? 'rgba(249,115,22,0.3)' : 'rgba(34,197,94,0.3)'}`,
      padding: '2px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700,
      display: 'inline-flex', alignItems: 'center', gap: '4px',
    }}>
      {isPending ? (
        <>
          <IconHourglass size={11} color="#fb923c" />
          <span>Pending</span>
        </>
      ) : (
        <>
          <IconCheck size={11} color="#4ade80" />
          <span>Reviewed</span>
        </>
      )}
    </span>
  );
}

// ─── Tab: Accounts ────────────────────────────────────────────────────────────
function AccountsTab() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deactivating, setDeactivating] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.listAccounts();
      setAccounts(data.accounts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleVerify = async (studentId, name) => {
    try {
      await adminApi.verifyAccount(studentId);
      showToast(`Account for "${name}" verified successfully.`);
      setAccounts((prev) =>
        prev.map((a) => a.id === studentId ? { ...a, isEmailVerified: true } : a),
      );
    } catch (err) {
      showToast(err.message || 'Failed to verify account.', 'error');
    }
  };

  const handleDeactivate = async (studentId, name) => {
    if (!window.confirm(`Deactivate account for "${name}"? They will not be able to log in.`)) return;
    setDeactivating(studentId);
    try {
      await adminApi.deactivateAccount(studentId);
      showToast(`Account for "${name}" deactivated.`);
      setAccounts((prev) =>
        prev.map((a) => a.id === studentId ? { ...a, isActive: false } : a),
      );
    } catch (err) {
      showToast(err.message || 'Failed to deactivate.', 'error');
    } finally {
      setDeactivating(null);
    }
  };

  if (loading) return <p style={{ color: 'var(--text-dim)', padding: '2rem' }}>Loading accounts…</p>;
  if (error) return <p style={{ color: '#f87171', padding: '2rem' }}>Error: {error}</p>;

  return (
    <div>
      {toast && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
          background: toast.type === 'error' ? 'rgba(239,68,68,0.9)' : 'rgba(34,197,94,0.9)',
          color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px',
          fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          animation: 'fadeIn 0.2s ease',
        }}>{toast.msg}</div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>All Accounts ({accounts.length})</h3>
        <button
          onClick={load}
          style={{ padding: '6px 14px', borderRadius: '6px', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-main)', cursor: 'pointer', fontSize: '0.85rem' }}>
          ↻ Refresh
        </button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', textAlign: 'left' }}>
              {['Name', 'Email', 'Account Type', 'Status', 'Joined', 'Action'].map((h) => (
                <th key={h} style={{ padding: '8px 12px', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '2rem', color: 'var(--text-dim)', textAlign: 'center' }}>No accounts found.</td></tr>
            ) : accounts.map((acc) => (
              <tr
                key={acc.id}
                style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>{acc.name}</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{acc.email}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{
                    background: acc.accountType === 'admin' ? 'rgba(99,102,241,0.2)' : 'transparent',
                    color: acc.accountType === 'admin' ? 'var(--primary)' : 'var(--text-muted)',
                    padding: '2px 8px', borderRadius: '4px', fontWeight: acc.accountType === 'admin' ? 700 : 400,
                    fontSize: '0.82rem',
                  }}>{acc.accountType}</span>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <StatusBadge isActive={acc.isActive} isEmailVerified={acc.isEmailVerified} />
                </td>
                <td style={{ padding: '10px 12px', color: 'var(--text-dim)', fontSize: '0.82rem' }}>
                  {new Date(acc.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '10px 12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {acc.accountType !== 'admin' && !acc.isEmailVerified && (
                    <button
                      onClick={() => handleVerify(acc.id, acc.name)}
                      id={`verify-${acc.id}`}
                      style={{
                        padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700,
                        background: '#ecfdf5', color: '#059669',
                        border: '1px solid #a7f3d0', cursor: 'pointer',
                      }}>
                      Verify Student
                    </button>
                  )}
                  {acc.accountType !== 'admin' && acc.isActive && (
                    <button
                      onClick={() => handleDeactivate(acc.id, acc.name)}
                      disabled={deactivating === acc.id}
                      id={`deactivate-${acc.id}`}
                      style={{
                        padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600,
                        background: '#fef2f2', color: '#dc2626',
                        border: '1px solid #fecaca', cursor: 'pointer',
                        opacity: deactivating === acc.id ? 0.5 : 1,
                      }}>
                      {deactivating === acc.id ? '…' : 'Deactivate'}
                    </button>
                  )}
                  {!acc.isActive && <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tab: Reports ─────────────────────────────────────────────────────────────
function ReportsTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [reviewing, setReviewing] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.listReports(filter || undefined);
      setReports(data.reports || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleReview = async (reportId) => {
    setReviewing(reportId);
    try {
      await adminApi.markReportReviewed(reportId);
      showToast('Report marked as reviewed.');
      setReports((prev) =>
        prev.map((r) => r.id === reportId ? { ...r, status: 'reviewed' } : r),
      );
    } catch (err) {
      showToast(err.message || 'Failed to review.', 'error');
    } finally {
      setReviewing(null);
    }
  };

  const pendingCount = reports.filter((r) => r.status === 'pending').length;

  return (
    <div>
      {toast && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
          background: toast.type === 'error' ? 'rgba(239,68,68,0.9)' : 'rgba(34,197,94,0.9)',
          color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px',
          fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>{toast.msg}</div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
          Reports Queue
          {pendingCount > 0 && (
            <span style={{
              marginLeft: '8px', background: 'rgba(249,115,22,0.9)', color: '#fff',
              borderRadius: '999px', padding: '1px 8px', fontSize: '0.75rem', fontWeight: 700,
            }}>{pendingCount}</span>
          )}
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['', 'pending', 'reviewed'].map((f) => (
            <button
              key={f || 'all'}
              onClick={() => setFilter(f)}
              style={{
                padding: '5px 14px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600,
                cursor: 'pointer', border: '1px solid var(--border)',
                background: filter === f ? 'var(--primary)' : 'var(--bg-surface)',
                color: filter === f ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.15s',
              }}>
              {f === '' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading && <p style={{ color: 'var(--text-dim)', padding: '1rem' }}>Loading reports…</p>}
      {error && <p style={{ color: '#f87171', padding: '1rem' }}>Error: {error}</p>}
      {!loading && reports.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-muted)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <IconCheck size={36} color="#059669" />
          </div>
          <p>No reports{filter ? ` with status "${filter}"` : ''} found.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {reports.map((report) => (
          <div
            key={report.id}
            style={{
              background: '#ffffff', border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '1.25rem',
              borderLeft: report.status === 'pending' ? '4px solid #fb923c' : '4px solid #059669',
              boxShadow: '1px 1px 0px rgba(15, 23, 42, 0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <ReportStatusBadge status={report.status} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>#{report.id.slice(-8)}</span>
                  <span style={{
                    fontSize: '0.75rem', background: '#eff6ff', color: 'var(--primary)',
                    padding: '1px 8px', borderRadius: 'var(--radius-sm)', fontWeight: 700,
                  }}>{report.targetType}</span>
                </div>
                <p style={{ fontSize: '0.92rem', color: 'var(--ink)', marginBottom: '0.4rem', lineHeight: 1.5 }}>
                  <strong>Reason:</strong> {report.reason}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                  Target ID: <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>{report.targetId}</code>
                  {' · '}Filed: {new Date(report.createdAt).toLocaleString()}
                </p>
                {report.reviewedByAdminId && (
                  <p style={{ fontSize: '0.8rem', color: '#059669', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IconCheck size={12} color="#059669" /> Reviewed at {new Date(report.reviewedAt).toLocaleString()}
                  </p>
                )}
              </div>
              {report.status === 'pending' && (
                <button
                  onClick={() => handleReview(report.id)}
                  disabled={reviewing === report.id}
                  id={`review-report-${report.id}`}
                  style={{
                    padding: '6px 16px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 700,
                    background: '#ecfdf5', color: '#059669',
                    border: '1.5px solid #a7f3d0', cursor: 'pointer',
                    opacity: reviewing === report.id ? 0.5 : 1, whiteSpace: 'nowrap',
                  }}>
                  {reviewing === report.id ? '…' : 'Mark Reviewed'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main AdminPortal component ───────────────────────────────────────────────
export function AdminPortal({ currentUser, onClose }) {
  const [activeTab, setActiveTab] = useState('accounts');

  const tabs = [
    { id: 'accounts', label: 'Accounts', icon: <IconUsers size={16} /> },
    { id: 'reports', label: 'Reports', icon: <IconFlag size={16} /> },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: '#ffffff', border: '2px solid var(--border-structural)',
        borderRadius: 'var(--radius-sm)', width: '100%', maxWidth: '960px', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-geo-lg)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.5rem 2rem', borderBottom: '2px solid var(--border-structural)',
          background: '#f8fafc',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.2rem' }}>
              <IconAdmin size={22} color="var(--primary)" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, letterSpacing: '-0.5px', color: 'var(--ink)' }}>
                Admin Moderation Portal
              </h2>
              <span className="geo-tag" style={{
                background: '#eff6ff', color: 'var(--primary)',
                borderColor: '#bfdbfe',
              }}>ADMINISTRATOR</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
              Logged in as <strong>{currentUser?.name}</strong> ({currentUser?.email})
            </p>
          </div>
          <button
            onClick={onClose}
            id="admin-portal-close"
            style={{
              background: 'none', border: 'none', color: 'var(--ink-muted)',
              cursor: 'pointer', padding: '6px',
              borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <IconClose size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '0.5rem', padding: '0.75rem 2rem 0',
          borderBottom: '2px solid var(--border-structural)', flexShrink: 0,
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              id={`admin-tab-${tab.id}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: activeTab === tab.id ? '#ffffff' : 'transparent',
                border: '1.5px solid',
                borderColor: activeTab === tab.id ? 'var(--border-structural)' : 'transparent',
                borderBottom: activeTab === tab.id ? '2px solid #ffffff' : 'none',
                marginBottom: activeTab === tab.id ? '-2px' : '0',
                borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                cursor: 'pointer',
                padding: '8px 18px', fontWeight: 800, fontSize: '0.88rem',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--ink-muted)',
                transition: 'all 0.15s',
              }}>
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 2rem' }}>
          {activeTab === 'accounts' && <AccountsTab />}
          {activeTab === 'reports' && <ReportsTab />}
        </div>
      </div>
    </div>
  );
}
