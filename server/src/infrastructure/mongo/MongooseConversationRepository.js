import { ConversationRepository } from '../../ports/ConversationRepository.js';
import { Conversation } from '../../domain/messaging/Conversation.js';
import { ConversationModel } from './schemas/ConversationModel.js';

export class MongooseConversationRepository extends ConversationRepository {
  _toDomain(doc) {
    if (!doc) return null;
    return new Conversation({
      id: doc._id,
      participantIds: doc.participantIds,
      lastMessageAt: doc.lastMessageAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async save(conversation) {
    const data = {
      _id: conversation.id,
      participantIds: conversation.participantIds,
      lastMessageAt: conversation.lastMessageAt,
    };

    await ConversationModel.findByIdAndUpdate(
      conversation.id,
      { $set: data },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  async findById(id) {
    const doc = await ConversationModel.findById(id).lean();
    return this._toDomain(doc);
  }

  async findByParticipants(studentId1, studentId2) {
    const sorted = [String(studentId1), String(studentId2)].sort();
    const doc = await ConversationModel.findOne({
      participantIds: sorted,
    }).lean();
    return this._toDomain(doc);
  }

  async findByStudentId(studentId) {
    const docs = await ConversationModel.find({
      participantIds: String(studentId),
    })
      .sort({ lastMessageAt: -1 })
      .lean();

    return docs.map(d => this._toDomain(d));
  }
}
