import { Skill } from '../shared/Skill.js';
import { Specialty } from './Specialty.js';
import { WorkingStyle } from './WorkingStyle.js';
import { InvalidProfileDataError } from './errors.js';

export const EXPERIENCE_LEVELS = Object.freeze(['beginner', 'intermediate', 'advanced']);

export class Profile {
  constructor({
    skills = [],
    specialty = Specialty.OTHER,
    weeklyAvailability = 10,
    timezone = 'UTC',
    workingStyle = WorkingStyle.COLLABORATIVE,
    experienceLevel = 'intermediate',
    bio = '',
  } = {}) {
    this.skills = Skill.normalizeList(skills);
    this.specialty = this._validateSpecialty(specialty);
    this.weeklyAvailability = this._validateAvailability(weeklyAvailability);
    this.timezone = this._validateTimezone(timezone);
    this.workingStyle = this._validateWorkingStyle(workingStyle);
    this.experienceLevel = this._validateExperienceLevel(experienceLevel);
    this.bio = this._validateBio(bio);
  }

  _validateBio(bio) {
    if (typeof bio !== 'string') {
      return '';
    }
    if (bio.length > 500) {
      throw new InvalidProfileDataError('Bio must not exceed 500 characters.');
    }
    return bio.trim();
  }

  _validateAvailability(hours) {
    const parsed = Number(hours);
    if (isNaN(parsed) || parsed < 0) {
      throw new InvalidProfileDataError('Weekly availability must be a positive number.');
    }
    return parsed;
  }

  _validateTimezone(tz) {
    if (!tz || typeof tz !== 'string') {
      return 'UTC';
    }
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz });
      return tz;
    } catch {
      throw new InvalidProfileDataError(`Invalid IANA timezone: "${tz}".`);
    }
  }

  _validateSpecialty(s) {
    if (!Specialty.isValid(s)) {
      throw new InvalidProfileDataError(`Invalid Specialty "${s}". Must be one of: ${Specialty.VALUES.join(', ')}`);
    }
    return s;
  }

  _validateWorkingStyle(style) {
    if (!WorkingStyle.isValid(style)) {
      throw new InvalidProfileDataError(`Invalid Working Style "${style}". Must be one of: ${WorkingStyle.VALUES.join(', ')}`);
    }
    return style;
  }

  _validateExperienceLevel(level) {
    if (!EXPERIENCE_LEVELS.includes(level)) {
      throw new InvalidProfileDataError(`Invalid Experience Level "${level}". Must be one of: ${EXPERIENCE_LEVELS.join(', ')}`);
    }
    return level;
  }

  toJSON() {
    return {
      skills: this.skills,
      specialty: this.specialty,
      weeklyAvailability: this.weeklyAvailability,
      timezone: this.timezone,
      workingStyle: this.workingStyle,
      experienceLevel: this.experienceLevel,
      bio: this.bio,
    };
  }
}
