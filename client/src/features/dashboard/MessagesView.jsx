import React, { useState, useRef, useEffect } from 'react';
import { IsometricBuilding, GeometricAccents, CardCornerBrackets } from './ArchitecturalGraphics.jsx';

export function MessagesView() {
  const [activeConvId, setActiveConvId] = useState('aisha');
  const [inputText, setInputText] = useState('');

  const [conversations, setConversations] = useState([
    {
      id: 'aisha',
      name: 'Aisha Patel',
      project: 'Code Editor',
      initials: 'AP',
      time: 'Now',
      unread: true,
      messages: [
        {
          id: 1,
          sender: 'them',
          text: 'Hi Dev, we saw your application. Can you share a GitHub link?',
          time: '10:24 AM',
        },
        {
          id: 2,
          sender: 'me',
          text: 'Sure, sending it now.',
          time: '10:26 AM',
        },
        {
          id: 3,
          sender: 'them',
          text: 'Great! Also, are you available for a quick call this week to discuss the project details?',
          time: '10:28 AM',
        },
        {
          id: 4,
          sender: 'me',
          text: "Yes, I'm free on Thursday after 4 PM. Does that work for you?",
          time: '10:30 AM',
        },
      ],
    },
    {
      id: 'rover',
      name: 'Rover Team',
      project: 'Delivery Rover',
      initials: 'RT',
      time: '2h ago',
      unread: false,
      messages: [
        {
          id: 1,
          sender: 'them',
          text: 'Hello Dev! We were very impressed by your background in ROS2.',
          time: '8:45 AM',
        },
      ],
    },
    {
      id: 'meera',
      name: 'Meera Kapoor',
      project: 'Study Scheduler',
      initials: 'MK',
      time: 'Yesterday',
      unread: false,
      messages: [
        {
          id: 1,
          sender: 'them',
          text: 'Hi! Are you still open to helping out with the frontend?',
          time: 'Yesterday',
        },
      ],
    },
  ]);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations((prev) =>
      prev.map((c) => (c.id === activeConvId ? { ...c, messages: [...c.messages, newMsg] } : c))
    );
    setInputText('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ color: '#F59E0B', fontSize: '0.85rem' }}>◆</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: '700', letterSpacing: '0.08em', color: '#1F4FE0' }}>
              05 / MESSAGES
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#1F4FE0', letterSpacing: '-0.02em', margin: '0 0 0.35rem 0' }}>
            Messages
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#5A6B87', margin: 0 }}>
            Connect and collaborate with your potential teammates.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <GeometricAccents size={16} />
          <IsometricBuilding width={190} height={95} />
        </div>
      </div>

      {/* Split Pane Chat Box */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1.5px solid #0F1B33',
          boxShadow: '2px 2px 0px #0F1B33',
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: 'minmax(260px, 310px) minmax(0, 1fr)',
          minHeight: '520px',
        }}
      >
        <CardCornerBrackets corners={['topLeft']} color="#1F4FE0" size={14} thickness={2.5} />

        {/* Left: Conversations list */}
        <div style={{ borderRight: '1.5px solid #0F1B33', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
          {conversations.map((c) => {
            const isSelected = c.id === activeConvId;
            return (
              <div
                key={c.id}
                onClick={() => setActiveConvId(c.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem 1.15rem',
                  borderBottom: '1px solid #EEF2F6',
                  backgroundColor: isSelected ? '#EEF3FF' : '#FFFFFF',
                  borderLeft: isSelected ? '4px solid #1F4FE0' : '4px solid transparent',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.15s ease',
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#EFF6FF',
                    border: '1.5px solid #BFDBFE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '0.82rem',
                    color: '#1F4FE0',
                    flexShrink: 0,
                  }}
                >
                  {c.initials}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontWeight: '800', fontSize: '0.88rem', color: '#0F1B33' }}>
                      {c.name}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600' }}>
                      {c.time}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.project}
                  </div>
                </div>

                {c.unread && (
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#1F4FE0',
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Active Chat Thread */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <div
            style={{
              padding: '0.85rem 1.25rem',
              borderBottom: '1.5px solid #0F1B33',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#EFF6FF',
                  border: '1.5px solid #BFDBFE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '0.82rem',
                  color: '#1F4FE0',
                }}
              >
                {activeConv.initials}
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0F1B33' }}>
                  {activeConv.name}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                  {activeConv.project}
                </div>
              </div>
              <span
                style={{
                  marginLeft: '0.5rem',
                  padding: '2px 8px',
                  border: '1px solid #CBD5E1',
                  borderRadius: '2px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  backgroundColor: '#FFFFFF',
                  color: '#0F1B33',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span style={{ color: '#F59E0B' }}>◆</span> {activeConv.project}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                style={{
                  padding: '5px 12px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #0F1B33',
                  fontWeight: '700',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                }}
              >
                Report user
              </button>
              <button
                type="button"
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #0F1B33',
                  fontWeight: '700',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                }}
              >
                ...
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div
            style={{
              flex: 1,
              padding: '1.5rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              backgroundColor: '#FFFFFF',
            }}
          >
            {activeConv.messages.map((m) => {
              const isMe = m.sender === 'me';
              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', maxWidth: '75%' }}>
                    {!isMe && (
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: '#EFF6FF',
                          border: '1px solid #BFDBFE',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: '800',
                          color: '#1F4FE0',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        {activeConv.initials}
                      </div>
                    )}

                    <div
                      style={{
                        padding: '0.75rem 1.15rem',
                        backgroundColor: isMe ? '#1F4FE0' : '#F1F4F9',
                        color: isMe ? '#FFFFFF' : '#0F1B33',
                        borderRadius: isMe ? '8px 8px 1px 8px' : '8px 8px 8px 1px',
                        fontSize: '0.88rem',
                        lineHeight: 1.45,
                        fontWeight: '500',
                        boxShadow: isMe ? '1px 1px 0px #0F1B33' : 'none',
                      }}
                    >
                      {m.text}
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.7rem',
                      color: '#8F9FB8',
                      fontWeight: '600',
                      marginTop: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {m.time} {isMe && <span style={{ color: '#1F4FE0', fontWeight: '800' }}>✓✓</span>}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer Input Footer */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '0.85rem 1.25rem',
              borderTop: '1.5px solid #0F1B33',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              backgroundColor: '#FFFFFF',
            }}
          >
            <button
              type="button"
              style={{
                width: '38px',
                height: '38px',
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #0F1B33',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1.1rem',
                flexShrink: 0,
              }}
              title="Attach file"
            >
              📎
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Write a message..."
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                border: '1.5px solid #0F1B33',
                borderRadius: '0px',
                fontSize: '0.88rem',
                outline: 'none',
                fontFamily: 'var(--font-sans)',
              }}
            />

            <button
              type="submit"
              style={{
                padding: '0.65rem 1.5rem',
                backgroundColor: '#1F4FE0',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: '800',
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: '2px 2px 0px #0F1B33',
              }}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
