import { skillOverlap } from './skillOverlap.js';
import { fillsSkillGap } from './fillsSkillGap.js';
import { specialtyFitsPosition } from './specialtyFitsPosition.js';
import { timezoneClose } from './timezoneClose.js';
import { availabilityFits } from './availabilityFits.js';
import { workingStyleCompatible } from './workingStyleCompatible.js';

export {
  skillOverlap,
  fillsSkillGap,
  specialtyFitsPosition,
  timezoneClose,
  availabilityFits,
  workingStyleCompatible,
};

/**
 * Default registered Scoring Rules list.
 * Open/Closed Principle (Decision D2):
 * New rules can be plugged into this list without modifying the MatchingEngine.
 */
export const DEFAULT_SCORING_RULES = Object.freeze([
  skillOverlap,
  fillsSkillGap,
  specialtyFitsPosition,
  timezoneClose,
  availabilityFits,
  workingStyleCompatible,
]);
