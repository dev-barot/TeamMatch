import { DomainError } from '../identity/errors.js';

export class UnauthorizedProjectActionError extends DomainError {
  constructor(message = 'Only the Project Creator can perform this action (R2).') {
    super(message);
    this.rule = 'R2';
  }
}

export class InvalidPositionError extends DomainError {
  constructor(message = 'Position headcount must be an integer greater than or equal to 1.') {
    super(message);
  }
}

export class PositionOverfilledError extends DomainError {
  constructor(message = 'Accepted Members in a Position cannot exceed its headcount (R3).') {
    super(message);
    this.rule = 'R3';
  }
}

export class InvalidProjectStatusTransitionError extends DomainError {
  constructor(fromStatus, toStatus) {
    super(`Cannot transition Project status from "${fromStatus}" to "${toStatus}".`);
    this.rule = 'R3';
  }
}

export class InvalidProjectDataError extends DomainError {
  constructor(message) {
    super(`Invalid project data: ${message}`);
  }
}

export class ProjectNotFoundError extends DomainError {
  constructor(id) {
    super(`Project with ID "${id}" was not found.`);
  }
}
