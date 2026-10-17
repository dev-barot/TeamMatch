import { Account } from './Account.js';
import { Profile } from './Profile.js';
import { UnauthorizedProfileEditError } from './errors.js';

export class Student {
  constructor({
    id,
    name,
    account,
    profile = new Profile(),
  }) {
    if (!id) {
      throw new Error('Student id is required.');
    }
    if (!name || typeof name !== 'string') {
      throw new Error('Student name is required.');
    }
    if (!(account instanceof Account)) {
      throw new Error('Student account must be an instance of Account.');
    }

    this.id = String(id);
    this.name = name.trim();
    this.account = account;
    this.profile = profile instanceof Profile ? profile : new Profile(profile);
  }

  /**
   * Rule R2: A Student edits only their own Profile.
   */
  assertCanEdit(requesterId) {
    if (String(requesterId) !== this.id) {
      throw new UnauthorizedProfileEditError();
    }
  }

  /**
   * Updates student's profile, guarded by R2.
   */
  updateProfile(profileData, requesterId) {
    this.assertCanEdit(requesterId);
    this.profile = new Profile({
      ...this.profile.toJSON(),
      ...profileData,
    });
  }

  /**
   * Rule R5: Verify before acting.
   */
  assertEmailVerified() {
    this.account.assertEmailVerified();
  }

  /**
   * Public representation for candidate browsing, matching, and conversations.
   * Excludes private email and auth credentials.
   */
  toPublicView() {
    return {
      id: this.id,
      name: this.name,
      profile: this.profile.toJSON(),
    };
  }

  /**
   * Private representation for the authenticated student themselves.
   */
  toPrivateView() {
    return {
      id: this.id,
      name: this.name,
      email: this.account.email,
      isEmailVerified: this.account.isEmailVerified,
      accountType: this.account.accountType,
      profile: this.profile.toJSON(),
    };
  }
}
