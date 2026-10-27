import React, { useState, useEffect, useRef } from 'react';
import { messagingApi } from '../../api/messagingApi.js';
import { getSocket } from '../../api/socketClient.js';

export function ChatModal({
  isOpen,
  onClose,
  currentStudent,
  initialCounterparty = null,
}) {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputContent, setInputContent] = useState('');
  const [loadingConv, setLoadingConv] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of message thread
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations list
  const loadConversations = async (selectTargetId = null) => {
    setLoadingConv(true);
    try {
      const list = await messagingApi.listConversations();
      setConversations(list);

      if (selectTargetId) {
        const found = list.find((c) => c.otherParticipant?.id === selectTargetId);
        if (found) {
          setActiveConversation(found);
        }
      } else if (list.length > 0 && !activeConversation) {
        setActiveConversation(list[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingConv(false);
    }
  };

  // Open & initialize conversation
  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    if (initialCounterparty && initialCounterparty.id) {
      // Get or start conversation with counterparty
      (async () => {
        setLoadingConv(true);
        try {
          const conv = await messagingApi.startConversation(initialCounterparty.id);
          const fullConv = {
            id: conv.id,
            participantIds: conv.participantIds,
            otherParticipant: initialCounterparty,
          };
          setActiveConversation(fullConv);
          await loadConversations(initialCounterparty.id);
        } catch (err) {
          setError(err.message);
          setLoadingConv(false);
        }
      })();
    } else {
      loadConversations();
    }
  }, [isOpen, initialCounterparty]);

  // Load messages whenever activeConversation changes
  useEffect(() => {
    if (!activeConversation) return;

    let isMounted = true;
    (async () => {
      setLoadingMessages(true);
      try {
        const msgs = await messagingApi.listMessages(activeConversation.id);
        if (isMounted) setMessages(msgs);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoadingMessages(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [activeConversation]);

  // Socket realtime message listener
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (activeConversation && msg.conversationId === activeConversation.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
      // Refresh conversation list to bump recent message
      loadConversations();
    };

    socket.on('message:new', handleNewMessage);

    return () => {
      socket.off('message:new', handleNewMessage);
    };
  }, [activeConversation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputContent.trim() || !activeConversation || sending) return;

    const contentToSend = inputContent.trim();
    setInputContent('');
    setSending(true);

    try {
      const saved = await messagingApi.sendMessage(activeConversation.id, contentToSend);
      setMessages((prev) => [...prev, saved]);
    } catch (err) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(6px)',
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '860px',
          height: '620px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Sidebar: Conversations List */}
        <div
          style={{
            width: '280px',
            borderRight: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            background: '#f8fafc',
          }}
        >
          <div
            style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#ffffff',
            }}
          >
            <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a' }}>
              💬 Messages
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#2563eb',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                fontWeight: '600',
                padding: '2px 8px',
                borderRadius: '999px',
              }}
            >
              {conversations.length}
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingConv && conversations.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                Loading chats...
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                No active conversations yet. Start one from a project or candidate card!
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = activeConversation?.id === conv.id;
                const other = conv.otherParticipant || {};
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConversation(conv)}
                    style={{
                      padding: '0.85rem 1rem',
                      borderBottom: '1px solid #e2e8f0',
                      background: isSelected ? '#eff6ff' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                      borderLeft: isSelected ? '3px solid #2563eb' : '3px solid transparent',
                    }}
                  >
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: isSelected ? '#1d4ed8' : '#0f172a' }}>
                      {other.name || 'Student'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: isSelected ? '#dbeafe' : '#f1f5f9',
                          color: isSelected ? '#1e40af' : '#475569',
                          fontWeight: '500',
                        }}
                      >
                        {other.specialty || 'General'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Chat Window */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#ffffff',
                }}
              >
                <div>
                  <div style={{ fontWeight: '700', fontSize: '1rem', color: '#0f172a' }}>
                    {activeConversation.otherParticipant?.name || 'Student'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {activeConversation.otherParticipant?.specialty} · Live Encrypted Channel
                  </div>
                </div>
                <button
                  onClick={onClose}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    color: '#64748b',
                    fontSize: '1rem',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Close chat"
                >
                  ✕
                </button>
              </div>

              {/* Messages Thread */}
              <div
                style={{
                  flex: 1,
                  padding: '1.25rem',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  background: '#f8fafc',
                }}
              >
                {loadingMessages ? (
                  <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem', marginTop: '2rem' }}>
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem', marginTop: '3rem' }}>
                    👋 Say hello to begin the conversation!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === currentStudent?.id;
                    const date = new Date(msg.createdAt);
                    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div
                        key={msg.id}
                        style={{
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          maxWidth: '75%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMe ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div
                          style={{
                            padding: '0.65rem 0.95rem',
                            borderRadius: '10px',
                            background: isMe ? '#2563eb' : '#ffffff',
                            color: isMe ? '#ffffff' : '#0f172a',
                            fontSize: '0.9rem',
                            lineHeight: '1.4',
                            wordBreak: 'break-word',
                            border: isMe ? 'none' : '1px solid #e2e8f0',
                            boxShadow: isMe ? '0 2px 6px rgba(37, 99, 235, 0.25)' : 'var(--shadow-sm)',
                          }}
                        >
                          {msg.content}
                        </div>
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '3px', padding: '0 4px' }}>
                          {timeStr}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: '1rem',
                  borderTop: '1px solid #e2e8f0',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="text"
                    value={inputContent}
                    onChange={(e) => setInputContent(e.target.value)}
                    placeholder="Type a message (max 2000 chars)..."
                    maxLength={2000}
                    style={{
                      width: '100%',
                      padding: '0.7rem 1rem',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                  {inputContent.length > 1500 && (
                    <span
                      style={{
                        position: 'absolute',
                        right: '10px',
                        bottom: '8px',
                        fontSize: '0.65rem',
                        color: inputContent.length > 1950 ? '#dc2626' : '#d97706',
                      }}
                    >
                      {inputContent.length}/2000
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!inputContent.trim() || sending}
                  style={{
                    padding: '0.7rem 1.25rem',
                    borderRadius: '8px',
                    background: inputContent.trim() ? '#2563eb' : '#94a3b8',
                    color: '#ffffff',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    cursor: inputContent.trim() ? 'pointer' : 'not-allowed',
                    border: 'none',
                    boxShadow: inputContent.trim() ? '0 2px 6px rgba(37, 99, 235, 0.25)' : 'none',
                  }}
                >
                  {sending ? '...' : 'Send'}
                </button>
              </form>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                gap: '0.5rem',
              }}
            >
              <span style={{ fontSize: '2.5rem' }}>💬</span>
              <span style={{ fontSize: '0.95rem' }}>Select a conversation to start messaging</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
