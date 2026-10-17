/**
 * Port: Clock
 * Allows deterministic time in unit tests.
 */
export class Clock {
  /**
   * @returns {Date}
   */
  now() {
    return new Date();
  }
}
