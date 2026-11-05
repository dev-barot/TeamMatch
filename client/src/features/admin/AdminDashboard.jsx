import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { adminApi } from '../../api/adminApi.js';
import { projectApi } from '../../api/projectApi.js';
import {
  CardCornerBrackets,
  CircularGauge,
  SteppedCapacityBar,
} from '../dashboard/ArchitecturalGraphics.jsx';
import {
  IconAdmin,
  IconUsers,
  IconProjects,
  IconFlag,
  IconSearch,
  IconCheck,
  IconWarning,
  IconClose,
  IconLogout,
  IconHourglass,
  IconMail,
  IconPlus,
} from '../../components/ui/Icons.jsx';

export function AdminDashboard({ currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'projects' | 'accounts' | 'reports' | 'broadcasts' | 'audit'
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isHovered;

  // Live Data States
  const [accounts, setAccounts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Filter States
  const [accountSearch, setAccountSearch] = useState('');
  const [accountStatusFilter, setAccountStatusFilter] = useState('All');
  const [accountTypeFilter, setAccountTypeFilter] = useState('All');

  const [projectSearch, setProjectSearch] = useState('');
  const [projectCategoryFilter, setProjectCategoryFilter] = useState('All');
  const [projectStatusFilter, setProjectStatusFilter] = useState('All');

  const [reportFilter, setReportFilter] = useState('all'); // 'all' | 'pending' | 'reviewed'

  // Modals & Actions
  const [closeModalProject, setCloseModalProject] = useState(null);
  const [closeReason, setCloseReason] = useState('Violation of campus guidelines');
  const [closingProject, setClosingProject] = useState(false);

  const [inspectProject, setInspectProject] = useState(null);
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState('info'); // 'info' | 'urgent' | 'deadline'
  const [announcements, setAnnouncements] = useState(() => {
    try {
      const saved = localStorage.getItem('tm_admin_broadcasts');
      return saved ? JSON.parse(saved) : [
        {
          id: 'bc-1',
          title: 'Spring Semester Project Showcase Deadline',
          message: 'All final project applications must be completed before Friday 11:59 PM for faculty review.',
          type: 'deadline',
          createdAt: new Date().toISOString(),
          author: 'Platform Admin',
        },
      ];
    } catch {
      return [];
    }
  });

  // Action Audit Log
  const [auditLogs, setAuditLogs] = useState(() => {
    return [
      {
        id: 'log-0',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: 'System Boot',
        detail: 'Admin Governance Session Initialized with dual-stack authentication.',
        category: 'system',
      },
    ];
  });

  const addAuditLog = useCallback((action, detail, category = 'governance') => {
    const newEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action,
      detail,
      category,
    };
    setAuditLogs((prev) => [newEntry, ...prev.slice(0, 49)]);
  }, []);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3800);
  }, []);

  // Fetch all live data
  const loadPlatformData = useCallback(async () => {
    setLoading(true);
    try {
      const [accRes, projRes, repRes] = await Promise.allSettled([
        adminApi.listAccounts(),
        projectApi.browseProjects({ limit: 100, status: '' }),
        adminApi.listReports(),
      ]);

      if (accRes.status === 'fulfilled' && accRes.value?.accounts) {
        setAccounts(accRes.value.accounts);
      }
      if (projRes.status === 'fulfilled' && projRes.value?.projects) {
        setProjects(projRes.value.projects);
      }
      if (repRes.status === 'fulfilled' && repRes.value?.reports) {
        setReports(repRes.value.reports);
      }
    } catch (err) {
      showToast(err.message || 'Failed to refresh platform data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const [accRes, projRes, repRes] = await Promise.allSettled([
          adminApi.listAccounts(),
          projectApi.browseProjects({ limit: 100, status: '' }),
          adminApi.listReports(),
        ]);
        if (ignore) return;
        if (accRes.status === 'fulfilled' && accRes.value?.accounts) {
          setAccounts(accRes.value.accounts);
        }
        if (projRes.status === 'fulfilled' && projRes.value?.projects) {
          setProjects(projRes.value.projects);
        }
        if (repRes.status === 'fulfilled' && repRes.value?.reports) {
          setReports(repRes.value.reports);
        }
      } catch (err) {
        if (!ignore) showToast(err.message || 'Failed to refresh platform data', 'error');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, [showToast]);

  // Derived Analytics
  const metrics = useMemo(() => {
    const totalAccounts = accounts.length;
    const activeAccounts = accounts.filter((a) => a.isActive).length;
    const verifiedAccounts = accounts.filter((a) => a.isEmailVerified && a.accountType !== 'admin').length;
    const unverifiedAccounts = accounts.filter((a) => !a.isEmailVerified && a.accountType !== 'admin').length;
    const adminCount = accounts.filter((a) => a.accountType === 'admin').length;

    const totalProjects = projects.length;
    const openProjects = projects.filter((p) => p.status === 'open').length;
    const closedProjects = projects.filter((p) => p.status === 'closed').length;

    const totalReports = reports.length;
    const pendingReports = reports.filter((r) => r.status === 'pending').length;
    const reviewedReports = reports.filter((r) => r.status === 'reviewed').length;

    // Skills Demanded Frequency
    const skillCounts = {};
    projects.forEach((p) => {
      if (Array.isArray(p.skills)) {
        p.skills.forEach((s) => {
          const norm = s.trim();
          if (norm) skillCounts[norm] = (skillCounts[norm] || 0) + 1;
        });
      }
    });

    const topSkills = Object.entries(skillCounts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return {
      totalAccounts,
      activeAccounts,
      verifiedAccounts,
      unverifiedAccounts,
      adminCount,
      totalProjects,
      openProjects,
      closedProjects,
      totalReports,
      pendingReports,
      reviewedReports,
      topSkills,
    };
  }, [accounts, projects, reports]);

  // Account Operations
  const handleVerifyStudent = async (studentId, studentName) => {
    try {
      await adminApi.verifyAccount(studentId);
      showToast(`Student "${studentName}" has been manually verified.`);
      addAuditLog('Student Verified', `Manual verification approved for ${studentName} (${studentId}).`, 'user');
      setAccounts((prev) =>
        prev.map((a) => (a.id === studentId ? { ...a, isEmailVerified: true } : a))
      );
    } catch (err) {
      showToast(err.message || 'Failed to verify account.', 'error');
    }
  };

  const handleDeactivateStudent = async (studentId, studentName) => {
    if (!window.confirm(`Deactivate student "${studentName}"? They will be locked out immediately.`)) return;
    try {
      await adminApi.deactivateAccount(studentId);
      showToast(`Account for "${studentName}" deactivated.`);
      addAuditLog('Account Deactivated', `Deactivated ${studentName} (${studentId}).`, 'security');
      setAccounts((prev) =>
        prev.map((a) => (a.id === studentId ? { ...a, isActive: false } : a))
      );
    } catch (err) {
      showToast(err.message || 'Failed to deactivate account.', 'error');
    }
  };

  const handleReactivateStudent = async (studentId, studentName) => {
    try {
      await adminApi.activateAccount(studentId);
      showToast(`Account for "${studentName}" reactivated.`);
      addAuditLog('Account Reactivated', `Access restored for ${studentName} (${studentId}).`, 'security');
      setAccounts((prev) =>
        prev.map((a) => (a.id === studentId ? { ...a, isActive: true } : a))
      );
    } catch (err) {
      showToast(err.message || 'Failed to reactivate account.', 'error');
    }
  };

  // Project Operations
  const handleConfirmCloseProject = async () => {
    if (!closeModalProject) return;
    setClosingProject(true);
    try {
      await adminApi.adminCloseProject(closeModalProject.id);
      showToast(`Project "${closeModalProject.title}" has been forcefully terminated.`);
      addAuditLog(
        'Project Closed by Admin',
        `Project "${closeModalProject.title}" terminated. Reason: ${closeReason}`,
        'moderation'
      );
      setProjects((prev) =>
        prev.map((p) => (p.id === closeModalProject.id ? { ...p, status: 'closed' } : p))
      );
      setCloseModalProject(null);
      setCloseReason('Violation of campus guidelines');
    } catch (err) {
      showToast(err.message || 'Failed to close project.', 'error');
    } finally {
      setClosingProject(false);
    }
  };

  // Report Operations
  const handleReviewReport = async (reportId) => {
    try {
      await adminApi.markReportReviewed(reportId);
      showToast('Report marked as reviewed and resolved.');
      addAuditLog('Report Reviewed', `Report #${reportId.slice(-8)} resolved by admin.`, 'safety');
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: 'reviewed', reviewedAt: new Date().toISOString() } : r))
      );
    } catch (err) {
      showToast(err.message || 'Failed to review report.', 'error');
    }
  };

  // Broadcast Announcement
  const handlePublishBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    const newAnnouncement = {
      id: `bc-${Date.now()}`,
      title: broadcastTitle.trim(),
      message: broadcastMessage.trim(),
      type: broadcastType,
      createdAt: new Date().toISOString(),
      author: currentUser?.name || 'Platform Admin',
    };

    const updated = [newAnnouncement, ...announcements];
    setAnnouncements(updated);
    try {
      localStorage.setItem('tm_admin_broadcasts', JSON.stringify(updated));
    } catch {
      // storage quota fallback
    }

    addAuditLog('Campus Broadcast Dispatched', `Title: "${broadcastTitle}" [${broadcastType.toUpperCase()}]`, 'broadcast');
    showToast('Campus broadcast successfully published.');
    setBroadcastTitle('');
    setBroadcastMessage('');
    setBroadcastModalOpen(false);
  };

  const handleDeleteAnnouncement = (id) => {
    const updated = announcements.filter((a) => a.id !== id);
    setAnnouncements(updated);
    try {
      localStorage.setItem('tm_admin_broadcasts', JSON.stringify(updated));
    } catch {
      // ignore
    }
    showToast('Broadcast removed.');
  };

  // Filtered Lists
  const filteredAccounts = useMemo(() => {
    return accounts.filter((a) => {
      if (accountStatusFilter === 'Active' && !a.isActive) return false;
      if (accountStatusFilter === 'Deactivated' && a.isActive) return false;
      if (accountStatusFilter === 'Unverified' && a.isEmailVerified) return false;
      if (accountTypeFilter === 'Student' && a.accountType !== 'student') return false;
      if (accountTypeFilter === 'Admin' && a.accountType !== 'admin') return false;

      if (accountSearch.trim()) {
        const q = accountSearch.toLowerCase();
        const matchName = (a.name || '').toLowerCase().includes(q);
        const matchEmail = (a.email || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail) return false;
      }
      return true;
    });
  }, [accounts, accountStatusFilter, accountTypeFilter, accountSearch]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (projectCategoryFilter !== 'All' && p.category !== projectCategoryFilter) return false;
      if (projectStatusFilter !== 'All' && p.status !== projectStatusFilter.toLowerCase()) return false;

      if (projectSearch.trim()) {
        const q = projectSearch.toLowerCase();
        const matchTitle = (p.title || '').toLowerCase().includes(q);
        const matchDesc = (p.description || '').toLowerCase().includes(q);
        const matchSkills = Array.isArray(p.skills) && p.skills.some((s) => s.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchSkills) return false;
      }
      return true;
    });
  }, [projects, projectCategoryFilter, projectStatusFilter, projectSearch]);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (reportFilter === 'pending' && r.status !== 'pending') return false;
      if (reportFilter === 'reviewed' && r.status !== 'reviewed') return false;
      return true;
    });
  }, [reports, reportFilter]);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <IconAdmin size={18} /> },
    { id: 'projects', label: 'Projects', icon: <IconProjects size={18} /> },
    { id: 'accounts', label: 'Accounts', icon: <IconUsers size={18} /> },
    { id: 'reports', label: 'Reports', icon: <IconFlag size={18} />, badge: metrics.pendingReports > 0 ? metrics.pendingReports : null },
    { id: 'broadcasts', label: 'Broadcasts', icon: <IconMail size={18} /> },
    { id: 'audit', label: 'Audit Log', icon: <IconHourglass size={18} /> },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        fontFamily: 'var(--font-sans)',
        color: '#0F1B33',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '1.25rem',
            right: '1.5rem',
            zIndex: 9999,
            backgroundColor: toast.type === 'error' ? '#EF4444' : '#0F1B33',
            color: '#FFFFFF',
            border: '2px solid #0F1B33',
            padding: '0.85rem 1.5rem',
            fontSize: '0.88rem',
            fontWeight: '700',
            boxShadow: '4px 4px 0px #0F1B33',
            animation: 'fadeIn 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {toast.type === 'error' ? <IconWarning size={16} color="#FFFFFF" /> : <IconCheck size={16} color="#10B981" />}
          {toast.msg}
        </div>
      )}

      {/* Top Header App Bar — Permanent TeamMatch Brand on Left with 4px bold right bar */}
      <header
        style={{
          height: '64px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1.5px solid #0F1B33',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 60,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Left: Brand + Section Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <div
            style={{
              width: '236px',
              minWidth: '236px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '0 1.25rem',
              borderRight: '4px solid #0F1B33',
              gap: '10px',
              boxSizing: 'border-box',
              backgroundColor: '#FFFFFF',
            }}
          >
            {/* Overlapping squares brand mark */}
            <div style={{ position: 'relative', width: '24px', height: '24px', flexShrink: 0 }}>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '15px',
                  height: '15px',
                  border: '2px solid #1F4FE0',
                  backgroundColor: '#FFFFFF',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '15px',
                  height: '15px',
                  border: '2px solid #F59E0B',
                  backgroundColor: 'transparent',
                }}
              />
            </div>
            <span style={{ fontWeight: '900', fontSize: '1.18rem', color: '#0F1B33', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              TeamMatch
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', paddingLeft: '1.5rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 9px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                color: '#1E40AF',
                fontSize: '0.72rem',
                fontWeight: '900',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              ADMIN CONSOLE
            </span>

            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: '700',
                fontSize: '0.82rem',
                letterSpacing: '0.08em',
                color: '#475569',
                whiteSpace: 'nowrap',
              }}
            >
              ADMIN / {activeTab.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Right Header items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', paddingRight: '2rem' }}>
          {/* Telemetry Status Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: '700',
              color: '#059669',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              padding: '4px 10px',
            }}
          >
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
            API & SOCKET: ONLINE
          </div>

          {/* Quick Broadcast Button */}
          <button
            onClick={() => setBroadcastModalOpen(true)}
            type="button"
            style={{
              padding: '0.45rem 1rem',
              backgroundColor: '#1F4FE0',
              color: '#FFFFFF',
              border: '1.5px solid #0F1B33',
              boxShadow: '2px 2px 0px #0F1B33',
              fontWeight: '800',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <IconPlus size={14} color="#FFFFFF" /> Broadcast Alert
          </button>

          {/* Admin Identity Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '4px 10px',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #0F1B33',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                backgroundColor: '#F59E0B',
                border: '1.5px solid #0F1B33',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                fontSize: '0.82rem',
                color: '#0F1B33',
              }}
            >
              PA
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '800', fontSize: '0.84rem', color: '#0F1B33', lineHeight: 1.1 }}>
                {currentUser?.name || 'Platform Admin'}
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: '900', color: '#B45309', letterSpacing: '0.04em' }}>
                ADMINISTRATOR
              </div>
            </div>
          </div>

          {/* Log Out Button */}
          <button
            onClick={onLogout}
            type="button"
            title="Log out of Admin session"
            style={{
              padding: '0.45rem 0.85rem',
              backgroundColor: '#FFFFFF',
              color: '#B91C1C',
              border: '1.5px solid #0F1B33',
              boxShadow: '2px 2px 0px #0F1B33',
              fontWeight: '800',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <IconLogout size={15} color="#B91C1C" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Body Area: Collapsible Sidebar + Content */}
      <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 64px)', position: 'relative' }}>
        {/* Left Collapsible & Expandable Admin Sidebar */}
        <aside
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            width: isExpanded ? '236px' : '72px',
            minWidth: isExpanded ? '236px' : '72px',
            backgroundColor: '#FFFFFF',
            borderRight: isExpanded ? '4px solid #0F1B33' : '1.5px solid #0F1B33',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'fixed',
            top: '64px',
            left: 0,
            height: 'calc(100vh - 64px)',
            zIndex: 50,
            boxShadow: isExpanded ? '0 8px 24px rgba(15, 27, 51, 0.08)' : 'none',
            transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.22s cubic-bezier(0.4, 0, 0.2, 1), border-right 0.22s ease, box-shadow 0.22s ease',
            overflowX: 'hidden',
            boxSizing: 'border-box',
          }}
        >
          {/* Navigation Links */}
          <nav style={{ padding: isExpanded ? '1.25rem 0.85rem' : '1.25rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  type="button"
                  title={item.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isExpanded ? 'space-between' : 'center',
                    padding: isExpanded ? '0.65rem 0.85rem' : '0.65rem 0',
                    border: isActive ? '1.5px solid #1F4FE0' : '1.5px solid transparent',
                    backgroundColor: isActive ? '#EEF3FF' : 'transparent',
                    color: isActive ? '#1F4FE0' : '#475569',
                    fontWeight: isActive ? '800' : '700',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    borderRadius: '0px',
                    transition: 'background-color 0.15s ease, border-color 0.15s ease',
                    textAlign: 'left',
                    width: '100%',
                    position: 'relative',
                    boxSizing: 'border-box',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#F8FAFC';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: isExpanded ? '10px' : '0', justifyContent: 'center' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', flexShrink: 0 }}>
                      {item.icon}
                      {item.badge && !isExpanded && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '-2px',
                            right: '-3px',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#EA580C',
                            border: '1.5px solid #FFFFFF',
                          }}
                        />
                      )}
                    </div>

                    {isExpanded && <span>{item.label}</span>}
                  </div>

                  {item.badge && isExpanded && (
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '999px',
                        border: '1px solid #FED7AA',
                        backgroundColor: '#FFEDD5',
                        color: '#EA580C',
                        fontSize: '0.72rem',
                        fontWeight: '800',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Sidebar Action: Log Out */}
          <div style={{ padding: isExpanded ? '1.25rem 1rem' : '1.25rem 0.5rem', borderTop: '1px solid #EEF2F6' }}>
            <button
              onClick={onLogout}
              type="button"
              title="Logout"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isExpanded ? 'flex-start' : 'center',
                gap: isExpanded ? '8px' : '0',
                width: '100%',
                padding: '0.65rem 0',
                background: 'none',
                border: 'none',
                color: '#475569',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'color 0.15s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#B91C1C';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#475569';
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', flexShrink: 0 }}>
                <IconLogout size={18} />
              </span>
              {isExpanded && <span>Log Out</span>}
            </button>
          </div>
        </aside>

        {/* Content Layout Spacer */}
        <div style={{ width: '72px', minWidth: '72px', flexShrink: 0 }} aria-hidden="true" />

        {/* Main Admin Console Container */}
        <main
          style={{
            flex: 1,
            padding: '2rem 2.25rem',
            maxWidth: '1380px',
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box',
          }}
        >
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {/* Hero Banner */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #0F1B33',
                  padding: '1.75rem 2rem',
                  boxShadow: '3px 3px 0px #0F1B33',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '2rem',
                  flexWrap: 'wrap',
                }}
              >
                <CardCornerBrackets corners={['topLeft', 'bottomLeft']} color="#1F4FE0" size={14} thickness={2.5} />
                <CardCornerBrackets corners={['topRight']} color="#F59E0B" size={14} thickness={2.5} />

                <div style={{ flex: 1, minWidth: '300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ color: '#F59E0B', fontSize: '0.85rem' }}>◆</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: '800', letterSpacing: '0.08em', color: '#1F4FE0' }}>
                      CAMPUS GOVERNANCE & TELEMETRY
                    </span>
                  </div>
                  <h1 style={{ fontSize: '2.1rem', fontWeight: '900', color: '#0F1B33', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
                    Platform Control <span style={{ color: '#1F4FE0' }}>Center</span>
                  </h1>
                  <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', maxWidth: '640px', lineHeight: 1.5 }}>
                    Real-time student matching telemetry, university project governance, and safety moderation queues.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <CircularGauge percentage={99} size={88} strokeWidth={8} color="#059669" />
                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                      SYSTEM HEALTH
                    </div>
                  </div>

                  <button
                    onClick={loadPlatformData}
                    disabled={loading}
                    type="button"
                    style={{
                      padding: '0.65rem 1.25rem',
                      backgroundColor: '#FFFFFF',
                      color: '#0F1B33',
                      border: '1.5px solid #0F1B33',
                      boxShadow: '2px 2px 0px #0F1B33',
                      fontWeight: '800',
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    ↻ {loading ? 'Syncing...' : 'Sync Telemetry'}
                  </button>
                </div>
              </div>

              {/* 4 Metric Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                {/* Metric 1 */}
                <div style={{ background: '#FFFFFF', border: '1.5px solid #0F1B33', padding: '1.25rem', boxShadow: '2px 2px 0px #0F1B33' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Registered Students
                    </span>
                    <IconUsers size={18} color="#1F4FE0" />
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0F1B33', lineHeight: 1.1, marginBottom: '0.65rem' }}>
                    {metrics.totalAccounts}
                  </div>
                  <SteppedCapacityBar
                    totalSegments={5}
                    filledSegments={Math.min(5, Math.max(1, Math.round((metrics.verifiedAccounts / (metrics.totalAccounts || 1)) * 5)))}
                    color="#1F4FE0"
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700', color: '#64748B', marginTop: '6px' }}>
                    <span>{metrics.verifiedAccounts} Verified</span>
                    <span>{metrics.unverifiedAccounts} Unverified</span>
                  </div>
                </div>

                {/* Metric 2 */}
                <div style={{ background: '#FFFFFF', border: '1.5px solid #0F1B33', padding: '1.25rem', boxShadow: '2px 2px 0px #0F1B33' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Campus Projects
                    </span>
                    <IconProjects size={18} color="#F59E0B" />
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0F1B33', lineHeight: 1.1, marginBottom: '0.65rem' }}>
                    {metrics.totalProjects}
                  </div>
                  <SteppedCapacityBar
                    totalSegments={5}
                    filledSegments={Math.min(5, Math.max(1, Math.round((metrics.openProjects / (metrics.totalProjects || 1)) * 5)))}
                    color="#F59E0B"
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700', color: '#64748B', marginTop: '6px' }}>
                    <span>{metrics.openProjects} Open</span>
                    <span>{metrics.closedProjects} Closed</span>
                  </div>
                </div>

                {/* Metric 3 */}
                <div style={{ background: '#FFFFFF', border: '1.5px solid #0F1B33', padding: '1.25rem', boxShadow: '2px 2px 0px #0F1B33' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Safety & Reports Queue
                    </span>
                    <IconFlag size={18} color="#EA580C" />
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: '900', color: metrics.pendingReports > 0 ? '#EA580C' : '#0F1B33', lineHeight: 1.1, marginBottom: '0.65rem' }}>
                    {metrics.totalReports}
                  </div>
                  <SteppedCapacityBar
                    totalSegments={5}
                    filledSegments={metrics.pendingReports > 0 ? 5 : 0}
                    color="#EA580C"
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700', color: '#64748B', marginTop: '6px' }}>
                    <span>{metrics.pendingReports} Pending Review</span>
                    <span>{metrics.reviewedReports} Resolved</span>
                  </div>
                </div>

                {/* Metric 4 */}
                <div style={{ background: '#FFFFFF', border: '1.5px solid #0F1B33', padding: '1.25rem', boxShadow: '2px 2px 0px #0F1B33' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Matching Engine Health
                    </span>
                    <IconCheck size={18} color="#059669" />
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#059669', lineHeight: 1.1, marginBottom: '0.65rem' }}>
                    100%
                  </div>
                  <SteppedCapacityBar totalSegments={5} filledSegments={5} color="#059669" />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700', color: '#64748B', marginTop: '6px' }}>
                    <span>Rule Engine R1-R7: Active</span>
                    <span>Socket: Live</span>
                  </div>
                </div>
              </div>

              {/* Two Column Section: Skill Demand & Audit Feed */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '1.5rem' }}>
                {/* Campus Tech Stack Demand */}
                <div style={{ background: '#FFFFFF', border: '1.5px solid #0F1B33', padding: '1.5rem', boxShadow: '2px 2px 0px #0F1B33' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0F1B33', margin: 0 }}>
                      Most Demanded Skills on Campus
                    </h3>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>
                      PROJECT FREQUENCY
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {metrics.topSkills.length === 0 ? (
                      <p style={{ color: '#64748B', fontSize: '0.88rem' }}>No skills tracked yet.</p>
                    ) : (
                      metrics.topSkills.map((s) => (
                        <div key={s.skill}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '800', marginBottom: '4px' }}>
                            <span style={{ color: '#0F1B33' }}>{s.skill}</span>
                            <span style={{ color: '#1F4FE0', fontFamily: 'var(--font-mono)' }}>{s.count} projects</span>
                          </div>
                          <div style={{ height: '8px', backgroundColor: '#EEF2F6', border: '1px solid #CBD5E1', width: '100%', position: 'relative' }}>
                            <div
                              style={{
                                height: '100%',
                                backgroundColor: '#1F4FE0',
                                width: `${Math.min(100, (s.count / Math.max(1, metrics.totalProjects)) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Audit & Governance Activity Feed */}
                <div style={{ background: '#FFFFFF', border: '1.5px solid #0F1B33', padding: '1.5rem', boxShadow: '2px 2px 0px #0F1B33' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0F1B33', margin: 0 }}>
                      Governance Session Audit Feed
                    </h3>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>
                      CHRONOLOGICAL
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '280px', overflowY: 'auto' }}>
                    {auditLogs.map((log) => (
                      <div
                        key={log.id}
                        style={{
                          padding: '0.65rem 0.85rem',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderLeft: '3px solid #1F4FE0',
                          fontSize: '0.82rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: '#0F1B33', marginBottom: '2px' }}>
                          <span>{log.action}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#64748B' }}>{log.timestamp}</span>
                        </div>
                        <p style={{ margin: 0, color: '#475569', fontSize: '0.8rem' }}>{log.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROJECTS GOVERNANCE */}
          {activeTab === 'projects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0F1B33', margin: '0 0 4px 0' }}>
                    Projects Governance
                  </h2>
                  <p style={{ margin: 0, color: '#64748B', fontSize: '0.88rem' }}>
                    Inspect student initiatives across campus and exercise administrative content control.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={loadPlatformData}
                    type="button"
                    style={{
                      padding: '0.55rem 1rem',
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #0F1B33',
                      boxShadow: '2px 2px 0px #0F1B33',
                      fontWeight: '800',
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                    }}
                  >
                    ↻ Refresh
                  </button>
                </div>
              </div>

              {/* Single Line Filter Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  width: '100%',
                  flexWrap: 'nowrap',
                  overflowX: 'auto',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ flex: '1 1 200px', minWidth: '160px', position: 'relative', display: 'flex', alignItems: 'center', height: '38px' }}>
                  <span style={{ position: 'absolute', left: '12px', color: '#5A6B87', pointerEvents: 'none' }}>
                    <IconSearch size={16} />
                  </span>
                  <input
                    type="text"
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    placeholder="Search projects, creator, or skills..."
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 0.85rem 0 2.25rem',
                      border: '1.5px solid #0F1B33',
                      borderRadius: '0px',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.86rem',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                      color: '#0F1B33',
                    }}
                  />
                </div>

                <select
                  value={projectCategoryFilter}
                  onChange={(e) => setProjectCategoryFilter(e.target.value)}
                  style={{
                    width: 'auto',
                    minWidth: '135px',
                    flexShrink: 0,
                    height: '38px',
                    padding: '0 1.25rem 0 0.85rem',
                    border: '1.5px solid #0F1B33',
                    borderRadius: '0px',
                    backgroundColor: '#FFFFFF',
                    fontSize: '0.84rem',
                    fontWeight: '700',
                    color: '#0F1B33',
                    cursor: 'pointer',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="All">All Categories</option>
                  <option value="Startup">Startup</option>
                  <option value="Open Source">Open Source</option>
                  <option value="Class Project">Class Project</option>
                  <option value="Research">Research</option>
                  <option value="Hackathon">Hackathon</option>
                </select>

                <select
                  value={projectStatusFilter}
                  onChange={(e) => setProjectStatusFilter(e.target.value)}
                  style={{
                    width: 'auto',
                    minWidth: '135px',
                    flexShrink: 0,
                    height: '38px',
                    padding: '0 1.25rem 0 0.85rem',
                    border: '1.5px solid #0F1B33',
                    borderRadius: '0px',
                    backgroundColor: '#FFFFFF',
                    fontSize: '0.84rem',
                    fontWeight: '700',
                    color: '#0F1B33',
                    cursor: 'pointer',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Projects List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {filteredProjects.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center', background: '#FFFFFF', border: '1.5px dashed #CBD5E1', color: '#64748B' }}>
                    No projects found matching the criteria.
                  </div>
                ) : (
                  filteredProjects.map((p) => {
                    const isOpen = p.status === 'open';
                    return (
                      <div
                        key={p.id}
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1.5px solid #0F1B33',
                          padding: '1.25rem 1.5rem',
                          boxShadow: '2px 2px 0px #0F1B33',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '1.5rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: '300px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span
                              style={{
                                padding: '2px 8px',
                                backgroundColor: isOpen ? '#ECFDF5' : '#F1F5F9',
                                color: isOpen ? '#059669' : '#64748B',
                                border: `1px solid ${isOpen ? '#A7F3D0' : '#CBD5E1'}`,
                                fontSize: '0.72rem',
                                fontWeight: '800',
                                textTransform: 'uppercase',
                              }}
                            >
                              {p.status}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                              #{p.id.slice(-8)}
                            </span>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1F4FE0', backgroundColor: '#EFF6FF', padding: '1px 8px' }}>
                              {p.category}
                            </span>
                          </div>

                          <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F1B33', margin: '0 0 6px 0' }}>
                            {p.title}
                          </h3>

                          <p style={{ margin: '0 0 8px 0', color: '#475569', fontSize: '0.86rem', lineHeight: 1.45 }}>
                            {p.description ? p.description.slice(0, 140) + '...' : 'No description provided.'}
                          </p>

                          {Array.isArray(p.skills) && p.skills.length > 0 && (
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {p.skills.map((s) => (
                                <span
                                  key={s}
                                  style={{
                                    fontSize: '0.72rem',
                                    fontWeight: '700',
                                    backgroundColor: '#F8FAFC',
                                    border: '1px solid #CBD5E1',
                                    padding: '2px 8px',
                                    color: '#334155',
                                  }}
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <button
                            onClick={() => setInspectProject(p)}
                            type="button"
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#FFFFFF',
                              color: '#0F1B33',
                              border: '1.5px solid #0F1B33',
                              fontWeight: '800',
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                            }}
                          >
                            Inspect Details
                          </button>

                          {isOpen && (
                            <button
                              onClick={() => setCloseModalProject(p)}
                              type="button"
                              style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#FEF2F2',
                                color: '#DC2626',
                                border: '1.5px solid #FECACA',
                                fontWeight: '800',
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                              }}
                            >
                              Force Close Project
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ACCOUNTS & STUDENT DIRECTORY */}
          {activeTab === 'accounts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0F1B33', margin: '0 0 4px 0' }}>
                    Student & Account Directory
                  </h2>
                  <p style={{ margin: 0, color: '#64748B', fontSize: '0.88rem' }}>
                    Manage student profiles, verify identity credentials, and control access permissions.
                  </p>
                </div>

                <button
                  onClick={loadPlatformData}
                  type="button"
                  style={{
                    padding: '0.55rem 1rem',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #0F1B33',
                    boxShadow: '2px 2px 0px #0F1B33',
                    fontWeight: '800',
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                  }}
                >
                  ↻ Refresh Directory
                </button>
              </div>

              {/* Single Line Filter Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  width: '100%',
                  flexWrap: 'nowrap',
                  overflowX: 'auto',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ flex: '1 1 200px', minWidth: '160px', position: 'relative', display: 'flex', alignItems: 'center', height: '38px' }}>
                  <span style={{ position: 'absolute', left: '12px', color: '#5A6B87', pointerEvents: 'none' }}>
                    <IconSearch size={16} />
                  </span>
                  <input
                    type="text"
                    value={accountSearch}
                    onChange={(e) => setAccountSearch(e.target.value)}
                    placeholder="Search name or email address..."
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 0.85rem 0 2.25rem',
                      border: '1.5px solid #0F1B33',
                      borderRadius: '0px',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.86rem',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                      color: '#0F1B33',
                    }}
                  />
                </div>

                <select
                  value={accountStatusFilter}
                  onChange={(e) => setAccountStatusFilter(e.target.value)}
                  style={{
                    width: 'auto',
                    minWidth: '135px',
                    flexShrink: 0,
                    height: '38px',
                    padding: '0 1.25rem 0 0.85rem',
                    border: '1.5px solid #0F1B33',
                    borderRadius: '0px',
                    backgroundColor: '#FFFFFF',
                    fontSize: '0.84rem',
                    fontWeight: '700',
                    color: '#0F1B33',
                    cursor: 'pointer',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Deactivated">Deactivated</option>
                  <option value="Unverified">Unverified</option>
                </select>

                <select
                  value={accountTypeFilter}
                  onChange={(e) => setAccountTypeFilter(e.target.value)}
                  style={{
                    width: 'auto',
                    minWidth: '135px',
                    flexShrink: 0,
                    height: '38px',
                    padding: '0 1.25rem 0 0.85rem',
                    border: '1.5px solid #0F1B33',
                    borderRadius: '0px',
                    backgroundColor: '#FFFFFF',
                    fontSize: '0.84rem',
                    fontWeight: '700',
                    color: '#0F1B33',
                    cursor: 'pointer',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="All">All Roles</option>
                  <option value="Student">Students Only</option>
                  <option value="Admin">Admins Only</option>
                </select>
              </div>

              {/* Table */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #0F1B33',
                  boxShadow: '3px 3px 0px #0F1B33',
                  overflowX: 'auto',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid #0F1B33' }}>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '900', color: '#0F1B33', fontSize: '0.8rem', letterSpacing: '0.05em' }}>NAME</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '900', color: '#0F1B33', fontSize: '0.8rem', letterSpacing: '0.05em' }}>EMAIL</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '900', color: '#0F1B33', fontSize: '0.8rem', letterSpacing: '0.05em' }}>ROLE</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '900', color: '#0F1B33', fontSize: '0.8rem', letterSpacing: '0.05em' }}>STATUS</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '900', color: '#0F1B33', fontSize: '0.8rem', letterSpacing: '0.05em' }}>JOINED</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '900', color: '#0F1B33', fontSize: '0.8rem', letterSpacing: '0.05em', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
                          No accounts match your query.
                        </td>
                      </tr>
                    ) : (
                      filteredAccounts.map((acc) => {
                        const isAccAdmin = acc.accountType === 'admin';
                        return (
                          <tr key={acc.id} style={{ borderBottom: '1px solid #EEF2F6' }}>
                            <td style={{ padding: '0.85rem 1rem', fontWeight: '800', color: '#0F1B33' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div
                                  style={{
                                    width: '26px',
                                    height: '26px',
                                    backgroundColor: isAccAdmin ? '#F59E0B' : '#EEF2FF',
                                    color: isAccAdmin ? '#0F1B33' : '#1F4FE0',
                                    border: '1px solid #0F1B33',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.72rem',
                                    fontWeight: '900',
                                  }}
                                >
                                  {(acc.name || 'U').slice(0, 1)}
                                </div>
                                {acc.name}
                              </div>
                            </td>
                            <td style={{ padding: '0.85rem 1rem', color: '#475569', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                              {acc.email}
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <span
                                style={{
                                  padding: '2px 8px',
                                  fontSize: '0.72rem',
                                  fontWeight: '800',
                                  backgroundColor: isAccAdmin ? '#EFF6FF' : '#F8FAFC',
                                  color: isAccAdmin ? '#1F4FE0' : '#475569',
                                  border: `1px solid ${isAccAdmin ? '#BFDBFE' : '#E2E8F0'}`,
                                }}
                              >
                                {acc.accountType}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              {!acc.isActive ? (
                                <span style={{ padding: '2px 8px', fontSize: '0.72rem', fontWeight: '800', backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                                  Deactivated
                                </span>
                              ) : !acc.isEmailVerified ? (
                                <span style={{ padding: '2px 8px', fontSize: '0.72rem', fontWeight: '800', backgroundColor: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A' }}>
                                  Unverified
                                </span>
                              ) : (
                                <span style={{ padding: '2px 8px', fontSize: '0.72rem', fontWeight: '800', backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}>
                                  Active
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '0.85rem 1rem', color: '#64748B', fontSize: '0.82rem' }}>
                              {acc.createdAt ? new Date(acc.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '6px' }}>
                                {!isAccAdmin && !acc.isEmailVerified && (
                                  <button
                                    onClick={() => handleVerifyStudent(acc.id, acc.name)}
                                    type="button"
                                    style={{
                                      padding: '3px 8px',
                                      backgroundColor: '#ECFDF5',
                                      color: '#059669',
                                      border: '1px solid #A7F3D0',
                                      fontSize: '0.76rem',
                                      fontWeight: '800',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Verify
                                  </button>
                                )}
                                {!isAccAdmin && acc.isActive && (
                                  <button
                                    onClick={() => handleDeactivateStudent(acc.id, acc.name)}
                                    type="button"
                                    style={{
                                      padding: '3px 8px',
                                      backgroundColor: '#FEF2F2',
                                      color: '#DC2626',
                                      border: '1px solid #FECACA',
                                      fontSize: '0.76rem',
                                      fontWeight: '800',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Deactivate
                                  </button>
                                )}
                                {!isAccAdmin && !acc.isActive && (
                                  <button
                                    onClick={() => handleReactivateStudent(acc.id, acc.name)}
                                    type="button"
                                    style={{
                                      padding: '3px 8px',
                                      backgroundColor: '#EFF6FF',
                                      color: '#1F4FE0',
                                      border: '1px solid #BFDBFE',
                                      fontSize: '0.76rem',
                                      fontWeight: '800',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Reactivate
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: REPORTS & SAFETY */}
          {activeTab === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0F1B33', margin: '0 0 4px 0' }}>
                    Safety & Moderation Queue
                  </h2>
                  <p style={{ margin: 0, color: '#64748B', fontSize: '0.88rem' }}>
                    Review user complaints, reported discussions, and campus policy violations.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['all', 'pending', 'reviewed'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setReportFilter(f)}
                      type="button"
                      style={{
                        padding: '0.45rem 1rem',
                        backgroundColor: reportFilter === f ? '#0F1B33' : '#FFFFFF',
                        color: reportFilter === f ? '#FFFFFF' : '#0F1B33',
                        border: '1.5px solid #0F1B33',
                        fontWeight: '800',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                      }}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {filteredReports.length === 0 ? (
                <div style={{ padding: '3.5rem', textAlign: 'center', backgroundColor: '#FFFFFF', border: '1.5px solid #0F1B33', boxShadow: '2px 2px 0px #0F1B33' }}>
                  <IconCheck size={40} color="#059669" />
                  <h3 style={{ margin: '0.75rem 0 4px 0', fontSize: '1.15rem', fontWeight: '900', color: '#0F1B33' }}>
                    Moderation Queue Clean
                  </h3>
                  <p style={{ margin: 0, color: '#64748B', fontSize: '0.88rem' }}>
                    No reports pending review at this time. All student communications meet community guidelines.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {filteredReports.map((r) => {
                    const isPending = r.status === 'pending';
                    return (
                      <div
                        key={r.id}
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1.5px solid #0F1B33',
                          padding: '1.25rem 1.5rem',
                          borderLeft: `4px solid ${isPending ? '#EA580C' : '#059669'}`,
                          boxShadow: '2px 2px 0px #0F1B33',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                              <span
                                style={{
                                  padding: '2px 8px',
                                  fontSize: '0.72rem',
                                  fontWeight: '800',
                                  backgroundColor: isPending ? '#FFEDD5' : '#ECFDF5',
                                  color: isPending ? '#EA580C' : '#059669',
                                  border: `1px solid ${isPending ? '#FED7AA' : '#A7F3D0'}`,
                                }}
                              >
                                {r.status.toUpperCase()}
                              </span>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#475569', fontWeight: '700' }}>
                                #{r.id.slice(-8)}
                              </span>
                              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1F4FE0', backgroundColor: '#EFF6FF', padding: '1px 8px' }}>
                                Target: {r.targetType}
                              </span>
                            </div>

                            <p style={{ fontSize: '0.94rem', fontWeight: '800', color: '#0F1B33', margin: '0 0 6px 0' }}>
                              Reason: {r.reason}
                            </p>

                            <p style={{ margin: 0, color: '#64748B', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                              Target ID: {r.targetId} · Filed: {new Date(r.createdAt).toLocaleString()}
                            </p>
                          </div>

                          {isPending && (
                            <button
                              onClick={() => handleReviewReport(r.id)}
                              type="button"
                              style={{
                                padding: '0.55rem 1.15rem',
                                backgroundColor: '#ECFDF5',
                                color: '#059669',
                                border: '1.5px solid #A7F3D0',
                                fontWeight: '800',
                                fontSize: '0.84rem',
                                cursor: 'pointer',
                              }}
                            >
                              ✓ Mark Reviewed
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: BROADCASTS & ANNOUNCEMENTS */}
          {activeTab === 'broadcasts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0F1B33', margin: '0 0 4px 0' }}>
                    Campus Broadcasts & Alerts
                  </h2>
                  <p style={{ margin: 0, color: '#64748B', fontSize: '0.88rem' }}>
                    Dispatch global banners and notifications across all student dashboards.
                  </p>
                </div>

                <button
                  onClick={() => setBroadcastModalOpen(true)}
                  type="button"
                  style={{
                    padding: '0.55rem 1.25rem',
                    backgroundColor: '#1F4FE0',
                    color: '#FFFFFF',
                    border: '1.5px solid #0F1B33',
                    boxShadow: '2px 2px 0px #0F1B33',
                    fontWeight: '800',
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <IconPlus size={16} color="#FFFFFF" /> Create New Broadcast
                </button>
              </div>

              {/* Active Broadcasts */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {announcements.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center', background: '#FFFFFF', border: '1.5px dashed #CBD5E1', color: '#64748B' }}>
                    No announcements currently dispatched.
                  </div>
                ) : (
                  announcements.map((bc) => {
                    const isUrgent = bc.type === 'urgent';
                    const isDeadline = bc.type === 'deadline';
                    const borderAccent = isUrgent ? '#DC2626' : isDeadline ? '#D97706' : '#1F4FE0';
                    const bgAccent = isUrgent ? '#FEF2F2' : isDeadline ? '#FFFBEB' : '#EFF6FF';
                    return (
                      <div
                        key={bc.id}
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1.5px solid #0F1B33',
                          borderLeft: `5px solid ${borderAccent}`,
                          padding: '1.25rem 1.5rem',
                          boxShadow: '2px 2px 0px #0F1B33',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                              <span
                                style={{
                                  padding: '2px 8px',
                                  fontSize: '0.72rem',
                                  fontWeight: '900',
                                  backgroundColor: bgAccent,
                                  color: borderAccent,
                                  border: `1px solid ${borderAccent}`,
                                  textTransform: 'uppercase',
                                }}
                              >
                                {bc.type}
                              </span>
                              <span style={{ fontSize: '0.78rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                                {new Date(bc.createdAt).toLocaleString()} · Author: {bc.author}
                              </span>
                            </div>

                            <h3 style={{ fontSize: '1.18rem', fontWeight: '900', color: '#0F1B33', margin: '0 0 6px 0' }}>
                              {bc.title}
                            </h3>

                            <p style={{ margin: 0, color: '#334155', fontSize: '0.9rem', lineHeight: 1.5 }}>
                              {bc.message}
                            </p>
                          </div>

                          <button
                            onClick={() => handleDeleteAnnouncement(bc.id)}
                            type="button"
                            style={{
                              padding: '0.45rem 0.85rem',
                              backgroundColor: '#FFFFFF',
                              color: '#B91C1C',
                              border: '1.5px solid #FECACA',
                              fontWeight: '800',
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                            }}
                          >
                            Expire / Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 6: AUDIT LOG */}
          {activeTab === 'audit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0F1B33', margin: '0 0 4px 0' }}>
                    Platform Audit Log
                  </h2>
                  <p style={{ margin: 0, color: '#64748B', fontSize: '0.88rem' }}>
                    Immutable session audit trail recording all administrative interventions, account status changes, and project closures.
                  </p>
                </div>

                <button
                  onClick={() => addAuditLog('Audit Exported', 'Downloaded administrative event dump.', 'system')}
                  type="button"
                  style={{
                    padding: '0.55rem 1rem',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #0F1B33',
                    boxShadow: '2px 2px 0px #0F1B33',
                    fontWeight: '800',
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                  }}
                >
                  Export Audit Records
                </button>
              </div>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #0F1B33',
                  boxShadow: '3px 3px 0px #0F1B33',
                  overflowX: 'auto',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid #0F1B33' }}>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '900', color: '#0F1B33', fontSize: '0.8rem', letterSpacing: '0.05em' }}>TIMESTAMP</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '900', color: '#0F1B33', fontSize: '0.8rem', letterSpacing: '0.05em' }}>ACTION</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '900', color: '#0F1B33', fontSize: '0.8rem', letterSpacing: '0.05em' }}>CATEGORY</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '900', color: '#0F1B33', fontSize: '0.8rem', letterSpacing: '0.05em' }}>DETAIL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #EEF2F6' }}>
                        <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#64748B' }}>
                          {log.timestamp}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: '800', color: '#0F1B33' }}>
                          {log.action}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              fontSize: '0.72rem',
                              fontWeight: '800',
                              backgroundColor: '#EFF6FF',
                              color: '#1F4FE0',
                              border: '1px solid #BFDBFE',
                              textTransform: 'uppercase',
                            }}
                          >
                            {log.category}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#334155' }}>
                          {log.detail}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Force Close Project Confirmation Modal */}
      {closeModalProject && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(15, 27, 51, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #0F1B33',
              boxShadow: '6px 6px 0px #0F1B33',
              maxWidth: '520px',
              width: '100%',
              padding: '2rem',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconWarning size={20} color="#DC2626" />
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#0F1B33' }}>
                  Force Close Project
                </h3>
              </div>
              <button
                onClick={() => setCloseModalProject(null)}
                type="button"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <IconClose size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Are you sure you want to forcibly terminate <strong>"{closeModalProject.title}"</strong>?
              Under Rule R6, all pending applications will be immediately rejected with status "project_closed".
            </p>

            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: '#0F1B33', marginBottom: '6px' }}>
              Administrative Closure Reason:
            </label>
            <input
              type="text"
              value={closeReason}
              onChange={(e) => setCloseReason(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                border: '1.5px solid #0F1B33',
                fontSize: '0.88rem',
                marginBottom: '1.5rem',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setCloseModalProject(null)}
                type="button"
                style={{
                  padding: '0.65rem 1.25rem',
                  backgroundColor: '#FFFFFF',
                  color: '#0F1B33',
                  border: '1.5px solid #0F1B33',
                  fontWeight: '800',
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCloseProject}
                disabled={closingProject}
                type="button"
                style={{
                  padding: '0.65rem 1.5rem',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: '1.5px solid #0F1B33',
                  boxShadow: '2px 2px 0px #0F1B33',
                  fontWeight: '800',
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                {closingProject ? 'Closing...' : 'Terminate Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Project Modal */}
      {inspectProject && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(15, 27, 51, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #0F1B33',
              boxShadow: '6px 6px 0px #0F1B33',
              maxWidth: '620px',
              width: '100%',
              padding: '2rem',
              boxSizing: 'border-box',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#1F4FE0', backgroundColor: '#EFF6FF', padding: '2px 8px' }}>
                  {inspectProject.category}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#64748B' }}>
                  #{inspectProject.id}
                </span>
              </div>
              <button
                onClick={() => setInspectProject(null)}
                type="button"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <IconClose size={18} />
              </button>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F1B33', margin: '0 0 1rem 0' }}>
              {inspectProject.title}
            </h2>

            <p style={{ color: '#334155', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {inspectProject.description || 'No description provided.'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', backgroundColor: '#F8FAFC', padding: '1rem', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', display: 'block' }}>WORKLOAD</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0F1B33' }}>{inspectProject.workload || 'MEDIUM'}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', display: 'block' }}>STATUS</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '800', color: inspectProject.status === 'open' ? '#059669' : '#DC2626' }}>
                  {(inspectProject.status || 'OPEN').toUpperCase()}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', display: 'block' }}>CREATOR ID</span>
                <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: '#0F1B33' }}>
                  {inspectProject.creatorId || 'admin_seed_001'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', display: 'block' }}>APPLICATION COUNT</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0F1B33' }}>
                  {inspectProject.applicantCount || 0}
                </span>
              </div>
            </div>

            {Array.isArray(inspectProject.skills) && inspectProject.skills.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '6px' }}>
                  REQUIRED SKILLS
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {inspectProject.skills.map((s) => (
                    <span key={s} style={{ padding: '3px 9px', backgroundColor: '#EEF2FF', border: '1px solid #C7D2FE', color: '#1E40AF', fontSize: '0.78rem', fontWeight: '700' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setInspectProject(null)}
                type="button"
                style={{
                  padding: '0.65rem 1.5rem',
                  backgroundColor: '#0F1B33',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: '800',
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Composer Modal */}
      {broadcastModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(15, 27, 51, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #0F1B33',
              boxShadow: '6px 6px 0px #0F1B33',
              maxWidth: '560px',
              width: '100%',
              padding: '2rem',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconMail size={20} color="#1F4FE0" />
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900', color: '#0F1B33' }}>
                  Dispatch Campus Broadcast
                </h3>
              </div>
              <button
                onClick={() => setBroadcastModalOpen(false)}
                type="button"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <IconClose size={18} />
              </button>
            </div>

            <form onSubmit={handlePublishBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F1B33', marginBottom: '4px' }}>
                  Alert Priority / Category
                </label>
                <select
                  value={broadcastType}
                  onChange={(e) => setBroadcastType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1.5px solid #0F1B33',
                    fontSize: '0.88rem',
                    fontWeight: '700',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <option value="info">General Information Notice</option>
                  <option value="deadline">Semester Deadline Alert</option>
                  <option value="urgent">Urgent Campus System Alert</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F1B33', marginBottom: '4px' }}>
                  Announcement Headline
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hackathon Team Formation Window Open"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1.5px solid #0F1B33',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F1B33', marginBottom: '4px' }}>
                  Full Announcement Content
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter details for all students..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1.5px solid #0F1B33',
                    fontSize: '0.88rem',
                    fontFamily: 'var(--font-sans)',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  onClick={() => setBroadcastModalOpen(false)}
                  type="button"
                  style={{
                    padding: '0.65rem 1.25rem',
                    backgroundColor: '#FFFFFF',
                    color: '#0F1B33',
                    border: '1.5px solid #0F1B33',
                    fontWeight: '800',
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.65rem 1.6rem',
                    backgroundColor: '#1F4FE0',
                    color: '#FFFFFF',
                    border: '1.5px solid #0F1B33',
                    boxShadow: '2px 2px 0px #0F1B33',
                    fontWeight: '800',
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                  }}
                >
                  Publish to Campus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
