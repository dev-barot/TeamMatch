/**
 * Port: StudentRepository
 * Abstract contract for storing and querying Students and their Accounts.
 */
export class StudentRepository {
  /**
   * @param {import('../domain/identity/Student.js').Student} student
   * @returns {Promise<void>}
   */
  async save(_student) {
    throw new Error('Not implemented: StudentRepository.save');
  }

  /**
   * @param {string} id
   * @returns {Promise<import('../domain/identity/Student.js').Student|null>}
   */
  async findById(_id) {
    throw new Error('Not implemented: StudentRepository.findById');
  }

  /**
   * @param {string} email
   * @returns {Promise<import('../domain/identity/Student.js').Student|null>}
   */
  async findByEmail(_email) {
    throw new Error('Not implemented: StudentRepository.findByEmail');
  }

  /**
   * @param {string} token
   * @returns {Promise<import('../domain/identity/Student.js').Student|null>}
   */
  async findByVerificationToken(_token) {
    throw new Error('Not implemented: StudentRepository.findByVerificationToken');
  }

  /**
   * @param {string} token
   * @returns {Promise<import('../domain/identity/Student.js').Student|null>}
   */
  async findByResetToken(_token) {
    throw new Error('Not implemented: StudentRepository.findByResetToken');
  }

  /**
   * Retrieves verified active students as matching candidates.
   * @param {object} [_filters]
   * @returns {Promise<import('../domain/identity/Student.js').Student[]>}
   */
  async findAllVerified(_filters = {}) {
    throw new Error('Not implemented: StudentRepository.findAllVerified');
  }
}
