/**
 * Port: PasswordHasher
 * Decouples use cases from bcrypt or crypto libraries.
 */
export class PasswordHasher {
  /**
   * @param {string} plainPassword
   * @returns {Promise<string>}
   */
  async hash(_plainPassword) {
    throw new Error('Not implemented: PasswordHasher.hash');
  }

  /**
   * @param {string} plainPassword
   * @param {string} hash
   * @returns {Promise<boolean>}
   */
  async compare(_plainPassword, _hash) {
    throw new Error('Not implemented: PasswordHasher.compare');
  }
}
