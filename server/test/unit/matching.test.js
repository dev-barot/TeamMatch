import { MatchingEngine } from '../../src/domain/matching/MatchingEngine.js';
import { rankProjectsForStudent, rankStudentsForProject } from '../../src/domain/matching/ranker.js';

describe('Domain: Matching Engine & Rule R4', () => {
  let engine;

  beforeEach(() => {
    engine = new MatchingEngine();
  });

  it('R4: every point in Match Score has an explainable Reason', () => {
    const student = {
      id: 's1',
      profile: {
        skills: ['React', 'Node.js'],
        specialty: 'Backend',
        weeklyAvailability: 12,
        timezone: 'UTC',
        workingStyle: 'collaborative',
      },
    };

    const project = {
      id: 'p1',
      title: 'Fullstack App',
      requiredSkills: ['Node.js', 'PostgreSQL'],
      commitmentLevel: 'medium',
      positions: [
        { specialty: 'Backend', headcount: 2, filledCount: 0, remaining: 2 },
      ],
      timezone: 'UTC',
    };

    const score = engine.scoreMatch(student, project, []);

    expect(score.totalScore).toBeGreaterThan(0);
    expect(score.reasons.length).toBeGreaterThan(0);

    // Sum of points across reasons must match or explain the score
    const explainedPoints = score.reasons.reduce((acc, r) => acc + r.points, 0);
    expect(explainedPoints).toBe(score.totalScore);

    // Every reason must have positive points and non-empty text
    for (const r of score.reasons) {
      expect(r.points).toBeGreaterThan(0);
      expect(r.text).toBeTruthy();
    }
  });

  it('R4: at most 5 Reasons are kept, ordered descending by points', () => {
    // Custom test rules providing 7 distinct scoring reasons
    const manyRules = [
      { name: 'r1', evaluate: () => ({ points: 5, reason: 'Reason 5' }) },
      { name: 'r2', evaluate: () => ({ points: 25, reason: 'Reason 25' }) },
      { name: 'r3', evaluate: () => ({ points: 15, reason: 'Reason 15' }) },
      { name: 'r4', evaluate: () => ({ points: 10, reason: 'Reason 10' }) },
      { name: 'r5', evaluate: () => ({ points: 30, reason: 'Reason 30' }) },
      { name: 'r6', evaluate: () => ({ points: 20, reason: 'Reason 20' }) },
      { name: 'r7', evaluate: () => ({ points: 2, reason: 'Reason 2' }) },
    ];

    const customEngine = new MatchingEngine(manyRules);
    const score = customEngine.scoreMatch({}, {});

    expect(score.reasons.length).toBe(5);
    // Ordered descending: 30, 25, 20, 15, 10
    expect(score.reasons.map(r => r.points)).toEqual([30, 25, 20, 15, 10]);
  });

  it('R4: Applicants do not affect Skill Gap (evaluated against Members only)', () => {
    const student = {
      profile: {
        skills: ['Docker'],
        specialty: 'DevOps',
      },
    };

    const project = {
      requiredSkills: ['React', 'Docker'],
      positions: [{ specialty: 'DevOps', headcount: 1, filledCount: 0 }],
    };

    // If candidate is evaluated with only Applicants (which should NOT be passed in),
    // or when teamMembers list represents only accepted members:
    const teamMembersWithoutDocker = [
      { profile: { skills: ['React'] } }, // Accepted member without Docker
    ];

    const scoreWithMembers = engine.scoreMatch(student, project, teamMembersWithoutDocker);
    const fillsGapReason = scoreWithMembers.reasons.find(r => r.rule === 'fillsSkillGap');

    expect(fillsGapReason).toBeDefined();
    expect(fillsGapReason.text).toContain('Fills skill gap: Docker');

    // If an applicant (not accepted) happened to have Docker, but they are NOT in teamMembers,
    // Docker is still properly identified as a gap for the candidate to fill.
  });

  it('R4: tie-break is deterministic across multiple ranking invocations', () => {
    const student = {
      id: 's1',
      profile: {
        skills: ['React', 'Python'],
        specialty: 'Frontend',
        weeklyAvailability: 10,
        timezone: 'UTC',
      },
    };

    // Two projects with identical score and skills
    const candidateList = [
      {
        project: {
          id: 'proj-b',
          title: 'Project B',
          requiredSkills: ['React'],
          commitmentLevel: 'medium',
          positions: [{ specialty: 'Frontend', headcount: 1, filledCount: 0 }],
          timezone: 'UTC',
          updatedAt: '2026-10-01T12:00:00Z',
        },
        teamMembers: [],
      },
      {
        project: {
          id: 'proj-a',
          title: 'Project A',
          requiredSkills: ['React'],
          commitmentLevel: 'medium',
          positions: [{ specialty: 'Frontend', headcount: 1, filledCount: 0 }],
          timezone: 'UTC',
          updatedAt: '2026-10-01T12:00:00Z',
        },
        teamMembers: [],
      },
    ];

    const run1 = rankProjectsForStudent(student, candidateList);
    const run2 = rankProjectsForStudent(student, candidateList);

    expect(run1.map(r => r.project.id)).toEqual(run2.map(r => r.project.id));
    // Due to deterministic id sort when scores & dates are tied:
    expect(run1[0].project.id).toBe('proj-a');
    expect(run1[1].project.id).toBe('proj-b');
  });

  it('R4: rankStudentsForProject ranks candidate students for a project deterministically', () => {
    const project = {
      id: 'proj-1',
      title: 'ML System',
      requiredSkills: ['Python', 'PyTorch'],
      commitmentLevel: 'medium',
      positions: [{ specialty: 'ML', headcount: 1, filledCount: 0 }],
      timezone: 'UTC',
    };

    const students = [
      {
        id: 's-low',
        name: 'Bob',
        profile: { skills: ['HTML'], specialty: 'Frontend', weeklyAvailability: 5, timezone: 'UTC' },
      },
      {
        id: 's-high',
        name: 'Alice',
        profile: { skills: ['Python', 'PyTorch'], specialty: 'ML', weeklyAvailability: 15, timezone: 'UTC' },
      },
    ];

    const ranked = rankStudentsForProject(project, [], students);
    expect(ranked.length).toBe(2);
    expect(ranked[0].student.id).toBe('s-high');
    expect(ranked[0].match.totalScore).toBeGreaterThan(ranked[1].match.totalScore);
  });

  it('OCP (Decision D2): new scoring rules plug in seamlessly without engine modification', () => {
    const customRule = {
      name: 'hackathonBadgeBonus',
      evaluate: (student) => {
        if (student?.profile?.hasHackathonBadge) {
          return { points: 15, reason: 'Hackathon Badge Veteran' };
        }
        return null;
      },
    };

    const engineWithPlugin = new MatchingEngine([...engine.rules, customRule]);
    const student = {
      profile: {
        skills: ['React'],
        hasHackathonBadge: true,
      },
    };

    const score = engineWithPlugin.scoreMatch(student, { requiredSkills: ['React'] });
    const badgeReason = score.reasons.find(r => r.rule === 'hackathonBadgeBonus');

    expect(badgeReason).toBeDefined();
    expect(badgeReason.points).toBe(15);
  });
});
