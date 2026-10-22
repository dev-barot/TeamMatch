export class MarkAllNotificationsRead {
  constructor({ notificationRepository }) {
    this.notificationRepo = notificationRepository;
  }

  async execute({ studentId }) {
    const count = await this.notificationRepo.markAllRead(studentId);
    return { count };
  }
}
