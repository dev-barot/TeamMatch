import { Message } from '../../domain/messaging/Message.js';
import { ConversationNotFoundError } from '../../domain/messaging/errors.js';

export class SendMessage {
  constructor({
    conversationRepository,
    messageRepository,
    realtimePublisher = null,
    notificationPublisher = null,
  }) {
    this.conversationRepo = conversationRepository;
    this.messageRepo = messageRepository;
    this.realtimePublisher = realtimePublisher;
    this.notificationPublisher = notificationPublisher;
  }

  async execute({ conversationId, senderId, content }) {
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) {
      throw new ConversationNotFoundError(conversationId);
    }

    // Authorization: Only participants can send messages
    conversation.assertParticipant(senderId);

    const message = new Message({
      conversationId: conversation.id,
      senderId,
      content,
    });

    await this.messageRepo.save(message);

    conversation.updateLastMessage(message.createdAt);
    await this.conversationRepo.save(conversation);

    const recipientId = conversation.getOtherParticipant(senderId);

    // Live socket delivery via RealtimePublisher port
    if (this.realtimePublisher) {
      this.realtimePublisher.emitToStudent(recipientId, 'message:new', message.toJSON());
    }

    // In-app notification for the recipient
    if (this.notificationPublisher) {
      await this.notificationPublisher.publish({
        recipientId,
        type: 'new_message',
        title: 'New Message',
        body: content.length > 60 ? `${content.substring(0, 57)}...` : content,
        link: `/conversations/${conversation.id}`,
      });
    }

    return message;
  }
}
