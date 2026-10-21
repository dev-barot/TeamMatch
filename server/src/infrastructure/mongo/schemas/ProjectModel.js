import mongoose from 'mongoose';

const PositionSubSchema = new mongoose.Schema({
  id: { type: String, required: true },
  specialty: { type: String, required: true },
  headcount: { type: Number, required: true, min: 1 },
  filledCount: { type: Number, default: 0, min: 0 },
}, { _id: false });

const CourseTagSubSchema = new mongoose.Schema({
  courseCode: { type: String, default: '' },
  term: { type: String, default: '' },
}, { _id: false });

const ProjectSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
  description: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
  creatorId: { type: String, required: true, index: true },
  requiredSkills: [{ type: String, index: true }],
  positions: { type: [PositionSubSchema], required: true },
  commitmentLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  category: { type: String, default: 'Class Project' },
  courseTag: { type: CourseTagSubSchema, default: null },
  status: { type: String, enum: ['open', 'filled', 'closed'], default: 'open', index: true },
}, {
  timestamps: true,
  _id: false,
});

// Compound text index on title, description, and requiredSkills (Step 6)
ProjectSchema.index({
  title: 'text',
  description: 'text',
  requiredSkills: 'text',
}, {
  weights: {
    title: 5,
    requiredSkills: 3,
    description: 1,
  },
  name: 'ProjectTextSearchIndex',
});

// Additional index for newest-first sorting
ProjectSchema.index({ createdAt: -1 });

export const ProjectModel = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
