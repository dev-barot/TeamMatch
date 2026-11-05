import React, { useState, useEffect } from 'react';
import { IsometricBuilding, CardCornerBrackets } from './ArchitecturalGraphics.jsx';
import { IconSearch } from '../../components/ui/Icons.jsx';
import { applicationApi } from '../../api/applicationApi.js';

export function ApplicationsView() {
  const [activeTab, setActiveTab] = useState('sent'); // 'sent' | 'invited' | 'accepted' | 'declined'
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('Latest First');

  // Live applications loaded from API
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    let ignore = false;
    async function loadApps() {
      try {
        const data = await applicationApi.getMyApplications();
        if (!ignore && data?.applications) {
          const mapped = data.applications.map((app) => ({
            id: app.id,
            title: app.project?.title || 'Project Application',
            role: app.specialty || 'General',
            time: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recent',
            tags: app.project?.requiredSkills || [],
            status: app.status === 'accepted' ? 'Accepted' : app.status === 'rejected' ? 'Declined' : app.initiatedBy === 'creator' ? 'Invited' : 'Sent',
            iconType: 'code',
          }));
          setApplications(mapped);
        }
      } catch {
        // empty fallback
      }
    }
    loadApps();
    return () => {
      ignore = true;
    };
  }, []);

  const counts = {
    sent: applications.filter((a) => a.status === 'Sent').length,
    invited: applications.filter((a) => a.status === 'Invited').length,
    accepted: applications.filter((a) => a.status === 'Accepted').length,
    declined: applications.filter((a) => a.status === 'Declined').length,
  };

  const handleDecision = (id, decision) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: decision === 'accept' ? 'Accepted' : 'Declined' } : app))
    );
  };

  const filteredApps = applications.filter((app) => {
    if (activeTab === 'sent' && app.status !== 'Sent') return false;
    if (activeTab === 'invited' && app.status !== 'Invited') return false;
    if (activeTab === 'accepted' && app.status !== 'Accepted') return false;
    if (activeTab === 'declined' && app.status !== 'Declined') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = app.title.toLowerCase().includes(q);
      const matchRole = app.role.toLowerCase().includes(q);
      const matchTags = app.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchRole && !matchTags) return false;
    }

    if (roleFilter !== 'All' && app.role !== roleFilter) return false;

    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%' }}>
      {/* Top Header Row with Isometric Building */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ color: '#F59E0B', fontSize: '0.85rem' }}>◆</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: '700', letterSpacing: '0.08em', color: '#1F4FE0' }}>
              03 / APPLICATIONS
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#0F1B33', letterSpacing: '-0.02em', margin: '0 0 0.35rem 0' }}>
            Your <span style={{ color: '#1F4FE0' }}>applications</span>
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#5A6B87', margin: 0 }}>
            Track and manage all your project applications in one place.
          </p>
        </div>

        <div style={{ paddingRight: '1rem' }}>
          <IsometricBuilding width={210} height={105} />
        </div>
      </div>

      {/* 4 Large Filter Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Sent Tab */}
        <div
          onClick={() => setActiveTab('sent')}
          style={{
            background: '#FFFFFF',
            border: activeTab === 'sent' ? '2px solid #1F4FE0' : '1.5px solid #0F1B33',
            padding: '1.25rem 1.4rem',
            boxShadow: activeTab === 'sent' ? '0 0 0 1px #1F4FE0, 2px 2px 0px #0F1B33' : '2px 2px 0px #0F1B33',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1F4FE0',
                borderRadius: '4px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#5A6B87' }}>Sent</span>
              <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0F1B33', lineHeight: 1.1 }}>
                {counts.sent}
              </div>
            </div>
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F1B33' }}>→</span>
        </div>

        {/* Invited Tab */}
        <div
          onClick={() => setActiveTab('invited')}
          style={{
            background: '#FFFFFF',
            border: activeTab === 'invited' ? '2px solid #1F4FE0' : '1.5px solid #0F1B33',
            padding: '1.25rem 1.4rem',
            boxShadow: activeTab === 'invited' ? '0 0 0 1px #1F4FE0, 2px 2px 0px #0F1B33' : '2px 2px 0px #0F1B33',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1F4FE0',
                borderRadius: '4px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#5A6B87' }}>Invited</span>
              <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0F1B33', lineHeight: 1.1 }}>
                {counts.invited}
              </div>
            </div>
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F1B33' }}>→</span>
        </div>

        {/* Accepted Tab */}
        <div
          onClick={() => setActiveTab('accepted')}
          style={{
            background: '#FFFFFF',
            border: activeTab === 'accepted' ? '2px solid #1F4FE0' : '1.5px solid #0F1B33',
            padding: '1.25rem 1.4rem',
            boxShadow: activeTab === 'accepted' ? '0 0 0 1px #1F4FE0, 2px 2px 0px #0F1B33' : '2px 2px 0px #0F1B33',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1F4FE0',
                borderRadius: '4px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="16 10 11 15 8 12" />
              </svg>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#5A6B87' }}>Accepted</span>
              <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0F1B33', lineHeight: 1.1 }}>
                {counts.accepted}
              </div>
            </div>
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F1B33' }}>→</span>
        </div>

        {/* Declined Tab */}
        <div
          onClick={() => setActiveTab('declined')}
          style={{
            background: '#FFFFFF',
            border: activeTab === 'declined' ? '2px solid #1F4FE0' : '1.5px solid #0F1B33',
            padding: '1.25rem 1.4rem',
            boxShadow: activeTab === 'declined' ? '0 0 0 1px #1F4FE0, 2px 2px 0px #0F1B33' : '2px 2px 0px #0F1B33',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1F4FE0',
                borderRadius: '4px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#5A6B87' }}>Declined</span>
              <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0F1B33', lineHeight: 1.1 }}>
                {counts.declined}
              </div>
            </div>
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F1B33' }}>→</span>
        </div>
      </div>

      {/* Search and Filters — All items in a single line / row */}
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
        <div
          style={{
            flex: '1 1 200px',
            minWidth: '160px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            height: '38px',
          }}
        >
          <span style={{ position: 'absolute', left: '12px', color: '#5A6B87', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
            <IconSearch size={16} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search applications..."
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
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
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
          <option value="Frontend">Frontend</option>
          <option value="Backend">Backend</option>
          <option value="ML">ML</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
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
          <option value="Latest First">Latest First</option>
          <option value="Oldest First">Oldest First</option>
        </select>
      </div>

      {/* Applications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredApps.length === 0 ? (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              background: '#FFFFFF',
              border: '1.5px dashed #CBD5E1',
              color: '#64748B',
              fontSize: '0.92rem',
              fontWeight: '700',
            }}
          >
            No applications found in this section.
          </div>
        ) : (
          filteredApps.map((app) => (
            <div
              key={app.id}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #0F1B33',
                padding: '1.35rem 1.5rem',
                boxShadow: '2px 2px 0px #0F1B33',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.25rem',
              }}
            >
              {/* Corner brackets */}
              <CardCornerBrackets corners={['topLeft']} color="#1F4FE0" size={12} thickness={2.5} />
              <CardCornerBrackets corners={['bottomRight']} color="#1F4FE0" size={12} thickness={2.5} />

              {/* Left Item Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: '1 1 320px' }}>
                {/* Icon box */}
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: app.iconType === 'robot' ? '#FFFBEB' : '#EFF6FF',
                    border: `1px solid ${app.iconType === 'robot' ? '#FDE68A' : '#BFDBFE'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    flexShrink: 0,
                  }}
                >
                  {app.iconType === 'robot' ? (
                    <span style={{ fontSize: '1.4rem' }}>🤖</span>
                  ) : (
                    <span style={{ color: '#1F4FE0', fontFamily: 'var(--font-mono)', fontWeight: '900', fontSize: '1.1rem' }}>
                      &lt;/&gt;
                    </span>
                  )}
                </div>

                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0F1B33', margin: '0 0 0.35rem 0' }}>
                    {app.title}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700', marginBottom: '0.65rem' }}>
                    {app.role} • {app.time}
                  </div>
                  <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                    {app.tags.map((t, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.74rem',
                          padding: '2px 8px',
                          border: '1px solid #CBD5E1',
                          borderRadius: '2px',
                          backgroundColor: '#F8FAFC',
                          color: '#334155',
                          fontWeight: '700',
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Action Trigger & Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                {app.status === 'Sent' && (
                  <>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        backgroundColor: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        color: '#1E40AF',
                        fontWeight: '800',
                        fontSize: '0.82rem',
                        borderRadius: '999px',
                      }}
                    >
                      <span>↗</span> Sent
                    </span>
                    <button
                      type="button"
                      style={{
                        background: '#FFFFFF',
                        border: '1.5px solid #0F1B33',
                        padding: '6px 12px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      ...
                    </button>
                  </>
                )}

                {app.status === 'Invited' && (
                  <>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        backgroundColor: '#FFFBEB',
                        border: '1px solid #FDE68A',
                        color: '#B45309',
                        fontWeight: '800',
                        fontSize: '0.82rem',
                        borderRadius: '999px',
                      }}
                    >
                      <span>👥</span> Invited
                    </span>
                    <button
                      onClick={() => handleDecision(app.id, 'accept')}
                      type="button"
                      style={{
                        backgroundColor: '#1F4FE0',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '0.55rem 1.25rem',
                        fontWeight: '800',
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                        boxShadow: '2px 2px 0px #0F1B33',
                      }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDecision(app.id, 'decline')}
                      type="button"
                      style={{
                        backgroundColor: '#FFFFFF',
                        color: '#0F1B33',
                        border: '1.5px solid #0F1B33',
                        padding: '0.55rem 1.25rem',
                        fontWeight: '800',
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                        boxShadow: '2px 2px 0px #0F1B33',
                      }}
                    >
                      Decline
                    </button>
                  </>
                )}

                {app.status === 'Accepted' && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      backgroundColor: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      color: '#065F46',
                      fontWeight: '800',
                      fontSize: '0.82rem',
                      borderRadius: '999px',
                    }}
                  >
                    ✓ Accepted
                  </span>
                )}

                {app.status === 'Declined' && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FECACA',
                      color: '#991B1B',
                      fontWeight: '800',
                      fontSize: '0.82rem',
                      borderRadius: '999px',
                    }}
                  >
                    ✕ Declined
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

