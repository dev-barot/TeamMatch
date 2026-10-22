import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  participantIds: {
    type: [{ type: String, required: true }],
    validate: [val => val.length === 2, 'Conversation must have exactly 2 participants.'],
  },
  lastMessageAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
  _id: false,
});

ConversationSchema.index({ participantIds: 1 });
ConversationSchema.index({ lastMessageAt: -1 });

export const ConversationModel = mongoose.model('Conversation', ConversationSchema);
