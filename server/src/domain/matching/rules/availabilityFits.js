import { SCORING_WEIGHTS, COMMITMENT_HOURS } from '../weights.js';

/**
 * Scoring Rule: Availability Fits
 * +10 points if the Student's weekly availability meets or exceeds 50% of the Commitment Level expectation.
 * Reason text example: "Available 10h/week for a medium commitment"
 */
export const availabilityFits = {
  name: 'availabilityFits',
  evaluate(student, project) {
    const weeklyAvailability = student?.profile?.weeklyAvailability;
    if (weeklyAvailability === undefined || weeklyAvailability === null) {
      return null;
    }

    const commitmentLevel = project?.commitmentLevel || 'medium';
    const targetHours = COMMITMENT_HOURS[commitmentLevel] || COMMITMENT_HOURS.medium;
    const requiredThreshold = targetHours * SCORING_WEIGHTS.AVAILABILITY_MIN_RATIO;

    if (weeklyAvailability >= requiredThreshold) {
      return {
        points: SCORING_WEIGHTS.AVAILABILITY_FITS,
        reason: `Available ${weeklyAvailability}h/week for a ${commitmentLevel} commitment`,
      };
    }

    return null;
  },
};
