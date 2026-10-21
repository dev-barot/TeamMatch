import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCORING_WEIGHTS } from '../../src/domain/matching/weights.js';
import {
  skillOverlap,
  fillsSkillGap,
  specialtyFitsPosition,
  timezoneClose,
  availabilityFits,
  workingStyleCompatible,
} from '../../src/domain/matching/rules/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Domain: Scoring Rules Isolation & Weights Cleanliness', () => {
  describe('Rule Cleanliness (OCP / Centralized Weights Requirement)', () => {
    it('verifies that no numeric literals > 1 exist in any rule implementation file', () => {
      const rulesDir = path.resolve(__dirname, '../../src/domain/matching/rules');
      const files = fs.readdirSync(rulesDir).filter(f => f.endsWith('.js') && f !== 'index.js');

      // Regex matching standalone numbers > 1
      const numericLiteralRegex = /(?<![a-zA-Z0-9_$])([2-9]|\d{2,})(?![a-zA-Z0-9_$])/g;

      const violations = [];

      for (const file of files) {
        const filePath = path.join(rulesDir, file);
        const content = fs.readFileSync(filePath, 'utf8');

        // Remove comments and string literals so comments/strings don't trigger false positives
        const codeOnly = content
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/\/\/.*/g, '');

        const matches = codeOnly.match(numericLiteralRegex);
        if (matches) {
          violations.push({ file, matches });
        }
      }

      expect(violations).toEqual([]);
    });
  });

  describe('skillOverlap Rule', () => {
    const project = { requiredSkills: ['React', 'Node.js', 'PostgreSQL', 'Docker'] };

    it('returns exact proportional points and reason for partial match', () => {
      const student = { profile: { skills: ['React', 'Node.js'] } };
      const result = skillOverlap.evaluate(student, project);

      expect(result).not.toBeNull();
      // 2 / 4 = 0.5 * 50 = 25
      expect(result.points).toBe(25);
      expect(result.reason).toBe('Has 2 of 4 required skills (React, Node.js)');
    });

    it('returns maximum 50 points when 100% of skills are matched', () => {
      const student = { profile: { skills: ['react', 'NODE.JS', 'postgresql', 'docker', 'python'] } };
      const result = skillOverlap.evaluate(student, project);

      expect(result).not.toBeNull();
      expect(result.points).toBe(SCORING_WEIGHTS.SKILL_OVERLAP_MAX);
    });

    it('returns null when 0 skills match', () => {
      const student = { profile: { skills: ['Figma', 'UI/UX'] } };
      expect(skillOverlap.evaluate(student, project)).toBeNull();
    });
  });

  describe('fillsSkillGap Rule', () => {
    const project = { requiredSkills: ['React', 'Docker', 'Kubernetes'] };

    it('returns points and reason for skills missing across existing team members', () => {
      const teamMembers = [
        { profile: { skills: ['React'] } },
      ];
      // Team only has React; Docker and Kubernetes are gaps
      const student = { profile: { skills: ['Docker', 'AWS'] } };
      const result = fillsSkillGap.evaluate(student, project, teamMembers);

      expect(result).not.toBeNull();
      expect(result.points).toBe(SCORING_WEIGHTS.FILLS_SKILL_GAP);
      expect(result.reason).toBe('Fills skill gap: Docker');
    });

    it('returns null if existing team already covers all required skills', () => {
      const teamMembers = [
        { profile: { skills: ['React', 'Docker', 'Kubernetes'] } },
      ];
      const student = { profile: { skills: ['Docker'] } };
      expect(fillsSkillGap.evaluate(student, project, teamMembers)).toBeNull();
    });
  });

  describe('specialtyFitsPosition Rule', () => {
    const project = {
      positions: [
        { specialty: 'Backend', headcount: 2, filledCount: 1, remaining: 1 },
        { specialty: 'Frontend', headcount: 1, filledCount: 1, remaining: 0 },
      ],
    };

    it('returns points when student specialty matches an open position with remaining seats', () => {
      const student = { profile: { specialty: 'Backend' } };
      const result = specialtyFitsPosition.evaluate(student, project);

      expect(result).not.toBeNull();
      expect(result.points).toBe(SCORING_WEIGHTS.SPECIALTY_FITS_POSITION);
      expect(result.reason).toBe('Fills open Backend position');
    });

    it('returns null when matching position is already full', () => {
      const student = { profile: { specialty: 'Frontend' } };
      expect(specialtyFitsPosition.evaluate(student, project)).toBeNull();
    });
  });

  describe('timezoneClose Rule', () => {
    it('returns points when timezone difference is within 2 hours', () => {
      const student = { profile: { timezone: 'Europe/London' } };
      const project = { timezone: 'Europe/Paris' }; // 1h delta

      const result = timezoneClose.evaluate(student, project);
      expect(result).not.toBeNull();
      expect(result.points).toBe(SCORING_WEIGHTS.TIMEZONE_CLOSE);
      expect(result.reason).toBe('Timezone within 2 hours');
    });

    it('returns null when timezone difference exceeds 2 hours', () => {
      const student = { profile: { timezone: 'America/New_York' } };
      const project = { timezone: 'Asia/Tokyo' };

      expect(timezoneClose.evaluate(student, project)).toBeNull();
    });
  });

  describe('availabilityFits Rule', () => {
    it('returns points when student weekly availability is >= 50% of commitment', () => {
      const project = { commitmentLevel: 'medium' }; // medium = 10h, threshold = 5h
      const student = { profile: { weeklyAvailability: 8 } };

      const result = availabilityFits.evaluate(student, project);
      expect(result).not.toBeNull();
      expect(result.points).toBe(SCORING_WEIGHTS.AVAILABILITY_FITS);
      expect(result.reason).toBe('Available 8h/week for a medium commitment');
    });

    it('returns null when availability is below 50%', () => {
      const project = { commitmentLevel: 'high' }; // high = 20h, threshold = 10h
      const student = { profile: { weeklyAvailability: 4 } };

      expect(availabilityFits.evaluate(student, project)).toBeNull();
    });
  });

  describe('workingStyleCompatible Rule', () => {
    it('returns null when 0 accepted members exist (Rule R4 requirement)', () => {
      const student = { profile: { workingStyle: 'collaborative' } };
      const project = {};
      const teamMembers = [];

      expect(workingStyleCompatible.evaluate(student, project, teamMembers)).toBeNull();
    });

    it('returns points and reason when >= 1 accepted member exists', () => {
      const student = { profile: { workingStyle: 'collaborative' } };
      const project = {};
      const teamMembers = [
        { profile: { workingStyle: 'collaborative' } },
      ];

      const result = workingStyleCompatible.evaluate(student, project, teamMembers);
      expect(result).not.toBeNull();
      expect(result.points).toBe(SCORING_WEIGHTS.WORKING_STYLE_COMPATIBLE);
      expect(result.reason).toBe('Working style complements the Team');
    });
  });
});
