import { InMemoryConversationRepository } from '../../src/infrastructure/mongo/InMemoryConversationRepository.js';
import { InMemoryMessageRepository } from '../../src/infrastructure/mongo/InMemoryMessageRepository.js';
import { InMemoryNotificationRepository } from '../../src/infrastructure/mongo/InMemoryNotificationRepository.js';
import { InMemoryStudentRepository } from '../../src/infrastructure/mongo/InMemoryStudentRepository.js';
import { RealtimeNotificationPublisher } from '../../src/infrastructure/notifications/RealtimeNotificationPublisher.js';
import { RealtimePublisher } from '../../src/ports/RealtimePublisher.js';
import { Student } from '../../src/domain/identity/Student.js';
import { Account } from '../../src/domain/identity/Account.js';
import { Profile } from '../../src/domain/identity/Profile.js';
import { GetOrCreateConversation } from '../../src/application/messaging/GetOrCreateConversation.js';
import { SendMessage } from '../../src/application/messaging/SendMessage.js';
import { ListConversations } from '../../src/application/messaging/ListConversations.js';
import { ListMessages } from '../../src/application/messaging/ListMessages.js';
import { ListNotifications } from '../../src/application/messaging/ListNotifications.js';
import { MarkNotificationRead } from '../../src/application/messaging/MarkNotificationRead.js';
import { MarkAllNotificationsRead } from '../../src/application/messaging/MarkAllNotificationsRead.js';
import {
  UnauthorizedConversationActionError,
  InvalidConversationParticipantsError,
} from '../../src/domain/messaging/errors.js';

class MockRealtimePublisher extends RealtimePublisher {
  constructor() {
    super();
    this.events = [];
  }

  emitToStudent(studentId, event, data) {
    this.events.push({ studentId, event, data });
  }

  broadcast(event, data) {
    this.events.push({ broadcast: true, event, data });
  }
}

describe('Integration: Messaging & Notifications (M5)', () => {
  let convRepo;
  let messageRepo;
  let notifRepo;
  let studentRepo;
  let realtimePublisher;
  let notifPublisher;

  let getOrCreateConv;
  let sendMessage;
  let listConversations;
  let listMessages;
  let listNotifications;
  let markNotificationRead;
  let markAllNotificationsRead;

  let alice;
  let bob;
  let outsider;

  beforeEach(async () => {
    convRepo = new InMemoryConversationRepository();
    messageRepo = new InMemoryMessageRepository();
    notifRepo = new InMemoryNotificationRepository();
    studentRepo = new InMemoryStudentRepository();
    realtimePublisher = new MockRealtimePublisher();

    notifPublisher = new RealtimeNotificationPublisher({
      notificationRepository: notifRepo,
      realtimePublisher,
    });

    getOrCreateConv = new GetOrCreateConversation({
      conversationRepository: convRepo,
      studentRepository: studentRepo,
    });

    sendMessage = new SendMessage({
      conversationRepository: convRepo,
      messageRepository: messageRepo,
      realtimePublisher,
      notificationPublisher: notifPublisher,
    });

    listConversations = new ListConversations({
      conversationRepository: convRepo,
      studentRepository: studentRepo,
    });

    listMessages = new ListMessages({
      conversationRepository: convRepo,
      messageRepository: messageRepo,
    });

    listNotifications = new ListNotifications({
      notificationRepository: notifRepo,
    });

    markNotificationRead = new MarkNotificationRead({
      notificationRepository: notifRepo,
    });

    markAllNotificationsRead = new MarkAllNotificationsRead({
      notificationRepository: notifRepo,
    });

    // Seed students
    alice = new Student({
      id: 'alice',
      name: 'Alice Smith',
      account: new Account({ email: 'alice@uni.edu', passwordHash: 'hash', isEmailVerified: true }),
      profile: new Profile({ skills: ['React'], specialty: 'Frontend' }),
    });

    bob = new Student({
      id: 'bob',
      name: 'Bob Jones',
      account: new Account({ email: 'bob@uni.edu', passwordHash: 'hash', isEmailVerified: true }),
      profile: new Profile({ skills: ['Node.js'], specialty: 'Backend' }),
    });

    outsider = new Student({
      id: 'outsider',
      name: 'Eve Intruder',
      account: new Account({ email: 'eve@uni.edu', passwordHash: 'hash', isEmailVerified: true }),
      profile: new Profile({ skills: ['Security'], specialty: 'DevOps' }),
    });

    await studentRepo.save(alice);
    await studentRepo.save(bob);
    await studentRepo.save(outsider);
  });

  describe('GetOrCreateConversation', () => {
    it('creates a conversation and returns the same conversation regardless of order', async () => {
      const conv1 = await getOrCreateConv.execute({
        studentId: alice.id,
        recipientId: bob.id,
      });

      const conv2 = await getOrCreateConv.execute({
        studentId: bob.id,
        recipientId: alice.id,
      });

      expect(conv1.id).toBe(conv2.id);
      expect(conv1.participantIds).toEqual(['alice', 'bob']);
    });

    it('rejects creating a conversation with self', async () => {
      await expect(getOrCreateConv.execute({
        studentId: alice.id,
        recipientId: alice.id,
      })).rejects.toThrow(InvalidConversationParticipantsError);
    });
  });

  describe('SendMessage & ListMessages', () => {
    it('sends a message, emits realtime event, creates notification, and updates lastMessageAt', async () => {
      const conv = await getOrCreateConv.execute({
        studentId: alice.id,
        recipientId: bob.id,
      });

      const msg = await sendMessage.execute({
        conversationId: conv.id,
        senderId: alice.id,
        content: 'Hey Bob, would you like to join our project?',
      });

      expect(msg.content).toBe('Hey Bob, would you like to join our project?');

      // Check RealtimePublisher event was emitted to Bob
      const socketEvent = realtimePublisher.events.find(
        e => e.studentId === bob.id && e.event === 'message:new'
      );
      expect(socketEvent).toBeDefined();
      expect(socketEvent.data.content).toBe('Hey Bob, would you like to join our project?');

      // Check In-App Notification was generated for Bob
      const bobNotifications = await notifRepo.findByStudentId(bob.id);
      expect(bobNotifications.length).toBe(1);
      expect(bobNotifications[0].title).toBe('New Message');

      // Bob reads messages in conversation
      const messages = await listMessages.execute({
        conversationId: conv.id,
        studentId: bob.id,
      });

      expect(messages.length).toBe(1);
      expect(messages[0].isRead()).toBe(true);
    });

    it('prevents non-participants from sending or reading messages (403)', async () => {
      const conv = await getOrCreateConv.execute({
        studentId: alice.id,
        recipientId: bob.id,
      });

      // Outsider tries to send
      await expect(sendMessage.execute({
        conversationId: conv.id,
        senderId: outsider.id,
        content: 'Sneaking in...',
      })).rejects.toThrow(UnauthorizedConversationActionError);

      // Outsider tries to read
      await expect(listMessages.execute({
        conversationId: conv.id,
        studentId: outsider.id,
      })).rejects.toThrow(UnauthorizedConversationActionError);
    });

    it('ListConversations returns list of conversations with counterparty profile', async () => {
      const conv = await getOrCreateConv.execute({
        studentId: alice.id,
        recipientId: bob.id,
      });

      await sendMessage.execute({
        conversationId: conv.id,
        senderId: alice.id,
        content: 'Hello!',
      });

      const aliceConversations = await listConversations.execute({ studentId: alice.id });
      expect(aliceConversations.length).toBe(1);
      expect(aliceConversations[0].otherParticipant.id).toBe(bob.id);
      expect(aliceConversations[0].otherParticipant.name).toBe('Bob Jones');
    });
  });

  describe('Notifications', () => {
    it('lists and marks notifications as read', async () => {
      await notifPublisher.publish({
        recipientId: alice.id,
        type: 'application_decided',
        title: 'Application Accepted',
        body: 'You were accepted as a Frontend Member!',
      });

      await notifPublisher.publish({
        recipientId: alice.id,
        type: 'new_message',
        title: 'New Message',
        body: 'Welcome to the team!',
      });

      const initial = await listNotifications.execute({ studentId: alice.id });
      expect(initial.unreadCount).toBe(2);
      expect(initial.notifications.length).toBe(2);

      // Mark single read
      await markNotificationRead.execute({
        notificationId: initial.notifications[0].id,
        studentId: alice.id,
      });

      const afterOne = await listNotifications.execute({ studentId: alice.id });
      expect(afterOne.unreadCount).toBe(1);

      // Mark all read
      await markAllNotificationsRead.execute({ studentId: alice.id });

      const finalState = await listNotifications.execute({ studentId: alice.id });
      expect(finalState.unreadCount).toBe(0);
    });
  });
});
