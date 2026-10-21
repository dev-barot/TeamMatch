import { SCORING_WEIGHTS } from '../weights.js';

function getTimeZoneOffsetHours(timeZone) {
  if (!timeZone) return null;
  try {
    const now = new Date();
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone }));
    return (tzDate.getTime() - utcDate.getTime()) / SCORING_WEIGHTS.MS_PER_HOUR;
  } catch {
    return null;
  }
}

/**
 * Scoring Rule: Timezone Close
 * +10 points if the Student's timezone is within +-2 hours of the Project / Creator timezone.
 * Reason text example: "Timezone within 2 hours"
 */
export const timezoneClose = {
  name: 'timezoneClose',
  evaluate(student, project, teamMembers = []) {
    const studentTz = student?.profile?.timezone;
    if (!studentTz) {
      return null;
    }

    // Reference timezone: project.timezone, project.creatorTimezone, or first team member
    const referenceTz =
      project?.timezone ||
      project?.creatorTimezone ||
      teamMembers[0]?.profile?.timezone ||
      'UTC';

    const studentOffset = getTimeZoneOffsetHours(studentTz);
    const referenceOffset = getTimeZoneOffsetHours(referenceTz);

    if (studentOffset === null || referenceOffset === null) {
      return null;
    }

    const delta = Math.abs(studentOffset - referenceOffset);

    if (delta <= SCORING_WEIGHTS.TIMEZONE_MAX_DELTA_HOURS) {
      return {
        points: SCORING_WEIGHTS.TIMEZONE_CLOSE,
        reason: `Timezone within ${SCORING_WEIGHTS.TIMEZONE_MAX_DELTA_HOURS} hours`,
      };
    }

    return null;
  },
};
