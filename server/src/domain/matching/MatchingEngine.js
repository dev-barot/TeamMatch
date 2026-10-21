import { SCORING_WEIGHTS } from './weights.js';
import { DEFAULT_SCORING_RULES } from './rules/index.js';

/**
 * Pure Domain Matching Engine
 * Evaluates candidate-project pairings against pluggable scoring rules.
 * 
 * Enforces Rule R4:
 * 1. Every point in Match Score has an explainable Reason.
 * 2. No points without Reason, no Reason without points.
 * 3. At most 5 Reasons are returned, ordered by points descending.
 * 4. Skill Gaps and style compatibility are evaluated ONLY against accepted Members, never Applicants.
 */
export class MatchingEngine {
  constructor(rules = DEFAULT_SCORING_RULES) {
    this.rules = rules;
  }

  /**
   * Evaluates a Student against a Project and its accepted team members.
   * 
   * @param {Object} student - Student entity or DTO with profile
   * @param {Object} project - Project entity or DTO with requiredSkills, positions, etc.
   * @param {Array} teamMembers - ONLY accepted team members (Rule R4)
   * @returns {{ totalScore: number, reasons: Array<{ rule: string, points: number, text: string }> }}
   */
  scoreMatch(student, project, teamMembers = []) {
    if (!student || !project) {
      return { totalScore: 0, reasons: [] };
    }

    const collectedReasons = [];
    let totalScore = 0;

    for (const rule of this.rules) {
      const evaluation = rule.evaluate(student, project, teamMembers);
      if (evaluation && typeof evaluation.points === 'number' && evaluation.points > 0 && evaluation.reason) {
        totalScore += evaluation.points;
        collectedReasons.push({
          rule: rule.name,
          points: evaluation.points,
          text: evaluation.reason,
        });
      }
    }

    // Rule R4: Order reasons descending by points awarded
    collectedReasons.sort((a, b) => b.points - a.points);

    // Rule R4: Keep at most MAX_REASONS (top 5)
    const topReasons = collectedReasons.slice(0, SCORING_WEIGHTS.MAX_REASONS);

    return {
      totalScore,
      reasons: topReasons,
    };
  }
}
