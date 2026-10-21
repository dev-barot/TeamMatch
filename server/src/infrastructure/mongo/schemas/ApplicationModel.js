import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  projectId: { type: String, required: true, index: true },
  studentId: { type: String, required: true, index: true },
  specialty: { type: String, required: true },
  origin: { type: String, enum: ['applied', 'invited'], default: 'applied' },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Withdrawn'],
    default: 'Pending',
    index: true,
  },
  notes: { type: String, default: '', maxLength: 1000 },
  rejectionReason: { type: String, default: null },
}, {
  timestamps: true,
  _id: false,
});

// Partial unique compound index enforcing Rule R1 at the database layer:
// At most one Pending or Accepted Application per (projectId, studentId)
ApplicationSchema.index(
  { projectId: 1, studentId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['Pending', 'Accepted'] } },
  }
);

export const ApplicationModel = mongoose.model('Application', ApplicationSchema);
