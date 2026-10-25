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

  async findAllVerified(filters = {}) {
    const results = [];
    const excludeIds = new Set((filters.excludeIds || []).map(String));

    for (const student of this.students.values()) {
      if (student.account.isEmailVerified && student.account.isActive) {
        if (!excludeIds.has(String(student.id))) {
          results.push(student);
        }
      }
    }
    return results;
  }

  async findAll(filters = {}) {
    const results = Array.from(this.students.values());
    // Sort newest first by account createdAt
    results.sort((a, b) => b.account.createdAt - a.account.createdAt);
    const offset = filters.offset || 0;
    const limit = filters.limit || 50;
    return results.slice(offset, offset + limit);
  }

  clear() {
    this.students.clear();
  }
}
