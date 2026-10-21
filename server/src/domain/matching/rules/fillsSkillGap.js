import { SCORING_WEIGHTS } from '../weights.js';

/**
 * Scoring Rule: Fills Skill Gap
 * +15 points per missing project required skill that existing accepted Members lack.
 * Rule R4: Skill Gaps are judged only against Members, never Applicants.
 * Reason text example: "Fills skill gap: Docker"
 */
export const fillsSkillGap = {
  name: 'fillsSkillGap',
  evaluate(student, project, teamMembers = []) {
    const requiredSkills = project?.requiredSkills || [];
    if (requiredSkills.length === 0) {
      return null;
    }

    // Covered skills by currently accepted team members
    const teamSkills = new Set();
    for (const member of teamMembers) {
      const skills = member?.profile?.skills || [];
      for (const skill of skills) {
        teamSkills.add(skill.toLowerCase().trim());
      }
    }

    // Required skills missing across the team (gaps)
    const skillGaps = requiredSkills.filter(
      req => !teamSkills.has(req.toLowerCase().trim())
    );

    if (skillGaps.length === 0) {
      return null;
    }

    const studentSkills = new Set(
      (student?.profile?.skills || []).map(s => s.toLowerCase().trim())
    );

    // Gaps the candidate can fill
    const filledGaps = skillGaps.filter(gap =>
      studentSkills.has(gap.toLowerCase().trim())
    );

    if (filledGaps.length === 0) {
      return null;
    }

    const points = filledGaps.length * SCORING_WEIGHTS.FILLS_SKILL_GAP;

    return {
      points,
      reason: `Fills skill gap: ${filledGaps.join(', ')}`,
    };
  },
};
