/**
 * WorkingStyle Enum
 * How a Student likes to work.
 */
export const WorkingStyle = Object.freeze({
  INDEPENDENT: 'independent',
  COLLABORATIVE: 'collaborative',
  DETAIL_ORIENTED: 'detail-oriented',
  FAST_PACED: 'fast-paced',

  VALUES: ['independent', 'collaborative', 'detail-oriented', 'fast-paced'],

  isValid(value) {
    return this.VALUES.includes(value);
  },
});
