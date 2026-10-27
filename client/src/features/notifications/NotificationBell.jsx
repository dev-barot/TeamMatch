import React, { useState, useEffect, useRef } from 'react';
import { messagingApi } from '../../api/messagingApi.js';
import { getSocket } from '../../api/socketClient.js';

export function NotificationBell({ onNavigateToLink }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const data = await messagingApi.listNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Graceful fallback if offline
    }
  };

  useEffect(() => {
    fetchNotifications();

    const socket = getSocket();
    if (!socket) return;

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, []);

  // Dismiss dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      await messagingApi.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const handleItemClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await messagingApi.markNotificationRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to mark notification read:', err);
      }
    }
    if (notif.link && onNavigateToLink) {
      setIsOpen(false);
      onNavigateToLink(notif.link);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
        style={{
          position: 'relative',
          padding: '0.45rem 0.65rem',
          borderRadius: '8px',
          background: isOpen ? '#eff6ff' : '#ffffff',
          border: '1px solid #cbd5e1',
          color: '#0f172a',
          fontSize: '1.05rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: '700',
              padding: '1px 5px',
              borderRadius: '999px',
              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
              minWidth: '18px',
              textAlign: 'center',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            marginTop: '0.5rem',
            width: '340px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#ffffff',
            }}
          >
            <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  fontSize: '0.75rem',
                  color: '#1d4ed8',
                  fontWeight: '600',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  cursor: 'pointer',
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  color: '#64748b',
                  fontSize: '0.85rem',
                }}
              >
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid #f1f5f9',
                    background: notif.isRead ? '#ffffff' : '#eff6ff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = notif.isRead ? '#f8fafc' : '#dbeafe';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = notif.isRead ? '#ffffff' : '#eff6ff';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontWeight: notif.isRead ? '600' : '700',
                        fontSize: '0.85rem',
                        color: notif.isRead ? '#334155' : '#1e3a8a',
                      }}
                    >
                      {notif.title}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      {formatTime(notif.createdAt)}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: notif.isRead ? '#64748b' : '#334155',
                      lineHeight: '1.3',
                      margin: 0,
                    }}
                  >
                    {notif.body}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
