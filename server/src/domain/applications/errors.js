export class DomainError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class DuplicateApplicationError extends DomainError {
  constructor(projectId, studentId) {
    super(`Student "${studentId}" already has an active (Pending or Accepted) Application on Project "${projectId}" (R1).`);
  }
}

export class CreatorCannotApplyError extends DomainError {
  constructor() {
    super('The Creator of a Project cannot apply to their own Project.');
  }
}

export class InvalidApplicationStatusTransitionError extends DomainError {
  constructor(from, to) {
    super(`Cannot transition Application status from "${from}" to "${to}".`);
  }
}

export class UnauthorizedApplicationActionError extends DomainError {
  constructor(message = 'Only the authorized person can perform this action on the Application (R2).') {
    super(message);
  }
}

export class PositionNotFoundError extends DomainError {
  constructor(specialty) {
    super(`Position with specialty "${specialty}" was not found on this Project.`);
  }
}

export class PositionAlreadyFilledError extends DomainError {
  constructor(specialty) {
    super(`Position with specialty "${specialty}" is already filled to capacity (R3).`);
  }
}
