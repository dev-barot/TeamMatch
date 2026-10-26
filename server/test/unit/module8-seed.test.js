import { buildSeedDataset } from '../../src/infrastructure/mongo/seedM08.js';
import matchingCases from '../fixtures/matching-cases.json' with { type: 'json' };

describe('Module 8: Seed & Matching Validation', () => {
  it('M8: buildSeedDataset produces a realistic full dataset', () => {
    const dataset = buildSeedDataset();

    expect(dataset.students.length).toBeGreaterThanOrEqual(50);
    expect(dataset.students.length).toBeLessThanOrEqual(100);
    expect(dataset.projects.length).toBeGreaterThanOrEqual(20);
    expect(dataset.projects.length).toBeLessThanOrEqual(30);
    expect(dataset.students.every(student => student.account && student.account.isSeed === true)).toBe(true);
    expect(dataset.projects.some(project => project.courseTag)).toBe(true);
    expect(dataset.applications.length).toBeGreaterThanOrEqual(20);
  });

  it('M8: matching benchmark fixture contains 20 handcrafted cases', () => {
    expect(Array.isArray(matchingCases)).toBe(true);
    expect(matchingCases).toHaveLength(20);
    expect(matchingCases.every(entry => entry.student && entry.project && entry.expectedRank)).toBe(true);
  });
});
