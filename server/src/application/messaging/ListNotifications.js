export class ListNotifications {
  constructor({ notificationRepository }) {
    this.notificationRepo = notificationRepository;
  }

  async execute({ studentId, limit = 30, unreadOnly = false }) {
    const notifications = await this.notificationRepo.findByStudentId(studentId, {
      limit,
      unreadOnly,
    });

    const allUnread = await this.notificationRepo.findByStudentId(studentId, {
      limit: 100,
      unreadOnly: true,
    });

    return {
      notifications,
      unreadCount: allUnread.length,
    };
  }
}
