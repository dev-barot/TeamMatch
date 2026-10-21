import { Project } from '../../src/domain/projects/Project.js';
import { Position } from '../../src/domain/projects/Position.js';
import { CourseTag } from '../../src/domain/projects/CourseTag.js';
import { ProjectStatus } from '../../src/domain/projects/ProjectStatus.js';
import { CommitmentLevel } from '../../src/domain/projects/CommitmentLevel.js';
import { Specialty } from '../../src/domain/identity/Specialty.js';
import {
  InvalidPositionError,
  PositionOverfilledError,
  InvalidProjectStatusTransitionError,
  InvalidProjectDataError,
  UnauthorizedProjectActionError,
} from '../../src/domain/projects/errors.js';

describe('Domain: Position invariants (R3)', () => {
  it('creates a position with valid specialty and headcount', () => {
    const pos = new Position({
      specialty: Specialty.BACKEND,
      headcount: 2,
      filledCount: 0,
    });

    expect(pos.specialty).toBe('Backend');
    expect(pos.headcount).toBe(2);
    expect(pos.filledCount).toBe(0);
    expect(pos.remaining).toBe(2);
    expect(pos.isFull()).toBe(false);
  });

  it('rejects headcount less than 1', () => {
    expect(() => new Position({ specialty: Specialty.FRONTEND, headcount: 0 })).toThrow(InvalidPositionError);
    expect(() => new Position({ specialty: Specialty.FRONTEND, headcount: -1 })).toThrow(InvalidPositionError);
  });

  it('rejects invalid specialty', () => {
    expect(() => new Position({ specialty: 'SpaceExplorer', headcount: 2 })).toThrow(InvalidPositionError);
  });

  it('R3: rejects filledCount exceeding headcount on construction', () => {
    expect(() => new Position({
      specialty: Specialty.BACKEND,
      headcount: 2,
      filledCount: 3,
    })).toThrow(PositionOverfilledError);
  });

  it('R3: incrementFilled increases filledCount but throws when overfilling', () => {
    const pos = new Position({
      specialty: Specialty.DEVOPS,
      headcount: 1,
      filledCount: 0,
    });

    pos.incrementFilled();
    expect(pos.filledCount).toBe(1);
    expect(pos.isFull()).toBe(true);

    expect(() => pos.incrementFilled()).toThrow(PositionOverfilledError);
  });

  it('decrementFilled reduces filledCount and clamps at 0', () => {
    const pos = new Position({
      specialty: Specialty.ML,
      headcount: 2,
      filledCount: 1,
    });

    pos.decrementFilled();
    expect(pos.filledCount).toBe(0);
    pos.decrementFilled();
    expect(pos.filledCount).toBe(0);
  });
});

describe('Domain: CourseTag', () => {
  it('stores course code and term as pure metadata', () => {
    const tag = new CourseTag({ courseCode: 'CS680', term: 'Fall 2026' });
    expect(tag.courseCode).toBe('CS680');
    expect(tag.term).toBe('Fall 2026');
    expect(tag.grantsPrivilege()).toBe(false);
  });

  it('Course Tag does not change authorization', () => {
    const tag = new CourseTag({ courseCode: 'CS680', term: 'Fall 2026' });
    expect(tag.grantsPrivilege()).toBe(false);
  });
});

describe('Domain: Project Aggregate & Status Transitions (R3)', () => {
  const validPositions = [
    new Position({ specialty: Specialty.BACKEND, headcount: 1 }),
    new Position({ specialty: Specialty.FRONTEND, headcount: 1 }),
  ];

  it('creates project with normalized skills and default open status', () => {
    const project = new Project({
      title: 'Smart Study Group',
      description: 'An AI-powered collaboration portal for students.',
      creatorId: 'student_123',
      requiredSkills: ['React.JS', 'react.js', ' Node.js '],
      positions: validPositions,
      commitmentLevel: CommitmentLevel.HIGH,
      category: 'Hackathon',
    });

    expect(project.title).toBe('Smart Study Group');
    expect(project.requiredSkills).toEqual(['react.js', 'node.js']);
    expect(project.status).toBe(ProjectStatus.OPEN);
    expect(project.positions.length).toBe(2);
  });

  it('rejects title shorter than 3 or longer than 120 chars', () => {
    expect(() => new Project({
      title: 'ab',
      description: 'Valid description here',
      creatorId: 'student_123',
      positions: validPositions,
    })).toThrow(InvalidProjectDataError);

    expect(() => new Project({
      title: 'x'.repeat(121),
      description: 'Valid description here',
      creatorId: 'student_123',
      positions: validPositions,
    })).toThrow(InvalidProjectDataError);
  });

  it('rejects empty positions array', () => {
    expect(() => new Project({
      title: 'Valid Title',
      description: 'Valid description here',
      creatorId: 'student_123',
      positions: [],
    })).toThrow(InvalidProjectDataError);
  });

  it('transitions status Open -> Filled -> Open', () => {
    const project = new Project({
      title: 'Robotics Team',
      description: 'Building autonomous robot for university competition.',
      creatorId: 'student_123',
      positions: [new Position({ specialty: Specialty.ML, headcount: 1 })],
    });

    expect(project.status).toBe(ProjectStatus.OPEN);

    // Fill position
    project.positions[0].incrementFilled();
    project.syncStatusFromPositions();
    expect(project.status).toBe(ProjectStatus.FILLED);

    // Member leaves -> reopen
    project.positions[0].decrementFilled();
    project.syncStatusFromPositions();
    expect(project.status).toBe(ProjectStatus.OPEN);
  });

  it('transitions Open/Filled -> Closed (terminal status)', () => {
    const project = new Project({
      title: 'Startup Idea',
      description: 'Fintech app for micro-investing among peers.',
      creatorId: 'student_123',
      positions: validPositions,
    });

    project.transitionStatus(ProjectStatus.CLOSED);
    expect(project.status).toBe(ProjectStatus.CLOSED);

    // Attempting to reopen a closed project throws InvalidProjectStatusTransitionError
    expect(() => project.transitionStatus(ProjectStatus.OPEN)).toThrow(InvalidProjectStatusTransitionError);
    expect(() => project.transitionStatus(ProjectStatus.FILLED)).toThrow(InvalidProjectStatusTransitionError);
  });
});

describe('Domain: Project & Rules (R2)', () => {
  const createTestProject = () => new Project({
    title: 'Mobile App Project',
    description: 'React Native fitness app for cross-platform devices.',
    creatorId: 'student_creator',
    requiredSkills: ['react-native'],
    positions: [new Position({ specialty: Specialty.FRONTEND, headcount: 1 })],
    courseTag: new CourseTag({ courseCode: 'CS680', term: 'Fall 2026' }),
  });

  it('R2: Creator can update Project attributes', () => {
    const project = createTestProject();
    project.update({ title: 'Updated Mobile App Title' }, 'student_creator');
    expect(project.title).toBe('Updated Mobile App Title');
  });

  it('R2: rejects update if requester is not the Creator', () => {
    const project = createTestProject();
    expect(() => project.update({ title: 'Hacked Title' }, 'student_intruder'))
      .toThrow(UnauthorizedProjectActionError);
  });

  it('R2: Creator can close Project', () => {
    const project = createTestProject();
    project.close('student_creator');
    expect(project.status).toBe(ProjectStatus.CLOSED);
  });

  it('R2: rejects close if requester is not the Creator', () => {
    const project = createTestProject();
    expect(() => project.close('student_intruder'))
      .toThrow(UnauthorizedProjectActionError);
  });

  it('Course Tag does not change authorization even if specified', () => {
    const project = createTestProject();
    // Even an intruder mentioning the course tag cannot edit
    expect(() => project.assertCreator('student_intruder')).toThrow(UnauthorizedProjectActionError);
  });
});
