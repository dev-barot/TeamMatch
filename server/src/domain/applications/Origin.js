/**
 * Origin Enum
 * Who initiated an Application: Student ('applied') or Creator ('invited').
 */
export const Origin = Object.freeze({
  APPLIED: 'applied',
  INVITED: 'invited',

  VALUES: ['applied', 'invited'],

  isValid(value) {
    return this.VALUES.includes(value);
  },
});
