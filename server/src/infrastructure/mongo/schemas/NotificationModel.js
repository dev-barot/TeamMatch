import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  recipientId: { type: String, required: true, index: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, default: '' },
  link: { type: String, default: null },
  readAt: { type: Date, default: null },
}, {
  timestamps: true,
  _id: false,
});

NotificationSchema.index({ recipientId: 1, createdAt: -1 });

export const NotificationModel = mongoose.model('Notification', NotificationSchema);
