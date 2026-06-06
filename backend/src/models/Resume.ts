import mongoose, { Schema, Document } from 'mongoose';

export interface IEducation {
  degree: string;
  college: string;
  startYear: string;
  endYear: string;
  cgpa: string;
}

export interface IExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface IProject {
  name: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  liveUrl: string;
}

export interface ISkill {
  category: string;
  skills: string[];
}

export interface ICertification {
  name: string;
  issuer: string;
  date: string;
}

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  template: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    linkedin: string;
    github: string;
    portfolio: string;
  };
  summary: string;
  education: IEducation[];
  experience: IExperience[];
  projects: IProject[];
  skills: ISkill[];
  certifications: ICertification[];
  achievements: string[];
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<IResume>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Resume title is required'],
    trim: true,
    default: 'Untitled Resume',
  },
  template: {
    type: String,
    default: 'tmpl_01',
  },
  personalInfo: {
    fullName: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    portfolio: { type: String, default: '' },
  },
  summary: { type: String, default: '' },
  education: [
    {
      degree: { type: String, default: '' },
      college: { type: String, default: '' },
      startYear: { type: String, default: '' },
      endYear: { type: String, default: '' },
      cgpa: { type: String, default: '' },
    },
  ],
  experience: [
    {
      company: { type: String, default: '' },
      position: { type: String, default: '' },
      startDate: { type: String, default: '' },
      endDate: { type: String, default: '' },
      description: { type: String, default: '' },
    },
  ],
  projects: [
    {
      name: { type: String, default: '' },
      description: { type: String, default: '' },
      technologies: [{ type: String }],
      githubUrl: { type: String, default: '' },
      liveUrl: { type: String, default: '' },
    },
  ],
  skills: [
    {
      category: { type: String, default: '' },
      skills: [{ type: String }],
    },
  ],
  certifications: [
    {
      name: { type: String, default: '' },
      issuer: { type: String, default: '' },
      date: { type: String, default: '' },
    },
  ],
  achievements: [{ type: String }],
}, {
  timestamps: true,
});

export const Resume = mongoose.model<IResume>('Resume', resumeSchema);
