/**
 * ApplicationStatus Enum
 * Lifecycle statuses: Pending, Accepted, Rejected, Withdrawn.
 */
export const ApplicationStatus = Object.freeze({
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',

  VALUES: ['Pending', 'Accepted', 'Rejected', 'Withdrawn'],

  isValid(value) {
    return this.VALUES.includes(value);
  },

  isActive(status) {
    return status === this.PENDING || status === this.ACCEPTED;
  },
});
