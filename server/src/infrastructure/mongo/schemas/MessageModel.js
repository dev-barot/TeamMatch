import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  conversationId: { type: String, required: true, index: true },
  senderId: { type: String, required: true },
  content: { type: String, required: true, maxLength: 2000 },
  readAt: { type: Date, default: null },
}, {
  timestamps: true,
  _id: false,
});

MessageSchema.index({ conversationId: 1, createdAt: 1 });

export const MessageModel = mongoose.model('Message', MessageSchema);
