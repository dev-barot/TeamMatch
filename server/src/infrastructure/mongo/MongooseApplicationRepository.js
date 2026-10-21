import { ApplicationRepository } from '../../ports/ApplicationRepository.js';
import { Application } from '../../domain/applications/Application.js';
import { DuplicateApplicationError } from '../../domain/applications/errors.js';
import { ApplicationModel } from './schemas/ApplicationModel.js';

export class MongooseApplicationRepository extends ApplicationRepository {
  _toDomain(doc) {
    if (!doc) return null;
    return new Application({
      id: doc._id,
      projectId: doc.projectId,
      studentId: doc.studentId,
      specialty: doc.specialty,
      origin: doc.origin,
      status: doc.status,
      notes: doc.notes,
      rejectionReason: doc.rejectionReason,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async save(application) {
    const data = {
      _id: application.id,
      projectId: application.projectId,
      studentId: application.studentId,
      specialty: application.specialty,
      origin: application.origin,
      status: application.status,
      notes: application.notes,
      rejectionReason: application.rejectionReason,
    };

    try {
      await ApplicationModel.findByIdAndUpdate(
        application.id,
        { $set: data },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } catch (err) {
      if (err.code === 11000) {
        throw new DuplicateApplicationError(application.projectId, application.studentId);
      }
      throw err;
    }
  }

  async findById(id) {
    const doc = await ApplicationModel.findById(id).lean();
    return this._toDomain(doc);
  }

  async findActiveByProjectAndStudent(projectId, studentId) {
    const doc = await ApplicationModel.findOne({
      projectId,
      studentId,
      status: { $in: ['Pending', 'Accepted'] },
    }).lean();
    return this._toDomain(doc);
  }

  async findByProjectId(projectId, filters = {}) {
    const query = { projectId };
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.specialty) {
      query.specialty = filters.specialty;
    }

    const docs = await ApplicationModel.find(query).sort({ createdAt: -1 }).lean();
    return docs.map(doc => this._toDomain(doc));
  }

  async findByStudentId(studentId) {
    const docs = await ApplicationModel.find({ studentId }).sort({ createdAt: -1 }).lean();
    return docs.map(doc => this._toDomain(doc));
  }
}
