/**
 * CourseTag Value Object
 * Optional course code + term on a Project.
 * Pure metadata; grants no permissions or special privileges.
 */
export class CourseTag {
  constructor({ courseCode, term } = {}) {
    this.courseCode = typeof courseCode === 'string' ? courseCode.trim() : '';
    this.term = typeof term === 'string' ? term.trim() : '';
    Object.freeze(this);
  }

  /**
   * Explanatory check confirming CourseTag has no authority or privileges.
   */
  grantsPrivilege() {
    return false;
  }

  isEmpty() {
    return !this.courseCode && !this.term;
  }

  toJSON() {
    return {
      courseCode: this.courseCode,
      term: this.term,
    };
  }
}
