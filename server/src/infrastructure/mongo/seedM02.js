import { Project } from '../../domain/projects/Project.js';
import { Position } from '../../domain/projects/Position.js';
import { CourseTag } from '../../domain/projects/CourseTag.js';
import { Specialty } from '../../domain/identity/Specialty.js';
import { CommitmentLevel } from '../../domain/projects/CommitmentLevel.js';

export function createHandcraftedProjects(creatorId = 'student_seed_creator') {
  return [
    new Project({
      id: 'proj_rover_01',
      title: 'Autonomous Campus Delivery Rover',
      description: 'Building a scaled autonomous rover capable of navigating between university buildings for micro-deliveries. Looking for robotics and computer vision enthusiasts.',
      creatorId,
      category: 'Hackathon',
      commitmentLevel: CommitmentLevel.HIGH,
      requiredSkills: ['Python', 'ROS2', 'Computer Vision', 'PyTorch'],
      positions: [
        new Position({ specialty: Specialty.ML, headcount: 2 }),
        new Position({ specialty: Specialty.BACKEND, headcount: 1 }),
        new Position({ specialty: Specialty.DEVOPS, headcount: 1 }),
      ],
      courseTag: new CourseTag({ courseCode: 'CS680', term: 'Fall 2026' }),
    }),

    new Project({
      id: 'proj_fintech_02',
      title: 'Fintech Peer-to-Peer Microloans Platform',
      description: 'Decentralized micro-lending portal tailored for college students needing textbook and project equipment micro-grants with transparent credit scoring.',
      creatorId,
      category: 'Startup',
      commitmentLevel: CommitmentLevel.MEDIUM,
      requiredSkills: ['Node.js', 'React', 'MongoDB', 'Financial Modeling'],
      positions: [
        new Position({ specialty: Specialty.BACKEND, headcount: 2 }),
        new Position({ specialty: Specialty.FRONTEND, headcount: 1 }),
        new Position({ specialty: Specialty.UI_UX, headcount: 1 }),
      ],
      courseTag: new CourseTag({ courseCode: 'FIN401', term: 'Fall 2026' }),
    }),

    new Project({
      id: 'proj_collab_03',
      title: 'Real-Time Collaborative Code Editor',
      description: 'In-browser pair programming environment with CRDT operational transform, terminal multiplexing, and low-latency audio sharing.',
      creatorId,
      category: 'Class Project',
      commitmentLevel: CommitmentLevel.MEDIUM,
      requiredSkills: ['TypeScript', 'WebSockets', 'React', 'Docker'],
      positions: [
        new Position({ specialty: Specialty.FRONTEND, headcount: 2 }),
        new Position({ specialty: Specialty.BACKEND, headcount: 1 }),
      ],
      courseTag: new CourseTag({ courseCode: 'CS530', term: 'Fall 2026' }),
    }),
  ];
}
