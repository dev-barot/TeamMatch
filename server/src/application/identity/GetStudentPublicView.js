import { InvalidTokenError } from '../../domain/identity/errors.js';

export class GetStudentPublicView {
  constructor({ studentRepository }) {
    this.studentRepo = studentRepository;
  }

  async execute({ targetStudentId }) {
    const student = await this.studentRepo.findById(targetStudentId);
    if (!student) {
      throw new InvalidTokenError('Student not found.');
    }

    return student.toPublicView();
  }
}
