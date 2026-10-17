/**
 * Port: TokenSigner
 * Decouples use cases from JWT or external signing mechanisms.
 */
export class TokenSigner {
  /**
   * @param {object} payload
   * @returns {string}
   */
  signAccessToken(_payload) {
    throw new Error('Not implemented: TokenSigner.signAccessToken');
  }

  /**
   * @param {object} payload
   * @returns {string}
   */
  signRefreshToken(_payload) {
    throw new Error('Not implemented: TokenSigner.signRefreshToken');
  }

  /**
   * @param {string} token
   * @returns {object}
   */
  verifyAccessToken(_token) {
    throw new Error('Not implemented: TokenSigner.verifyAccessToken');
  }

  /**
   * @param {string} token
   * @returns {object}
   */
  verifyRefreshToken(_token) {
    throw new Error('Not implemented: TokenSigner.verifyRefreshToken');
  }
}
