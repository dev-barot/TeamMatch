import { Application } from '../../src/domain/applications/Application.js';
import { Origin } from '../../src/domain/applications/Origin.js';
import { ApplicationStatus } from '../../src/domain/applications/ApplicationStatus.js';
import { TeamFormation } from '../../src/domain/applications/TeamFormation.js';
import { Project } from '../../src/domain/projects/Project.js';
import { Position } from '../../src/domain/projects/Position.js';
import { ProjectStatus } from '../../src/domain/projects/ProjectStatus.js';
import {
  InvalidApplicationStatusTransitionError,
  UnauthorizedApplicationActionError,
  PositionNotFoundError,
  PositionAlreadyFilledError,
} from '../../src/domain/applications/errors.js';

describe('Domain: Application State Machine', () => {
  it('creates an application with valid default pending status', () => {
    const app = new Application({
      id: 'app-1',
      projectId: 'proj-1',
      studentId: 'student-1',
      specialty: 'Backend',
    });

    expect(app.id).toBe('app-1');
    expect(app.status).toBe(ApplicationStatus.PENDING);
    expect(app.origin).toBe(Origin.APPLIED);
    expect(app.isActive()).toBe(true);
    expect(app.isPending()).toBe(true);
  });

  it('transitions Pending -> Accepted', () => {
    const app = new Application({
      id: 'app-1',
      projectId: 'proj-1',
      studentId: 'student-1',
      specialty: 'Backend',
    });

    app.accept();
    expect(app.status).toBe(ApplicationStatus.ACCEPTED);
    expect(app.isAccepted()).toBe(true);
    expect(app.isActive()).toBe(true);
  });

  it('transitions Pending -> Rejected with reason', () => {
    const app = new Application({
      id: 'app-1',
      projectId: 'proj-1',
      studentId: 'student-1',
      specialty: 'Backend',
    });

    app.reject('skills_gap');
    expect(app.status).toBe(ApplicationStatus.REJECTED);
    expect(app.rejectionReason).toBe('skills_gap');
    expect(app.isActive()).toBe(false);
  });

  it('transitions Pending -> Withdrawn', () => {
    const app = new Application({
      id: 'app-1',
      projectId: 'proj-1',
      studentId: 'student-1',
      specialty: 'Backend',
    });

    app.withdraw();
    expect(app.status).toBe(ApplicationStatus.WITHDRAWN);
    expect(app.isActive()).toBe(false);
  });

  it('transitions Accepted -> Withdrawn (Member leaving team)', () => {
    const app = new Application({
      id: 'app-1',
      projectId: 'proj-1',
      studentId: 'student-1',
      specialty: 'Backend',
    });
    app.accept();
    app.withdraw();

    expect(app.status).toBe(ApplicationStatus.WITHDRAWN);
  });

  it('rejects illegal status transitions', () => {
    const app = new Application({
      id: 'app-1',
      projectId: 'proj-1',
      studentId: 'student-1',
      specialty: 'Backend',
    });
    app.reject();

    // From Rejected to Accepted is illegal
    expect(() => app.accept()).toThrow(InvalidApplicationStatusTransitionError);
    // From Rejected to Withdrawn is illegal
    expect(() => app.withdraw()).toThrow(InvalidApplicationStatusTransitionError);
  });
});

describe('Domain: Application Authorization (R2)', () => {
  it('R2: Creator can decide student application, non-creator throws', () => {
    const app = new Application({
      id: 'app-1',
      projectId: 'proj-1',
      studentId: 'student-applicant',
      specialty: 'Backend',
      origin: Origin.APPLIED,
    });

    expect(() => app.assertCanDecide('creator-id', 'creator-id')).not.toThrow();
    expect(() => app.assertCanDecide('stranger-id', 'creator-id')).toThrow(UnauthorizedApplicationActionError);
  });

  it('R2: only invited student can respond to an invitation', () => {
    const app = new Application({
      id: 'app-1',
      projectId: 'proj-1',
      studentId: 'invited-student',
      specialty: 'Backend',
      origin: Origin.INVITED,
    });

    expect(() => app.assertCanRespond('invited-student')).not.toThrow();
    expect(() => app.assertCanRespond('random-student')).toThrow(UnauthorizedApplicationActionError);
  });

  it('only the applicant can withdraw their application', () => {
    const app = new Application({
      id: 'app-1',
      projectId: 'proj-1',
      studentId: 'student-1',
      specialty: 'Backend',
    });

    expect(() => app.assertCanWithdraw('student-1')).not.toThrow();
    expect(() => app.assertCanWithdraw('student-2')).toThrow(UnauthorizedApplicationActionError);
  });
});

describe('Domain Service: TeamFormation & Position Capacity (R3)', () => {
  function makeProject(headcount = 1) {
    return new Project({
      id: 'proj-1',
      title: 'AI Platform',
      description: 'Building an AI platform for student teams',
      creatorId: 'creator-1',
      requiredSkills: ['Node.js'],
      positions: [
        new Position({ specialty: 'Backend', headcount, filledCount: 0 }),
      ],
    });
  }

  it('R3: accepts application, increments filledCount, and marks project Filled when capacity is reached', () => {
    const project = makeProject(1);
    const app = new Application({
      id: 'app-1',
      projectId: 'proj-1',
      studentId: 'student-1',
      specialty: 'Backend',
    });

    TeamFormation.accept(project, app);

    expect(app.isAccepted()).toBe(true);
    expect(project.positions[0].filledCount).toBe(1);
    expect(project.positions[0].isFull()).toBe(true);
    expect(project.status).toBe(ProjectStatus.FILLED);
  });

  it('R3: throws PositionAlreadyFilledError when accepting beyond headcount', () => {
    const project = makeProject(1);
    const app1 = new Application({
      id: 'app-1',
      projectId: 'proj-1',
      studentId: 'student-1',
      specialty: 'Backend',
    });
    const app2 = new Application({
      id: 'app-2',
      projectId: 'proj-1',
      studentId: 'student-2',
      specialty: 'Backend',
    });

    TeamFormation.accept(project, app1);

    // Second accept on the same position must fail under Rule R3
    expect(() => TeamFormation.accept(project, app2)).toThrow(PositionAlreadyFilledError);
  });

  it('throws PositionNotFoundError if specialty is not listed on project', () => {
    const project = makeProject(1);
    const app = new Application({
      id: 'app-1',
      projectId: 'proj-1',
      studentId: 'student-1',
      specialty: 'UI/UX',
    });

    expect(() => TeamFormation.accept(project, app)).toThrow(PositionNotFoundError);
  });

  it('re-opens Project and decrements filledCount when an accepted Member withdraws', () => {
    const project = makeProject(1);
    const app = new Application({
      id: 'app-1',
      projectId: 'proj-1',
      studentId: 'student-1',
      specialty: 'Backend',
    });

    TeamFormation.accept(project, app);
    expect(project.status).toBe(ProjectStatus.FILLED);

    // Member withdraws
    TeamFormation.withdraw(project, app);

    expect(app.status).toBe(ApplicationStatus.WITHDRAWN);
    expect(project.positions[0].filledCount).toBe(0);
    expect(project.status).toBe(ProjectStatus.OPEN);
  });
});
