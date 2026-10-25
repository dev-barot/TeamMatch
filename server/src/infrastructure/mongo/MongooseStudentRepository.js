import { StudentRepository } from '../../ports/StudentRepository.js';
import { Student } from '../../domain/identity/Student.js';
import { Account } from '../../domain/identity/Account.js';
import { Profile } from '../../domain/identity/Profile.js';
import { StudentModel } from './schemas/StudentModel.js';

export class MongooseStudentRepository extends StudentRepository {
  _toDomain(doc) {
    if (!doc) return null;
    const account = new Account({
      email: doc.email,
      passwordHash: doc.passwordHash,
      accountType: doc.accountType,
      isEmailVerified: doc.isEmailVerified,
      isActive: doc.isActive,
      verificationToken: doc.verificationToken,
      verificationTokenExpiresAt: doc.verificationTokenExpiresAt,
      resetPasswordToken: doc.resetPasswordToken,
      resetPasswordTokenExpiresAt: doc.resetPasswordTokenExpiresAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });

    const profile = new Profile(doc.profile || {});

    return new Student({
      id: doc._id,
      name: doc.name,
      account,
      profile,
    });
  }

  async save(student) {
    const data = {
      _id: student.id,
      name: student.name,
      email: student.account.email,
      passwordHash: student.account.passwordHash,
      accountType: student.account.accountType,
      isEmailVerified: student.account.isEmailVerified,
      isActive: student.account.isActive,
      verificationToken: student.account.verificationToken,
      verificationTokenExpiresAt: student.account.verificationTokenExpiresAt,
      resetPasswordToken: student.account.resetPasswordToken,
      resetPasswordTokenExpiresAt: student.account.resetPasswordTokenExpiresAt,
      profile: student.profile.toJSON(),
    };

    await StudentModel.findByIdAndUpdate(
      student.id,
      { $set: data },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  async findById(id) {
    const doc = await StudentModel.findById(id).lean();
    return this._toDomain(doc);
  }

  async findByEmail(email) {
    const doc = await StudentModel.findOne({ email: email.trim().toLowerCase() }).lean();
    return this._toDomain(doc);
  }

  async findByVerificationToken(token) {
    const doc = await StudentModel.findOne({ verificationToken: token }).lean();
    return this._toDomain(doc);
  }

  async findByResetToken(token) {
    const doc = await StudentModel.findOne({ resetPasswordToken: token }).lean();
    return this._toDomain(doc);
  }

  async findAllVerified(filters = {}) {
    const query = { isEmailVerified: true, isActive: true };
    if (filters.excludeIds && filters.excludeIds.length > 0) {
      query._id = { $nin: filters.excludeIds };
    }
    const docs = await StudentModel.find(query)
      .limit(filters.limit || 100)
      .lean();

    return docs.map(d => this._toDomain(d));
  }

  /**
   * Admin: list ALL accounts (any status) with pagination.
   */
  async findAll(filters = {}) {
    const offset = filters.offset || 0;
    const limit = Math.min(filters.limit || 50, 100);
    const docs = await StudentModel.find({})
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();
    return docs.map(d => this._toDomain(d));
  }
}

