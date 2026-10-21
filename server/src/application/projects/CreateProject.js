import { Project } from '../../domain/projects/Project.js';
import { InvalidTokenError } from '../../domain/identity/errors.js';

/**
 * Use Case: CreateProject
 * Enforces Rule R5: Verify before acting.
 * An unverified Student cannot create a Project.
 */
export class CreateProject {
  constructor({ studentRepository, projectRepository }) {
    this.studentRepo = studentRepository;
    this.projectRepo = projectRepository;
  }

  async execute({
    creatorId,
    title,
    description,
    requiredSkills,
    positions,
    commitmentLevel,
    category,
    courseTag,
  }) {
    const creator = await this.studentRepo.findById(creatorId);
    if (!creator) {
      throw new InvalidTokenError('Creator student not found.');
    }

    // Rule R5: Domain gate checking that student email is verified
    creator.assertEmailVerified();

    const project = new Project({
      creatorId,
      title,
      description,
      requiredSkills,
      positions,
      commitmentLevel,
      category,
      courseTag,
    });

    await this.projectRepo.save(project);
    return project.toJSON();
  }
}
