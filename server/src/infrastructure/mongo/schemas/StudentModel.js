import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  accountType: { type: String, enum: ['student', 'admin'], default: 'student' },
  isEmailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  verificationToken: { type: String, default: null, index: true },
  verificationTokenExpiresAt: { type: Date, default: null },
  resetPasswordToken: { type: String, default: null, index: true },
  resetPasswordTokenExpiresAt: { type: Date, default: null },
  profile: {
    skills: [{ type: String }],
    specialty: { type: String, default: 'Other' },
    weeklyAvailability: { type: Number, default: 10 },
    timezone: { type: String, default: 'UTC' },
    workingStyle: { type: String, default: 'collaborative' },
    experienceLevel: { type: String, default: 'intermediate' },
    bio: { type: String, default: '', maxLength: 500 },
  },
}, {
  timestamps: true,
  _id: false,
});

export const StudentModel = mongoose.model('Student', StudentSchema);
