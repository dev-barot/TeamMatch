import { StudentRepository } from '../../ports/StudentRepository.js';

export class InMemoryStudentRepository extends StudentRepository {
  constructor() {
    super();
    this.students = new Map();
  }

  async save(student) {
    this.students.set(student.id, student);
  }

  async findById(id) {
    return this.students.get(String(id)) || null;
  }

  async findByEmail(email) {
    const target = email.trim().toLowerCase();
    for (const student of this.students.values()) {
      if (student.account.email === target) {
        return student;
      }
    }
    return null;
  }

  async findByVerificationToken(token) {
    for (const student of this.students.values()) {
      if (student.account.verificationToken === token) {
        return student;
      }
    }
    return null;
  }

  async findByResetToken(token) {
    for (const student of this.students.values()) {
      if (student.account.resetPasswordToken === token) {
        return student;
      }
    }
    return null;
  }

  clear() {
    this.students.clear();
  }
}
