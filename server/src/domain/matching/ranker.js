import { MatchingEngine } from './MatchingEngine.js';

function countSkillOverlap(skillsA = [], skillsB = []) {
  const setA = new Set(skillsA.map(s => s.toLowerCase().trim()));
  let count = 0;
  for (const s of skillsB) {
    if (setA.has(s.toLowerCase().trim())) {
      count += 1;
    }
  }
  return count;
}

/**
 * Deterministic tie-breaking comparison for match results (Rule R4).
 * Hierarchy:
 * 1. Score descending
 * 2. Overlapping skills count descending
 * 3. Recent update timestamp descending
 * 4. Identifier / Alphabetical ascending
 */
function compareMatchResults(a, b) {
  if (b.match.totalScore !== a.match.totalScore) {
    return b.match.totalScore - a.match.totalScore;
  }

  if (b.overlapCount !== a.overlapCount) {
    return b.overlapCount - a.overlapCount;
  }

  const timeA = new Date(a.updatedAt || 0).getTime();
  const timeB = new Date(b.updatedAt || 0).getTime();
  if (timeB !== timeA) {
    return timeB - timeA;
  }

  return String(a.id).localeCompare(String(b.id));
}

/**
 * Ranks Project postings for a given Student.
 * Top 10 by default, with deterministic tie-breaking.
 */
export function rankProjectsForStudent(student, candidateList, limit = 10, engine = new MatchingEngine()) {
  const studentSkills = student?.profile?.skills || [];

  const scored = candidateList.map(({ project, teamMembers = [] }) => {
    const match = engine.scoreMatch(student, project, teamMembers);
    const overlapCount = countSkillOverlap(studentSkills, project?.requiredSkills || []);

    return {
      id: project.id,
      project,
      teamMembers,
      match,
      overlapCount,
      updatedAt: project.updatedAt || project.createdAt,
    };
  });

  scored.sort(compareMatchResults);

  return scored.slice(0, limit).map(({ project, match, teamMembers }) => ({
    project,
    match,
    teamMembersCount: teamMembers.length,
  }));
}

/**
 * Ranks Student candidates for a given Project.
 * Top 20 by default, with deterministic tie-breaking.
 */
export function rankStudentsForProject(project, teamMembers, studentList, limit = 20, engine = new MatchingEngine()) {
  const projectSkills = project?.requiredSkills || [];

  const scored = studentList.map(student => {
    const match = engine.scoreMatch(student, project, teamMembers);
    const studentSkills = student?.profile?.skills || [];
    const overlapCount = countSkillOverlap(studentSkills, projectSkills);

    return {
      id: student.id,
      student,
      match,
      overlapCount,
      updatedAt: student.updatedAt || student.createdAt,
    };
  });

  scored.sort(compareMatchResults);

  return scored.slice(0, limit).map(({ student, match }) => ({
    student,
    match,
  }));
}
