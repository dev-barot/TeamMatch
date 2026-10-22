import { MessageRepository } from '../../ports/MessageRepository.js';
import { Message } from '../../domain/messaging/Message.js';
import { MessageModel } from './schemas/MessageModel.js';

export class MongooseMessageRepository extends MessageRepository {
  _toDomain(doc) {
    if (!doc) return null;
    return new Message({
      id: doc._id,
      conversationId: doc.conversationId,
      senderId: doc.senderId,
      content: doc.content,
      readAt: doc.readAt,
      createdAt: doc.createdAt,
    });
  }

  async save(message) {
    const data = {
      _id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      readAt: message.readAt,
    };

    await MessageModel.findByIdAndUpdate(
      message.id,
      { $set: data },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  async findByConversationId(conversationId, options = {}) {
    const limit = options.limit || 50;
    const docs = await MessageModel.find({ conversationId: String(conversationId) })
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean();

    return docs.map(d => this._toDomain(d));
  }

  async markConversationRead(conversationId, readerStudentId) {
    const res = await MessageModel.updateMany(
      {
        conversationId: String(conversationId),
        senderId: { $ne: String(readerStudentId) },
        readAt: null,
      },
      {
        $set: { readAt: new Date() },
      }
    );

    return res.modifiedCount || 0;
  }
}
