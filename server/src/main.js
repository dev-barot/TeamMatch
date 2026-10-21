import dotenv from 'dotenv';
import { createApp } from './http/app.js';
import { InMemoryStudentRepository } from './infrastructure/mongo/InMemoryStudentRepository.js';
import { InMemoryProjectRepository } from './infrastructure/mongo/InMemoryProjectRepository.js';
import { createHandcraftedProjects } from './infrastructure/mongo/seedM02.js';
import { Student } from './domain/identity/Student.js';
import { Account } from './domain/identity/Account.js';
import { Profile } from './domain/identity/Profile.js';

dotenv.config();

const port = process.env.PORT || 4000;

// Initialize default development repositories with seeds
const studentRepository = new InMemoryStudentRepository();
const projectRepository = new InMemoryProjectRepository();

// Seed verified student creator for local demo
const demoCreator = new Student({
  id: 'student_seed_creator',
  name: 'Sarah Connor',
  account: new Account({
    email: 'sarah.creator@university.edu',
    passwordHash: 'seeded_hash',
    isEmailVerified: true,
  }),
  profile: new Profile({
    specialty: 'Backend',
    skills: ['python', 'node.js', 'docker'],
    weeklyAvailability: 20,
    bio: 'CS Senior passionate about robotics, distributed systems, and team leadership.',
  }),
});
await studentRepository.save(demoCreator);

// Seed 3 handcrafted projects for eyeball inspection (Step 8 of M02)
for (const project of createHandcraftedProjects(demoCreator.id)) {
  await projectRepository.save(project);
}

const app = createApp({
  studentRepository,
  projectRepository,
});

app.listen(port, () => {
  console.log(`TeamMatch server running on port ${port} (env: ${process.env.NODE_ENV || 'development'})`);
  console.log('Seeded 3 handcrafted projects for eyeball inspection in live app.');
});
