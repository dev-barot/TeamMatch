import { Skill } from '../shared/Skill.js';
import { ProjectStatus } from './ProjectStatus.js';
import { CommitmentLevel } from './CommitmentLevel.js';
import { Position } from './Position.js';
import { CourseTag } from './CourseTag.js';
import {
  UnauthorizedProjectActionError,
  InvalidProjectStatusTransitionError,
  InvalidProjectDataError,
} from './errors.js';

/**
 * Project Aggregate Root
 * Represents a project posting created by a Student with required skills and open positions.
 * Enforces:
 * - Rule R2: Creator-only edits and closure (assertCreator).
 * - Rule R3: Capacity tracking and valid status transitions.
 */
export class Project {
  constructor({
    id = null,
    title,
    description,
    creatorId,
    requiredSkills = [],
    positions = [],
    commitmentLevel = CommitmentLevel.MEDIUM,
    category = 'Class Project',
    courseTag = null,
    status = ProjectStatus.OPEN,
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    if (!creatorId || typeof creatorId !== 'string') {
      throw new InvalidProjectDataError('Project creatorId is required.');
    }

    this.id = id || `proj_${Math.random().toString(36).substring(2, 10)}`;
    this.creatorId = creatorId;

    this.setTitle(title);
    this.setDescription(description);
    this.setCommitmentLevel(commitmentLevel);
    this.setCategory(category);
    this.setRequiredSkills(requiredSkills);
    this.setPositions(positions);
    this.setCourseTag(courseTag);

    if (!ProjectStatus.isValid(status)) {
      throw new InvalidProjectDataError(`Invalid ProjectStatus: "${status}". Must be one of ${ProjectStatus.VALUES.join(', ')}.`);
    }
    this.status = status;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    this.updatedAt = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);

    // Initial capacity check if not explicitly closed
    if (this.status !== ProjectStatus.CLOSED) {
      this.syncStatusFromPositions();
    }
  }

  setTitle(title) {
    if (typeof title !== 'string' || title.trim().length < 3) {
      throw new InvalidProjectDataError('Project title must be at least 3 characters.');
    }
    if (title.trim().length > 120) {
      throw new InvalidProjectDataError('Project title cannot exceed 120 characters.');
    }
    this.title = title.trim();
  }

  setDescription(description) {
    if (typeof description !== 'string' || description.trim().length < 10) {
      throw new InvalidProjectDataError('Project description must be at least 10 characters.');
    }
    if (description.trim().length > 2000) {
      throw new InvalidProjectDataError('Project description cannot exceed 2000 characters.');
    }
    this.description = description.trim();
  }

  setCommitmentLevel(level) {
    if (!CommitmentLevel.isValid(level)) {
      throw new InvalidProjectDataError(`Invalid CommitmentLevel: "${level}". Must be one of ${CommitmentLevel.VALUES.join(', ')}.`);
    }
    this.commitmentLevel = level;
  }

  setCategory(category) {
    if (typeof category === 'string' && category.trim()) {
      this.category = category.trim();
    } else {
      this.category = 'Class Project';
    }
  }

  setRequiredSkills(skills) {
    this.requiredSkills = Skill.normalizeList(skills);
  }

  setPositions(positions) {
    if (!Array.isArray(positions) || positions.length === 0) {
      throw new InvalidProjectDataError('Project must define at least one Position.');
    }

    this.positions = positions.map(pos => {
      if (pos instanceof Position) {
        return pos;
      }
      return new Position(pos);
    });
  }

  setCourseTag(courseTag) {
    if (!courseTag) {
      this.courseTag = null;
      return;
    }
    if (courseTag instanceof CourseTag) {
      this.courseTag = courseTag;
      return;
    }
    this.courseTag = new CourseTag(courseTag);
  }

  /**
   * Domain check enforcing Rule R2 (Only the owner acts).
   * Throws UnauthorizedProjectActionError if studentId does not match creatorId.
   */
  assertCreator(studentId) {
    if (!studentId || this.creatorId !== studentId) {
      throw new UnauthorizedProjectActionError();
    }
  }

  isCreator(studentId) {
    return Boolean(studentId && this.creatorId === studentId);
  }

  /**
   * Transitions status according to the valid state machine:
   * Open <-> Filled
   * Open -> Closed
   * Filled -> Closed
   * Closed is terminal.
   */
  transitionStatus(newStatus) {
    if (this.status === newStatus) {
      return;
    }

    if (this.status === ProjectStatus.CLOSED) {
      throw new InvalidProjectStatusTransitionError(this.status, newStatus);
    }

    if (
      (this.status === ProjectStatus.OPEN && (newStatus === ProjectStatus.FILLED || newStatus === ProjectStatus.CLOSED)) ||
      (this.status === ProjectStatus.FILLED && (newStatus === ProjectStatus.OPEN || newStatus === ProjectStatus.CLOSED))
    ) {
      this.status = newStatus;
      this.updatedAt = new Date();
      return;
    }

    throw new InvalidProjectStatusTransitionError(this.status, newStatus);
  }

  /**
   * Synchronizes project status with position fill rates.
   * If all positions are completely full, marks as Filled.
   * If currently Filled and capacity re-opens, returns to Open.
   */
  syncStatusFromPositions() {
    if (this.status === ProjectStatus.CLOSED) {
      return;
    }

    const allPositionsFilled = this.positions.length > 0 && this.positions.every(p => p.isFull());
    if (allPositionsFilled && this.status !== ProjectStatus.FILLED) {
      this.transitionStatus(ProjectStatus.FILLED);
    } else if (!allPositionsFilled && this.status === ProjectStatus.FILLED) {
      this.transitionStatus(ProjectStatus.OPEN);
    }
  }

  /**
   * Updates project details (Creator-only check inside aggregate).
   */
  update({ title, description, requiredSkills, positions, commitmentLevel, category, courseTag }, updaterId) {
    this.assertCreator(updaterId);

    if (this.status === ProjectStatus.CLOSED) {
      throw new InvalidProjectDataError('Cannot update a closed Project.');
    }

    if (title !== undefined) this.setTitle(title);
    if (description !== undefined) this.setDescription(description);
    if (commitmentLevel !== undefined) this.setCommitmentLevel(commitmentLevel);
    if (category !== undefined) this.setCategory(category);
    if (requiredSkills !== undefined) this.setRequiredSkills(requiredSkills);
    if (positions !== undefined) this.setPositions(positions);
    if (courseTag !== undefined) this.setCourseTag(courseTag);

    this.syncStatusFromPositions();
    this.updatedAt = new Date();
  }

  /**
   * Closes project permanently (Creator-only check inside aggregate).
   */
  close(closerId) {
    this.assertCreator(closerId);
    this.transitionStatus(ProjectStatus.CLOSED);
  }

  /**
   * Admin-initiated close. Bypasses assertCreator since Admin is not the Creator.
   * Rule R2: Admin-only check is enforced in the AdminCloseProject use case.
   */
  forceClose() {
    this.transitionStatus(ProjectStatus.CLOSED);
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      creatorId: this.creatorId,
      requiredSkills: this.requiredSkills,
      positions: this.positions.map(p => p.toJSON()),
      commitmentLevel: this.commitmentLevel,
      category: this.category,
      courseTag: this.courseTag ? this.courseTag.toJSON() : null,
      status: this.status,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
