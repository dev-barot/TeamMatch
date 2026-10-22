import { Conversation } from '../../src/domain/messaging/Conversation.js';
import { Message } from '../../src/domain/messaging/Message.js';
import { Notification } from '../../src/domain/messaging/Notification.js';
import {
  InvalidConversationParticipantsError,
  UnauthorizedConversationActionError,
  InvalidMessageContentError,
} from '../../src/domain/messaging/errors.js';

describe('Domain: Messaging & Notification Entities (M5)', () => {
  describe('Conversation', () => {
    it('creates a conversation with sorted canonical participant IDs', () => {
      const conv = new Conversation({
        participantIds: ['student-bob', 'student-alice'],
      });

      expect(conv.participantIds).toEqual(['student-alice', 'student-bob']);
      expect(conv.isParticipant('student-alice')).toBe(true);
      expect(conv.isParticipant('student-bob')).toBe(true);
      expect(conv.isParticipant('student-charlie')).toBe(false);
    });

    it('rejects conversations with less than or more than 2 participants', () => {
      expect(() => new Conversation({ participantIds: ['only-one'] }))
        .toThrow(InvalidConversationParticipantsError);

      expect(() => new Conversation({ participantIds: ['p1', 'p2', 'p3'] }))
        .toThrow(InvalidConversationParticipantsError);

      expect(() => new Conversation({ participantIds: [] }))
        .toThrow(InvalidConversationParticipantsError);
    });

    it('rejects conversations where both participants are the same student', () => {
      expect(() => new Conversation({ participantIds: ['alice', 'alice'] }))
        .toThrow(InvalidConversationParticipantsError);
    });

    it('assertParticipant throws UnauthorizedConversationActionError for outsiders', () => {
      const conv = new Conversation({ participantIds: ['alice', 'bob'] });

      expect(() => conv.assertParticipant('alice')).not.toThrow();
      expect(() => conv.assertParticipant('bob')).not.toThrow();
      expect(() => conv.assertParticipant('charlie'))
        .toThrow(UnauthorizedConversationActionError);
    });

    it('getOtherParticipant returns the counterparty student ID', () => {
      const conv = new Conversation({ participantIds: ['alice', 'bob'] });
      expect(conv.getOtherParticipant('alice')).toBe('bob');
      expect(conv.getOtherParticipant('bob')).toBe('alice');
    });

    it('updates lastMessageAt timestamp', () => {
      const conv = new Conversation({ participantIds: ['alice', 'bob'] });
      const newDate = new Date('2026-10-22T12:00:00Z');
      conv.updateLastMessage(newDate);

      expect(conv.lastMessageAt).toEqual(newDate);
    });
  });

  describe('Message', () => {
    it('creates a valid message and marks it as read', () => {
      const msg = new Message({
        conversationId: 'c1',
        senderId: 'alice',
        content: 'Hey, I saw your project posting on TeamMatch!',
      });

      expect(msg.content).toBe('Hey, I saw your project posting on TeamMatch!');
      expect(msg.isRead()).toBe(false);

      msg.markAsRead();
      expect(msg.isRead()).toBe(true);
      expect(msg.readAt).toBeInstanceOf(Date);
    });

    it('rejects empty or whitespace-only messages', () => {
      expect(() => new Message({ conversationId: 'c1', senderId: 'alice', content: '' }))
        .toThrow(InvalidMessageContentError);

      expect(() => new Message({ conversationId: 'c1', senderId: 'alice', content: '   ' }))
        .toThrow(InvalidMessageContentError);
    });

    it('rejects messages exceeding 2000 characters', () => {
      const longText = 'a'.repeat(2001);
      expect(() => new Message({ conversationId: 'c1', senderId: 'alice', content: longText }))
        .toThrow(InvalidMessageContentError);
    });
  });

  describe('Notification', () => {
    it('creates an in-app notification and marks it as read', () => {
      const notif = new Notification({
        recipientId: 'bob',
        type: 'application_received',
        title: 'New Applicant',
        body: 'Alice applied for the Backend position.',
        link: '/projects/p1',
      });

      expect(notif.isRead()).toBe(false);
      expect(notif.title).toBe('New Applicant');

      notif.markAsRead();
      expect(notif.isRead()).toBe(true);
      expect(notif.readAt).toBeInstanceOf(Date);
    });

    it('rejects notification without required fields', () => {
      expect(() => new Notification({ recipientId: '', type: 'test', title: 'title' }))
        .toThrow('Notification recipientId is required.');

      expect(() => new Notification({ recipientId: 'bob', type: '', title: 'title' }))
        .toThrow('Notification type is required.');

      expect(() => new Notification({ recipientId: 'bob', type: 'test', title: '   ' }))
        .toThrow('Notification title cannot be empty.');
    });
  });
});
