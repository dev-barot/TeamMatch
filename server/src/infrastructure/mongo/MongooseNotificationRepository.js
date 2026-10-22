import { NotificationRepository } from '../../ports/NotificationRepository.js';
import { Notification } from '../../domain/messaging/Notification.js';
import { NotificationModel } from './schemas/NotificationModel.js';

export class MongooseNotificationRepository extends NotificationRepository {
  _toDomain(doc) {
    if (!doc) return null;
    return new Notification({
      id: doc._id,
      recipientId: doc.recipientId,
      type: doc.type,
      title: doc.title,
      body: doc.body,
      link: doc.link,
      readAt: doc.readAt,
      createdAt: doc.createdAt,
    });
  }

  async save(notification) {
    const data = {
      _id: notification.id,
      recipientId: notification.recipientId,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      link: notification.link,
      readAt: notification.readAt,
    };

    await NotificationModel.findByIdAndUpdate(
      notification.id,
      { $set: data },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  async findById(id) {
    const doc = await NotificationModel.findById(id).lean();
    return this._toDomain(doc);
  }

  async findByStudentId(studentId, options = {}) {
    const limit = options.limit || 30;
    const query = { recipientId: String(studentId) };
    if (options.unreadOnly) {
      query.readAt = null;
    }

    const docs = await NotificationModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return docs.map(d => this._toDomain(d));
  }

  async markRead(id, studentId) {
    const doc = await NotificationModel.findOneAndUpdate(
      { _id: String(id), recipientId: String(studentId) },
      { $set: { readAt: new Date() } },
      { new: true }
    ).lean();

    return this._toDomain(doc);
  }

  async markAllRead(studentId) {
    const res = await NotificationModel.updateMany(
      { recipientId: String(studentId), readAt: null },
      { $set: { readAt: new Date() } }
    );

    return res.modifiedCount || 0;
  }
}
