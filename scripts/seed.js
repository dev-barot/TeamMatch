import { InMemoryStudentRepository } from '../server/src/infrastructure/mongo/InMemoryStudentRepository.js';
import { InMemoryProjectRepository } from '../server/src/infrastructure/mongo/InMemoryProjectRepository.js';
import { InMemoryApplicationRepository } from '../server/src/infrastructure/mongo/InMemoryApplicationRepository.js';
import { seedDevelopmentDataset } from '../server/src/infrastructure/mongo/seedM08.js';

async function main() {
  const studentRepository = new InMemoryStudentRepository();
  const projectRepository = new InMemoryProjectRepository();
  const applicationRepository = new InMemoryApplicationRepository();

  const dataset = await seedDevelopmentDataset({
    studentRepository,
    projectRepository,
    applicationRepository,
  });

  console.log(`Seeded ${dataset.students.length} students, ${dataset.projects.length} projects, and ${dataset.applications.length} applications.`);
  console.log('All seeded Accounts are marked isSeed=true for analytics exclusion.');
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
