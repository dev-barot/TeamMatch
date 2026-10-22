export class MessagingDomainError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidConversationParticipantsError extends MessagingDomainError {
  constructor(message = 'A Conversation must have exactly two distinct Students.') {
    super(message);
  }
}

export class UnauthorizedConversationActionError extends MessagingDomainError {
  constructor(message = 'Only Conversation participants can read or send messages.') {
    super(message);
  }
}

export class InvalidMessageContentError extends MessagingDomainError {
  constructor(message = 'Message content must be non-empty and cannot exceed 2000 characters.') {
    super(message);
  }
}

export class ConversationNotFoundError extends MessagingDomainError {
  constructor(id) {
    super(`Conversation with ID "${id}" was not found.`);
  }
}

export class NotificationNotFoundError extends MessagingDomainError {
  constructor(id) {
    super(`Notification with ID "${id}" was not found.`);
  }
}
