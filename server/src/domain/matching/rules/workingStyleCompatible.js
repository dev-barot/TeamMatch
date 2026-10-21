import { SCORING_WEIGHTS } from '../weights.js';

/**
 * Scoring Rule: Working Style Compatible
 * +10 points only when >= 1 accepted Member exists and candidate's working style fits or complements the team.
 * Rule R4: Judged against Members only, never Applicants.
 * Reason text example: "Working style complements the Team"
 */
export const workingStyleCompatible = {
  name: 'workingStyleCompatible',
  evaluate(student, project, teamMembers = []) {
    // Rule R4: Only evaluated when at least 1 accepted Member exists
    if (!teamMembers || teamMembers.length === 0) {
      return null;
    }

    const candidateStyle = student?.profile?.workingStyle;
    if (!candidateStyle) {
      return null;
    }

    // Flexible style complements any group composition
    if (candidateStyle === 'flexible') {
      return {
        points: SCORING_WEIGHTS.WORKING_STYLE_COMPATIBLE,
        reason: 'Working style complements the Team',
      };
    }

    // Check if at least one existing member has compatible or shared style
    const memberStyles = teamMembers
      .map(m => m?.profile?.workingStyle)
      .filter(Boolean);

    const isCompatible =
      memberStyles.includes(candidateStyle) ||
      memberStyles.includes('flexible') ||
      memberStyles.length > 0;

    if (isCompatible) {
      return {
        points: SCORING_WEIGHTS.WORKING_STYLE_COMPATIBLE,
        reason: 'Working style complements the Team',
      };
    }

    return null;
  },
};
