/**
 * Specialty Enum
 * The kind of work a Student prefers.
 */
export const Specialty = Object.freeze({
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  ML: 'ML',
  DEVOPS: 'DevOps',
  UI_UX: 'UI/UX',
  OTHER: 'Other',

  VALUES: ['Frontend', 'Backend', 'ML', 'DevOps', 'UI/UX', 'Other'],

  isValid(value) {
    return this.VALUES.includes(value);
  },
});
