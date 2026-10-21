import { SCORING_WEIGHTS } from '../weights.js';

/**
 * Scoring Rule: Skill Overlap
 * 0 to 50 points based on proportion of required project skills matched by the student.
 * Rule R4: Reason text example: "Has 3 of 4 required skills (React, Node, SQL)"
 */
export const skillOverlap = {
  name: 'skillOverlap',
  evaluate(student, project) {
    const requiredSkills = project?.requiredSkills || [];
    if (requiredSkills.length === 0) {
      return null;
    }

    const studentSkills = new Set(
      (student?.profile?.skills || []).map(s => s.toLowerCase().trim())
    );

    const matched = requiredSkills.filter(s =>
      studentSkills.has(s.toLowerCase().trim())
    );

    if (matched.length === 0) {
      return null;
    }

    const ratio = matched.length / requiredSkills.length;
    const points = Math.round(SCORING_WEIGHTS.SKILL_OVERLAP_MAX * ratio);

    if (points <= 0) {
      return null;
    }

    return {
      points,
      reason: `Has ${matched.length} of ${requiredSkills.length} required skills (${matched.join(', ')})`,
    };
  },
};
