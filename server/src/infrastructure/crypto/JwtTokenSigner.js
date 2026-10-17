import jwt from 'jsonwebtoken';
import { TokenSigner } from '../../ports/TokenSigner.js';

export class JwtTokenSigner extends TokenSigner {
  constructor({
    accessSecret = 'access_secret_default',
    refreshSecret = 'refresh_secret_default',
    accessExpiresIn = '1h',
    refreshExpiresIn = '7d',
  } = {}) {
    super();
    this.accessSecret = accessSecret;
    this.refreshSecret = refreshSecret;
    this.accessExpiresIn = accessExpiresIn;
    this.refreshExpiresIn = refreshExpiresIn;
  }

  signAccessToken(payload) {
    return jwt.sign(payload, this.accessSecret, { expiresIn: this.accessExpiresIn });
  }

  signRefreshToken(payload) {
    return jwt.sign(payload, this.refreshSecret, { expiresIn: this.refreshExpiresIn });
  }

  verifyAccessToken(token) {
    return jwt.verify(token, this.accessSecret);
  }

  verifyRefreshToken(token) {
    return jwt.verify(token, this.refreshSecret);
  }
}
