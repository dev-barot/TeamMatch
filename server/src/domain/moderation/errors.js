export class DomainError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ReportNotFoundError extends DomainError {
  constructor(id) {
    super(`Report with ID "${id}" was not found.`);
  }
}

export class ReportAlreadyReviewedError extends DomainError {
  constructor(id) {
    super(`Report "${id}" has already been reviewed.`);
  }
}

export class UnauthorizedAdminActionError extends DomainError {
  constructor(message = 'Only an Admin can perform this action (R2).') {
    super(message);
  }
}

export class AccountNotFoundError extends DomainError {
  constructor(id) {
    super(`Account with ID "${id}" was not found.`);
  }
}

export class AccountAlreadyDeactivatedError extends DomainError {
  constructor(id) {
    super(`Account "${id}" is already deactivated.`);
  }
}
