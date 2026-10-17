/**
 * Skill Value Object
 * Normalized case-insensitively, trimmed, and deduplicated.
 */
export class Skill {
  /**
   * Normalizes a single skill string (trimmed, lowercased for comparison, capitalized representation).
   * @param {string} skill
   * @returns {string}
   */
  static normalize(skill) {
    if (typeof skill !== 'string') {
      return '';
    }
    const trimmed = skill.trim();
    if (!trimmed) return '';
    // Standardize casing: Title Case or preserve capitalized acronyms
    return trimmed.toLowerCase();
  }

  /**
   * Normalizes an array of skills, removing duplicates and empty strings.
   * @param {string[]} skills
   * @returns {string[]}
   */
  static normalizeList(skills) {
    if (!Array.isArray(skills)) {
      return [];
    }
    const seen = new Set();
    const result = [];

    for (const item of skills) {
      const normalized = Skill.normalize(item);
      if (normalized && !seen.has(normalized)) {
        seen.add(normalized);
        result.push(normalized);
      }
    }

    return result;
  }
}
