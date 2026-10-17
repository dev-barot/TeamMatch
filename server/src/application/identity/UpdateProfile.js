import { InvalidTokenError } from '../../domain/identity/errors.js';

export class UpdateProfile {
  constructor({ studentRepository }) {
    this.studentRepo = studentRepository;
  }

  async execute({ studentId, requesterId, profileData }) {
    const student = await this.studentRepo.findById(studentId);
    if (!student) {
      throw new InvalidTokenError('Student not found.');
    }

    // Enforces R2: Student edits only their own Profile
    student.updateProfile(profileData, requesterId);
    await this.studentRepo.save(student);

    return student.toPrivateView();
  }
}
