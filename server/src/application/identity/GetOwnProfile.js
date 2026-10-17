import { InvalidTokenError } from '../../domain/identity/errors.js';

export class GetOwnProfile {
  constructor({ studentRepository }) {
    this.studentRepo = studentRepository;
  }

  async execute({ studentId }) {
    const student = await this.studentRepo.findById(studentId);
    if (!student) {
      throw new InvalidTokenError('Student not found.');
    }

    return student.toPrivateView();
  }
}
