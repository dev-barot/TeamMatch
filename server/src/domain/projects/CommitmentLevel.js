/**
 * Commitment Level Enum
 * How much time a Project expects.
 */
export const CommitmentLevel = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',

  VALUES: ['low', 'medium', 'high'],

  isValid(value) {
    return this.VALUES.includes(value);
  },
});
