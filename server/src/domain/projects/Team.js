/**
 * Team Value Object / Entity
 * Represents all confirmed Members of one Project.
 */
export class Team {
  constructor({ projectId, members = [] }) {
    this.projectId = projectId;
    this.members = Array.isArray(members) ? [...members] : [];
    Object.freeze(this.members);
  }

  get size() {
    return this.members.length;
  }

  hasMember(studentId) {
    return this.members.some(m => m.studentId === studentId);
  }

  toJSON() {
    return {
      projectId: this.projectId,
      members: this.members,
      size: this.size,
    };
  }
}
