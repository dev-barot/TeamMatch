import { Account } from '../../domain/identity/Account.js';
import { Student } from '../../domain/identity/Student.js';
import { Profile } from '../../domain/identity/Profile.js';
import { Specialty } from '../../domain/identity/Specialty.js';
import { WorkingStyle } from '../../domain/identity/WorkingStyle.js';
import { Project } from '../../domain/projects/Project.js';
import { Position } from '../../domain/projects/Position.js';
import { CourseTag } from '../../domain/projects/CourseTag.js';
import { CommitmentLevel } from '../../domain/projects/CommitmentLevel.js';
import { Application } from '../../domain/applications/Application.js';
import { ApplicationStatus } from '../../domain/applications/ApplicationStatus.js';
import { Origin } from '../../domain/applications/Origin.js';

const STUDENT_TEMPLATES = [
  { name: 'Ava Patel', specialty: Specialty.BACKEND, skills: ['Node.js', 'PostgreSQL', 'Docker', 'TypeScript'], availability: 15, timezone: 'UTC', workingStyle: WorkingStyle.COLLABORATIVE },
  { name: 'Leo Martin', specialty: Specialty.FRONTEND, skills: ['React', 'CSS', 'Figma', 'TypeScript'], availability: 12, timezone: 'America/New_York', workingStyle: WorkingStyle.DETAIL_ORIENTED },
  { name: 'Maya Chen', specialty: Specialty.ML, skills: ['Python', 'PyTorch', 'SQL', 'TensorFlow'], availability: 18, timezone: 'Asia/Singapore', workingStyle: WorkingStyle.FAST_PACED },
  { name: 'Noah Rivera', specialty: Specialty.DEVOPS, skills: ['Docker', 'Kubernetes', 'Linux', 'CI/CD'], availability: 16, timezone: 'UTC', workingStyle: WorkingStyle.INDEPENDENT },
  { name: 'Iris Johnson', specialty: Specialty.UI_UX, skills: ['Figma', 'User Research', 'Design Systems', 'Illustration'], availability: 10, timezone: 'Europe/London', workingStyle: WorkingStyle.DETAIL_ORIENTED },
  { name: 'Samir Ali', specialty: Specialty.BACKEND, skills: ['Java', 'Spring Boot', 'Redis', 'Kafka'], availability: 14, timezone: 'Europe/Berlin', workingStyle: WorkingStyle.COLLABORATIVE },
  { name: 'Zoe Park', specialty: Specialty.FRONTEND, skills: ['React', 'Next.js', 'GraphQL', 'Accessibility'], availability: 13, timezone: 'America/Los_Angeles', workingStyle: WorkingStyle.COLLABORATIVE },
  { name: 'Kai Nakamura', specialty: Specialty.ML, skills: ['Python', 'MLflow', 'Scikit-learn', 'Pandas'], availability: 17, timezone: 'Asia/Tokyo', workingStyle: WorkingStyle.FAST_PACED },
];

const PROJECT_TEMPLATES = [
  {
    title: 'Campus Event Planner',
    description: 'A collaborative event planning platform for student clubs, volunteer scheduling, and RSVP analytics.',
    category: 'Class Project',
    commitmentLevel: CommitmentLevel.MEDIUM,
    requiredSkills: ['React', 'Node.js', 'SQL'],
    positions: [
      { specialty: Specialty.FRONTEND, headcount: 2 },
      { specialty: Specialty.BACKEND, headcount: 1 },
    ],
    courseTag: { courseCode: 'CS420', term: 'Fall 2026' },
  },
  {
    title: 'Open Source Resource Hub',
    description: 'A searchable platform for course resources, notes, and mentorship matching across departments.',
    category: 'Open Source',
    commitmentLevel: CommitmentLevel.LOW,
    requiredSkills: ['React', 'Figma', 'Accessibility'],
    positions: [
      { specialty: Specialty.FRONTEND, headcount: 1 },
      { specialty: Specialty.UI_UX, headcount: 1 },
    ],
    courseTag: { courseCode: 'INFO310', term: 'Fall 2026' },
  },
  {
    title: 'AI Study Buddy',
    description: 'Personalized study assistant using recommendations, revision tracking, and spaced repetition.',
    category: 'Hackathon',
    commitmentLevel: CommitmentLevel.HIGH,
    requiredSkills: ['Python', 'PyTorch', 'React', 'SQL'],
    positions: [
      { specialty: Specialty.ML, headcount: 2 },
      { specialty: Specialty.BACKEND, headcount: 1 },
    ],
    courseTag: { courseCode: 'CS680', term: 'Fall 2026' },
  },
  {
    title: 'SaaS Billing Dashboard',
    description: 'Revenue dashboard for independent creators, integrating pricing, subscriptions, and lifetime metrics.',
    category: 'Startup',
    commitmentLevel: CommitmentLevel.MEDIUM,
    requiredSkills: ['Node.js', 'React', 'Docker'],
    positions: [
      { specialty: Specialty.BACKEND, headcount: 2 },
      { specialty: Specialty.FRONTEND, headcount: 1 },
    ],
    courseTag: { courseCode: 'BUS310', term: 'Fall 2026' },
  },
  {
    title: 'Logistics Ops Visualiser',
    description: 'Operations dashboard for managing campus inventory movements and last-mile deliveries.',
    category: 'Class Project',
    commitmentLevel: CommitmentLevel.MEDIUM,
    requiredSkills: ['Docker', 'Kubernetes', 'SQL'],
    positions: [
      { specialty: Specialty.DEVOPS, headcount: 1 },
      { specialty: Specialty.BACKEND, headcount: 1 },
    ],
    courseTag: { courseCode: 'CS510', term: 'Fall 2026' },
  },
  {
    title: 'Peer Review Platform',
    description: 'Feedback workflow for course assignments, code reviews, and rubric-based evaluation.',
    category: 'Class Project',
    commitmentLevel: CommitmentLevel.LOW,
    requiredSkills: ['React', 'Node.js', 'Figma'],
    positions: [
      { specialty: Specialty.FRONTEND, headcount: 1 },
      { specialty: Specialty.UI_UX, headcount: 1 },
    ],
    courseTag: { courseCode: 'EDU220', term: 'Fall 2026' },
  },
];

function createSeedStudent(index) {
  const template = STUDENT_TEMPLATES[(index - 1) % STUDENT_TEMPLATES.length];
  const studentNumber = String(index).padStart(3, '0');

  return new Student({
    id: `seed_student_${studentNumber}`,
    name: `${template.name} ${index}`,
    account: new Account({
      email: `seed${studentNumber}@demo.teammatch.dev`,
      passwordHash: `seed_hash_${studentNumber}`,
      accountType: 'student',
      isEmailVerified: true,
      isActive: true,
      isSeed: true,
    }),
    profile: new Profile({
      skills: template.skills,
      specialty: template.specialty,
      weeklyAvailability: template.availability,
      timezone: template.timezone,
      workingStyle: template.workingStyle,
      experienceLevel: index % 3 === 0 ? 'advanced' : index % 2 === 0 ? 'intermediate' : 'beginner',
      bio: 'Seed dataset participant for Module 8 validation.',
    }),
  });
}

function createSeedProject(index, creatorId) {
  const template = PROJECT_TEMPLATES[(index - 1) % PROJECT_TEMPLATES.length];
  const projectNumber = String(index).padStart(3, '0');

  return new Project({
    id: `seed_project_${projectNumber}`,
    title: `${template.title} ${index}`,
    description: template.description,
    creatorId,
    requiredSkills: template.requiredSkills,
    positions: template.positions.map((position, positionIndex) => new Position({
      id: `seed_pos_${projectNumber}_${positionIndex + 1}`,
      specialty: position.specialty,
      headcount: position.headcount,
      filledCount: 0,
    })),
    commitmentLevel: template.commitmentLevel,
    category: template.category,
    courseTag: new CourseTag(template.courseTag),
    createdAt: new Date(Date.now() - (index * 86400000)),
    updatedAt: new Date(Date.now() - (index * 3600000)),
  });
}

function createSeedApplications(projects, students) {
  const applications = [];
  const statuses = [ApplicationStatus.PENDING, ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN];
  const seenPairs = new Set();

  for (let i = 0; i < Math.min(projects.length, 12); i += 1) {
    const project = projects[i];
    const student = students[(i * 3 + 1) % students.length];
    const pairKey = `${project.id}:${student.id}`;

    if (seenPairs.has(pairKey)) {
      continue;
    }
    seenPairs.add(pairKey);

    const status = statuses[i % statuses.length];
    applications.push(new Application({
      id: `seed_app_${String(i + 1).padStart(3, '0')}`,
      projectId: project.id,
      studentId: student.id,
      specialty: project.positions[0]?.specialty || Specialty.BACKEND,
      origin: i % 2 === 0 ? Origin.APPLIED : Origin.INVITED,
      status,
      rejectionReason: status === ApplicationStatus.REJECTED ? 'not_a_fit' : null,
      createdAt: new Date(Date.now() - (i + 1) * 3600000),
      updatedAt: new Date(Date.now() - (i + 1) * 1800000),
    }));
  }

  // Add a few additional pending applications using unique student/project pairs.
  for (let i = 0; i < 10; i += 1) {
    const project = projects[(i + 5) % projects.length];
    const student = students[(i * 5 + 7) % students.length];
    const pairKey = `${project.id}:${student.id}`;

    if (seenPairs.has(pairKey)) {
      continue;
    }
    seenPairs.add(pairKey);

    applications.push(new Application({
      id: `seed_app_pending_${String(i + 20).padStart(3, '0')}`,
      projectId: project.id,
      studentId: student.id,
      specialty: project.positions[0]?.specialty || Specialty.FRONTEND,
      origin: Origin.APPLIED,
      status: ApplicationStatus.PENDING,
      createdAt: new Date(Date.now() - (i + 2) * 7200000),
      updatedAt: new Date(Date.now() - (i + 2) * 3600000),
    }));
  }

  return applications;
}

export function buildSeedDataset() {
  const students = [];
  const projects = [];

  const totalStudents = 64;
  const totalProjects = 24;

  for (let index = 1; index <= totalStudents; index += 1) {
    students.push(createSeedStudent(index));
  }

  const creator = students[0];
  for (let index = 1; index <= totalProjects; index += 1) {
    const project = createSeedProject(index, creator.id);
    projects.push(project);
  }

  return {
    students,
    projects,
    applications: createSeedApplications(projects, students),
  };
}

export async function seedDevelopmentDataset({
  studentRepository,
  projectRepository,
  applicationRepository,
} = {}) {
  const dataset = buildSeedDataset();

  if (studentRepository) {
    for (const student of dataset.students) {
      await studentRepository.save(student);
    }
  }

  if (projectRepository) {
    for (const project of dataset.projects) {
      await projectRepository.save(project);
    }
  }

  if (applicationRepository) {
    for (const application of dataset.applications) {
      await applicationRepository.save(application);
    }
  }

  return dataset;
}
