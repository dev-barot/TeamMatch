import fs from 'fs';
import { buildSeedDataset } from '../../src/infrastructure/mongo/seedM08.js';

const matchingCases = JSON.parse(
  fs.readFileSync(new URL('../fixtures/matching-cases.json', import.meta.url), 'utf8')
);

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
