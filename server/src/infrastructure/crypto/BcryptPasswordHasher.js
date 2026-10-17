import bcrypt from 'bcryptjs';
import { PasswordHasher } from '../../ports/PasswordHasher.js';

export class BcryptPasswordHasher extends PasswordHasher {
  constructor(rounds = 10) {
    super();
    this.rounds = rounds;
  }

  async hash(plainPassword) {
    return bcrypt.hash(plainPassword, this.rounds);
  }

  async compare(plainPassword, hash) {
    return bcrypt.compare(plainPassword, hash);
  }
}
