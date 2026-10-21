export class DomainError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class AccountAlreadyExistsError extends DomainError {
  constructor(email) {
    super(`Account with email "${email}" already exists.`);
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Invalid email or password.');
  }
}

export class AccountDeactivatedError extends DomainError {
  constructor() {
    super('This account has been deactivated.');
  }
}

export class EmailNotVerifiedError extends DomainError {
  constructor() {
    super('Email verification is required before performing this action (R5).');
  }
}

export class InvalidTokenError extends DomainError {
  constructor(message = 'Invalid or malformed token.') {
    super(message);
  }
}

export class TokenExpiredError extends DomainError {
  constructor() {
    super('Token has expired.');
  }
}

export class UnauthorizedProfileEditError extends DomainError {
  constructor() {
    super('A Student can only edit their own Profile (R2).');
  }
}

export class InvalidProfileDataError extends DomainError {
  constructor(message) {
    super(`Invalid profile data: ${message}`);
  }
}

export class StudentNotFoundError extends DomainError {
  constructor(id) {
    super(`Student with ID "${id}" was not found.`);
  }
}

