/**
 * Centralized Scoring Weights for Matching Engine (Rule R4 / OCP).
 * 
 * DESIGN REQUIREMENT:
 * This is the ONLY file where numeric scoring constants, multipliers,
 * point values, and thresholds reside.
 * Individual ScoringRule implementations import these constants,
 * ensuring no magic numbers leak into rule files.
 */
export const SCORING_WEIGHTS = Object.freeze({
  // Maximum points for skill overlap (scaled by matched / required)
  SKILL_OVERLAP_MAX: 50,

  // Bonus for each unique skill gap filled relative to existing accepted Members
  FILLS_SKILL_GAP: 15,

  // Bonus if student's specialty matches an open position with remaining capacity
  SPECIALTY_FITS_POSITION: 15,

  // Bonus if student's timezone is within delta threshold of creator / team
  TIMEZONE_CLOSE: 10,
  TIMEZONE_MAX_DELTA_HOURS: 2,

  // Bonus if student's weekly availability meets or exceeds the required commitment ratio
  AVAILABILITY_FITS: 10,
  AVAILABILITY_MIN_RATIO: 0.5,

  // Bonus if working style is compatible with existing accepted Members (only when >= 1 Member exists)
  WORKING_STYLE_COMPATIBLE: 10,

  // Time conversion constants
  MS_PER_HOUR: 3600000,

  // Maximum explainable reasons displayed per match (Rule R4)
  MAX_REASONS: 5,
});

/**
 * Expected baseline weekly hours per project commitment level.
 * Centralized here so no numbers leak into availabilityFits rule.
 */
export const COMMITMENT_HOURS = Object.freeze({
  low: 5,
  medium: 10,
  high: 20,
});
