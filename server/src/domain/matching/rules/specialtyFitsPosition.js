import { SCORING_WEIGHTS } from '../weights.js';

/**
 * Scoring Rule: Specialty Fits Position
 * +15 points if an open Position on the Project matches the Student's primary Specialty.
 * Reason text example: "Fills open Backend position"
 */
export const specialtyFitsPosition = {
  name: 'specialtyFitsPosition',
  evaluate(student, project) {
    const candidateSpecialty = student?.profile?.specialty;
    if (!candidateSpecialty) {
      return null;
    }

    const positions = project?.positions || [];
    const openMatchingPosition = positions.find(pos => {
      const remaining = pos.remaining !== undefined
        ? pos.remaining
        : (pos.headcount - (pos.filledCount || 0));

      return remaining > 0 && pos.specialty === candidateSpecialty;
    });

    if (!openMatchingPosition) {
      return null;
    }

    return {
      points: SCORING_WEIGHTS.SPECIALTY_FITS_POSITION,
      reason: `Fills open ${candidateSpecialty} position`,
    };
  },
};
