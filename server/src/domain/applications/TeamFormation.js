import { PositionNotFoundError, PositionAlreadyFilledError } from './errors.js';

/**
 * Domain Service: TeamFormation
 * Orchestrates team member acceptance, position fill tracking, and project status transitions.
 * Enforces Rule R3: Positions never overfill.
 */
export class TeamFormation {
  /**
   * Accepts an Application into a Project Position.
   * - Validates position capacity (R3)
   * - Increments position filledCount
   * - Transitions Application status to Accepted
   * - Synchronizes Project status (marks Filled if all positions are full)
   *
   * @param {import('../projects/Project.js').Project} project
   * @param {import('./Application.js').Application} application
   */
  static accept(project, application) {
    const position = project.positions.find(p => p.specialty === application.specialty);
    if (!position) {
      throw new PositionNotFoundError(application.specialty);
    }

    if (position.isFull()) {
      throw new PositionAlreadyFilledError(application.specialty);
    }

    // Increment seat capacity (R3 guard inside Position aggregate)
    position.incrementFilled();

    // Transition application to Accepted
    application.accept();

    // Sync project status (turns Filled when all positions full)
    project.syncStatusFromPositions();
  }

  /**
   * Handles member withdrawal from a Project.
   * - Transitions Application status to Withdrawn
   * - If previously Accepted, decrements position filledCount
   * - Reopens Project if it was previously Filled
   *
   * @param {import('../projects/Project.js').Project} project
   * @param {import('./Application.js').Application} application
   */
  static withdraw(project, application) {
    const wasAccepted = application.isAccepted();

    // Transition application state
    application.withdraw();

    // If accepted member withdraws, reopen seat
    if (wasAccepted) {
      const position = project.positions.find(p => p.specialty === application.specialty);
      if (position) {
        position.decrementFilled();
      }
      project.syncStatusFromPositions();
    }
  }
}
