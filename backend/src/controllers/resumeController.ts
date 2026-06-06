import { Request, Response } from 'express';
import { Resume } from '../models/Resume';
import { asyncHandler } from '../utils/asyncHandler';

const SAMPLE_TEMPLATES = ['tmpl_01', 'tmpl_03', 'tmpl_05', 'tmpl_06', 'tmpl_10', 'tmpl_12', 'tmpl_14', 'tmpl_17', 'tmpl_21', 'tmpl_34'];

export const getResumes = asyncHandler(async (req: Request, res: Response) => {
  const resumes = await Resume.find({ userId: req.userId }).sort({ updatedAt: -1 }).select('-__v');
  res.json({ resumes });
});

export const getResume = asyncHandler(async (req: Request, res: Response) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.userId });
  if (!resume) {
    res.status(404).json({ message: 'Resume not found' });
    return;
  }
  res.json({ resume });
});

export const createResume = asyncHandler(async (req: Request, res: Response) => {
  const { userId, ...safeBody } = req.body;
  const resume = await Resume.create({ userId: req.userId, ...safeBody });
  res.status(201).json({ message: 'Resume created', resume });
});

export const updateResume = asyncHandler(async (req: Request, res: Response) => {
  const { userId, ...safeBody } = req.body;
  const resume = await Resume.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    safeBody,
    { new: true, runValidators: true },
  );
  if (!resume) {
    res.status(404).json({ message: 'Resume not found' });
    return;
  }
  res.json({ message: 'Resume updated', resume });
});

export const deleteResume = asyncHandler(async (req: Request, res: Response) => {
  const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!resume) {
    res.status(404).json({ message: 'Resume not found' });
    return;
  }
  res.json({ message: 'Resume deleted' });
});

export const duplicateResume = asyncHandler(async (req: Request, res: Response) => {
  const original = await Resume.findOne({ _id: req.params.id, userId: req.userId });
  if (!original) {
    res.status(404).json({ message: 'Resume not found' });
    return;
  }

  const doc = original.toObject();
  delete (doc as any)._id;
  delete (doc as any).createdAt;
  delete (doc as any).updatedAt;
  doc.title = `${original.title} (Copy)`;

  const resume = await Resume.create(doc);
  res.status(201).json({ message: 'Resume duplicated', resume });
});

const sampleResumeData = () => ({
  title: 'Sample Resume',
  template: SAMPLE_TEMPLATES[Math.floor(Math.random() * SAMPLE_TEMPLATES.length)],
  personalInfo: {
    fullName: 'Alexandra Chen',
    email: 'alex.chen@example.com',
    phone: '+1 (415) 555-0182',
    address: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexchen',
    github: 'github.com/alexchen',
    portfolio: 'alexchen.dev',
  },
  summary: 'Senior full-stack engineer with 6+ years building scalable web applications at high-growth startups. Expert in React, TypeScript, Node.js, and cloud infrastructure. Led teams delivering products serving 2M+ users. Passionate about developer experience and system architecture.',
  education: [
    { degree: 'B.S. Computer Science', college: 'University of California, Berkeley', startYear: '2014', endYear: '2018', cgpa: '3.7/4.0' },
  ],
  experience: [
    { company: 'Stripe', position: 'Senior Software Engineer', startDate: 'Jun 2021', endDate: 'Present', description: 'Architected and built real-time payment processing pipeline handling $500M+ monthly volume. Reduced p99 latency by 40% through query optimization and caching. Mentored 4 junior engineers.' },
    { company: 'Airbnb', position: 'Full-Stack Developer', startDate: 'Sep 2018', endDate: 'May 2021', description: 'Developed search and recommendation engine serving 100M+ queries daily. Migrated legacy Ruby monolith to microservices architecture. Improved CI/CD pipeline reducing deployment time by 60%.' },
  ],
  projects: [
    { name: 'KafkaFlow', description: 'Open-source stream processing framework for Node.js. 2.5k GitHub stars. Built schema registry and dead-letter queue handling.', technologies: ['Node.js', 'Kafka', 'Docker', 'TypeScript'], githubUrl: '', liveUrl: '' },
    { name: 'DevMetrics', description: 'Developer productivity dashboard aggregating GitHub, Jira, and PagerDuty data. Adopted by 3 engineering teams.', technologies: ['React', 'GraphQL', 'PostgreSQL', 'AWS'], githubUrl: '', liveUrl: '' },
  ],
  skills: [
    { category: 'Languages', skills: ['TypeScript', 'Python', 'Go', 'SQL'] },
    { category: 'Frontend', skills: ['React', 'Next.js', 'Tailwind CSS', 'Redux'] },
    { category: 'Backend', skills: ['Node.js', 'Express', 'GraphQL', 'gRPC'] },
    { category: 'Cloud & DevOps', skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'] },
  ],
  certifications: [
    { name: 'AWS Solutions Architect Professional', issuer: 'Amazon Web Services', date: '2023' },
    { name: 'Google Cloud Professional Data Engineer', issuer: 'Google Cloud', date: '2022' },
  ],
  achievements: [
    'Led successful migration of 50+ microservices from EC2 to EKS with zero downtime',
    'Reduced cloud infrastructure costs by 35% ($2M annual savings) through reserved instances and auto-scaling',
    'Presented "Building Resilient Systems" at ReactConf 2023',
  ],
});

export const generateSample = asyncHandler(async (req: Request, res: Response) => {
  const resume = await Resume.create({ userId: req.userId, ...sampleResumeData() });
  res.status(201).json({ message: 'Sample resume created', resume });
});
