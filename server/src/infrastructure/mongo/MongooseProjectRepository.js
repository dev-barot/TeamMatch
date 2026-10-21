import { ProjectRepository } from '../../ports/ProjectRepository.js';
import { Project } from '../../domain/projects/Project.js';
import { Position } from '../../domain/projects/Position.js';
import { CourseTag } from '../../domain/projects/CourseTag.js';
import { ProjectModel } from './schemas/ProjectModel.js';

export class MongooseProjectRepository extends ProjectRepository {
  _toDomain(doc) {
    if (!doc) return null;

    const positions = (doc.positions || []).map(p => new Position({
      id: p.id,
      specialty: p.specialty,
      headcount: p.headcount,
      filledCount: p.filledCount,
    }));

    const courseTag = doc.courseTag ? new CourseTag(doc.courseTag) : null;

    return new Project({
      id: doc._id,
      title: doc.title,
      description: doc.description,
      creatorId: doc.creatorId,
      requiredSkills: doc.requiredSkills || [],
      positions,
      commitmentLevel: doc.commitmentLevel,
      category: doc.category,
      courseTag,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async save(project) {
    const data = {
      _id: project.id,
      title: project.title,
      description: project.description,
      creatorId: project.creatorId,
      requiredSkills: project.requiredSkills,
      positions: project.positions.map(p => ({
        id: p.id,
        specialty: p.specialty,
        headcount: p.headcount,
        filledCount: p.filledCount,
      })),
      commitmentLevel: project.commitmentLevel,
      category: project.category,
      courseTag: project.courseTag ? project.courseTag.toJSON() : null,
      status: project.status,
    };

    await ProjectModel.findByIdAndUpdate(
      project.id,
      { $set: data },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  async findById(id) {
    const doc = await ProjectModel.findById(id).lean();
    return this._toDomain(doc);
  }

  async search({
    query = '',
    skills = [],
    specialty = null,
    category = null,
    commitment = null,
    status = 'open',
    _sort = 'newest',
    limit = 20,
    cursor = null,
  } = {}) {
    const mongoQuery = {};

    if (status && status !== 'all') {
      mongoQuery.status = status;
    }

    if (query) {
      mongoQuery.$text = { $search: query };
    }

    if (Array.isArray(skills) && skills.length > 0) {
      mongoQuery.requiredSkills = { $in: skills.map(s => s.toLowerCase()) };
    }

    if (specialty) {
      mongoQuery['positions.specialty'] = specialty;
    }

    if (category) {
      mongoQuery.category = category;
    }

    if (commitment) {
      mongoQuery.commitmentLevel = commitment;
    }

    if (cursor) {
      mongoQuery.createdAt = { $lt: new Date(cursor) };
    }

    const sortCriteria = {};
    if (query) {
      sortCriteria.score = { $meta: 'textScore' };
    }
    sortCriteria.createdAt = -1;

    const total = await ProjectModel.countDocuments(mongoQuery);
    const docs = await ProjectModel.find(mongoQuery)
      .sort(sortCriteria)
      .limit(limit)
      .lean();

    const projects = docs.map(d => this._toDomain(d));
    const nextCursor = docs.length === limit ? docs[docs.length - 1].createdAt.toISOString() : null;

    return {
      projects,
      nextCursor,
      total,
    };
  }

  async findByCreator(creatorId) {
    const docs = await ProjectModel.find({ creatorId }).sort({ createdAt: -1 }).lean();
    return docs.map(d => this._toDomain(d));
  }
}
