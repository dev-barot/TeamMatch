/**
 * Project Status Enum
 * Represents the lifecycle status of a Project.
 */
export const ProjectStatus = Object.freeze({
  OPEN: 'open',
  FILLED: 'filled',
  CLOSED: 'closed',

  VALUES: ['open', 'filled', 'closed'],

  isValid(value) {
    return this.VALUES.includes(value);
  },
});
